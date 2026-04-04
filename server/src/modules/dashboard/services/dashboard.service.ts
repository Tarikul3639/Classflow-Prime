import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Enrollment, EnrollmentDocument } from '../../../database/entities/enrollment.entity';
import { EnrollmentRole } from '../../../database/interface/enrollment.interface';
import { Class, ClassDocument } from '../../../database/entities/class.entity';
import { ClassUpdate, ClassUpdateDocument } from '../../../database/entities/update.entity';
import { Material, MaterialDocument } from '../../../database/entities/material.entity';
import { Faculty, FacultyDocument } from '../../../database/entities/faculty.entity';
import { ClassGroup, GroupDocument } from '../../../database/entities/group.entity';

import { IClass } from '../../../database/interface/class.interface';
import { IClassUpdate } from '../../../database/interface/update.interface';
import { IFaculty } from '../../../database/interface/faculty.interface';
import { IClassGroup } from '../../../database/interface/group.interface';
import { IMaterial } from '../../../database/interface/material.interface';

import {
    DashboardResponseDto,
    DashboardClassDto,
    DashboardUpdateDto,
    DashboardFacultyDto,
    DashboardGroupDto,
    DashboardMaterialDto,
} from '../dto/dashboard.dto';

// ─── Internal populated types ─────────────────────────────────────────────────

interface PopulatedInstructor {
    name: string;
}

interface PopulatedClass extends Omit<IClass, 'instructorId'> {
    _id: Types.ObjectId;
    instructorId: PopulatedInstructor;
}

interface PopulatedEnrollment extends Omit<EnrollmentDocument, 'classId'> {
    classId: PopulatedClass;
}

interface StudentCountAggResult {
    _id: Types.ObjectId;
    count: number;
}

@Injectable()
export class DashboardService {
    constructor(
        @InjectModel(Enrollment.name)
        private readonly enrollmentModel: Model<EnrollmentDocument>,

        @InjectModel(Class.name)
        private readonly classModel: Model<ClassDocument>,

        @InjectModel(ClassUpdate.name)
        private readonly updateModel: Model<ClassUpdateDocument>,

        @InjectModel(Material.name)
        private readonly materialModel: Model<MaterialDocument>,

        @InjectModel(Faculty.name)
        private readonly facultyModel: Model<FacultyDocument>,

        @InjectModel(ClassGroup.name)
        private readonly groupModel: Model<GroupDocument>,
    ) { }

    async execute(userId: string): Promise<DashboardResponseDto> {
        const userObjectId = new Types.ObjectId(userId);

        // ── Step 1: Collect all classes this user belongs to ──────────────────
        //
        // Enrollment only stores LEARNER and ASSISTANT roles.
        // Instructors are identified via Class.instructorId directly.
        // Query both sources in parallel, then union their class IDs.

        const [enrollments, instructedClasses] = await Promise.all([
            // Classes where user is a LEARNER or ASSISTANT
            this.enrollmentModel
                .find({
                    userId: userObjectId,
                    role: { $in: [EnrollmentRole.LEARNER, EnrollmentRole.ASSISTANT] },
                })
                .populate<{ classId: PopulatedClass }>({
                    path: 'classId',
                    populate: { path: 'instructorId', select: 'name' },
                })
                .lean<PopulatedEnrollment[]>(),

            // Classes where user is the instructor
            this.classModel
                .find({ instructorId: userObjectId })
                .populate<{ instructorId: PopulatedInstructor }>('instructorId', 'name')
                .lean<PopulatedClass[]>(),
        ]);

        // IDs from enrollment
        const enrolledClassIds = enrollments
            .map((e) => e.classId?._id)
            .filter(Boolean) as Types.ObjectId[];

        // Instructed classes — deduplicate against enrolled ones
        const enrolledIdSet = new Set(enrolledClassIds.map((id) => id.toString()));
        const uniqueInstructedClasses = instructedClasses.filter(
            (cls) => !enrolledIdSet.has((cls._id as Types.ObjectId).toString()),
        );
        const instructedClassIds = uniqueInstructedClasses.map(
            (cls) => cls._id as Types.ObjectId,
        );

        // Union of all class IDs
        const classIds = [...enrolledClassIds, ...instructedClassIds];

        // ── Step 2: Parallel queries ──────────────────────────────────────────
        const [updates, faculty, groups, studentCounts] = await Promise.all([
            this.updateModel
                .find({ classId: { $in: classIds } })
                .sort({ isPinned: -1, createdAt: -1 })
                .limit(10)
                .lean<IClassUpdate[]>(),

            this.facultyModel
                .find({ classId: { $in: classIds } })
                .lean<IFaculty[]>(),

            this.groupModel
                .find({ classId: { $in: classIds } })
                .lean<IClassGroup[]>(),

            // Only count LEARNER role as students
            this.enrollmentModel.aggregate<StudentCountAggResult>([
                {
                    $match: {
                        classId: { $in: classIds },
                        role: EnrollmentRole.LEARNER,
                    },
                },
                { $group: { _id: '$classId', count: { $sum: 1 } } },
            ]),
        ]);

        // ── Step 3: Populate materials for updates that have them ─────────────
        const updateIds = updates
            .filter((u) => u.materials?.length > 0)
            .map((u) => u._id as Types.ObjectId);

        const materials: IMaterial[] = updateIds.length
            ? await this.materialModel
                .find({ updateId: { $in: updateIds } })
                .lean<IMaterial[]>()
            : [];

        // ── Step 4: Lookup maps ───────────────────────────────────────────────
        const studentCountMap = new Map<string, number>(
            studentCounts.map((s) => [s._id.toString(), s.count]),
        );

        const materialsByUpdate = new Map<string, IMaterial[]>();
        for (const mat of materials) {
            const key = (mat.updateId as Types.ObjectId).toString();
            if (!materialsByUpdate.has(key)) materialsByUpdate.set(key, []);
            materialsByUpdate.get(key)!.push(mat);
        }

        // Class name map — built from both sources
        const classNameMap = new Map<string, string>([
            ...enrollments.map((e): [string, string] => [
                e.classId?._id?.toString(),
                e.classId?.name ?? 'Unknown',
            ]),
            ...uniqueInstructedClasses.map((cls): [string, string] => [
                (cls._id as Types.ObjectId).toString(),
                cls.name ?? 'Unknown',
            ]),
        ]);

        // ── Step 5: Shape DTOs ────────────────────────────────────────────────

        const enrolledClassDto: DashboardClassDto[] = enrollments.map((e) => {
            const cls = e.classId;
            return {
                _id: cls._id.toString(),
                name: cls.name,
                department: cls.department,
                semester: cls.semester,
                themeColor: cls.themeColor ?? '',
                coverImage: cls.coverImage ?? null,
                status: cls.status,
                allowEnroll: cls.allowEnroll ?? true,
                instructorName: cls.instructorId?.name ?? 'Unknown',
                studentCount: studentCountMap.get(cls._id.toString()) ?? 0,
            };
        });

        const instructedClassDto: DashboardClassDto[] = uniqueInstructedClasses.map((cls) => ({
            _id: (cls._id as Types.ObjectId).toString(),
            name: cls.name,
            department: cls.department,
            semester: cls.semester,
            themeColor: cls.themeColor ?? '',
            coverImage: cls.coverImage ?? null,
            status: cls.status,
            allowEnroll: cls.allowEnroll ?? true,
            instructorName: cls.instructorId?.name ?? 'Unknown',
            studentCount: studentCountMap.get((cls._id as Types.ObjectId).toString()) ?? 0,
        }));

        const classDto: DashboardClassDto[] = [
            ...enrolledClassDto,
            ...instructedClassDto,
        ];

        const updateDto: DashboardUpdateDto[] = updates.map((u) => {
            const mats: DashboardMaterialDto[] = (
                materialsByUpdate.get((u._id as Types.ObjectId).toString()) ?? []
            ).map((m) => ({
                _id: (m._id as Types.ObjectId).toString(),
                url: m.url,
                name: m.name,
                type: m.type,
                size: (m as IMaterial & { size?: number }).size,
            }));

            return {
                _id: (u._id as Types.ObjectId).toString(),
                classId: (u.classId as Types.ObjectId).toString(),
                className: classNameMap.get((u.classId as Types.ObjectId).toString()) ?? 'Unknown',
                title: u.title,
                description: u.description,
                category: u.category,
                eventAt: u.eventAt ? (u.eventAt as Date).toISOString() : null,
                materials: mats,
                isPinned: (u as IClassUpdate & { isPinned: boolean }).isPinned,
                postedBy: (u.postedBy as Types.ObjectId)?.toString() ?? '',
                createdAt: (u as IClassUpdate & { createdAt: Date }).createdAt.toISOString(),
                updatedAt: (u as IClassUpdate & { updatedAt: Date }).updatedAt.toISOString(),
            };
        });

        const facultyDto: DashboardFacultyDto[] = faculty.map((f) => ({
            _id: (f._id as Types.ObjectId).toString(),
            classId: (f.classId as Types.ObjectId).toString(),
            name: f.name,
            avatarUrl: f.avatarUrl ?? null,
            designation: f.designation,
            location: f.location,
            email: f.email,
            phone: f.phone ?? null,
            classroomCode: f.classroomCode ?? null,
        }));

        const groupDto: DashboardGroupDto[] = groups.map((g) => ({
            _id: (g._id as Types.ObjectId).toString(),
            classId: (g.classId as Types.ObjectId).toString(),
            name: g.name,
            description: g.description ?? '',
            link: g.link,
            platform: g.platform,
            uiConfig: g.uiConfig ?? undefined,
            memberCount: studentCountMap.get((g.classId as Types.ObjectId).toString()) ?? 0,
        }));

        return {
            success: true,
            message: 'Dashboard data fetched successfully',
            data: {
                classes: classDto,
                updates: updateDto,
                faculty: facultyDto,
                groups: groupDto,
            },
        };
    }
}