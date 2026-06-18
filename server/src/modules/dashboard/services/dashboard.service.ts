import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Enrollment, EnrollmentDocument } from '../../../infrastructure/database/entities/enrollment.entity';
import { EnrollmentRole } from '../../../infrastructure/database/interface/enrollment.interface';
import { Class, ClassDocument } from '../../../infrastructure/database/entities/class.entity';
import { ClassStatus } from '../../../infrastructure/database/interface/class.interface';
import { ClassUpdate, ClassUpdateDocument } from '../../../infrastructure/database/entities/update.entity';
import { Material, MaterialDocument } from '../../../infrastructure/database/entities/material.entity';
import { Faculty, FacultyDocument } from '../../../infrastructure/database/entities/faculty.entity';
import { ClassGroup, GroupDocument } from '../../../infrastructure/database/entities/group.entity';

import { IMaterial } from '../../../infrastructure/database/interface/material.interface';

import {
    DashboardResponseDto,
    DashboardClassDto,
    DashboardUpdateDto,
    DashboardFacultyDto,
    DashboardGroupDto,
    DashboardMaterialDto,
} from '../dto/dashboard.dto';

type LeanUser = {
    _id: Types.ObjectId;
    name: string;
};

type LeanInstructorEnrollment = {
    classId: Types.ObjectId;
    userId: LeanUser;
};

type StudentCountAggResult = {
    _id: Types.ObjectId;
    count: number;
};

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

        // 1) Get every class the current user belongs to.
        const memberships = await this.enrollmentModel
            .find({ userId: userObjectId })
            .populate<{
                classId: {
                    _id: Types.ObjectId;
                    name: string;
                    department?: string;
                    semester?: string;
                    themeColor?: string;
                    coverImage?: string | null;
                    status: ClassStatus;
                    allowEnroll?: boolean;
                }
            }>('classId')
            .lean()
            .exec();

        const activeMemberships = memberships.filter(
            (m) => m.classId && m.classId.status !== ClassStatus.ENDED,
        );

        const classIds = Array.from(
            new Set(
                activeMemberships
                    .map((m) => m.classId?._id?.toString())
                    .filter((id): id is string => Boolean(id)),
            ),
        ).map((id) => new Types.ObjectId(id));

        if (classIds.length === 0) {
            return {
                success: true,
                message: 'Dashboard data fetched successfully',
                data: {
                    classes: [],
                    updates: [],
                    faculty: [],
                    groups: [],
                },
            };
        }

        // 2) Fetch classes, instructor enrollments, updates, faculty, groups, and counts in parallel.
        const [classes, instructorEnrollments, updates, faculty, groups, studentCounts] =
            await Promise.all([
                this.classModel
                    .find({ _id: { $in: classIds }, status: { $ne: ClassStatus.ENDED } })
                    .lean()
                    .exec(),

                this.enrollmentModel
                    .find({
                        classId: { $in: classIds },
                        role: EnrollmentRole.INSTRUCTOR,
                    })
                    .populate<{ userId: LeanUser }>('userId', 'name')
                    .lean<LeanInstructorEnrollment[]>()
                    .exec(),

                this.updateModel
                    .find({
                        classId: { $in: classIds },
                        $or: [
                            { eventAt: { $exists: false } },
                            { eventAt: { $gte: new Date() } },
                        ],
                    })
                    .sort({ isPinned: -1, createdAt: -1 })
                    .limit(10)
                    .lean()
                    .exec(),

                this.facultyModel
                    .find({ classId: { $in: classIds } })
                    .lean<FacultyDocument[]>()
                    .exec(),

                this.groupModel
                    .find({ classId: { $in: classIds } })
                    .lean<GroupDocument[]>()
                    .exec(),

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

        // 3) Fetch materials for the visible updates.
        const updateIds = updates
            .filter((u) => (u as { materials?: Types.ObjectId[] }).materials?.length)
            .map((u) => u._id);

        const materials: IMaterial[] = updateIds.length
            ? await this.materialModel
                .find({ updateId: { $in: updateIds } })
                .lean()
                .exec()
            : [];

        // 4) Build lookup maps.
        const studentCountMap = new Map<string, number>(
            studentCounts.map((s) => [s._id.toString(), s.count]),
        );

        const materialsByUpdate = new Map<string, IMaterial[]>();
        for (const material of materials) {
            const key = material.updateId.toString();
            const bucket = materialsByUpdate.get(key) ?? [];
            bucket.push(material);
            materialsByUpdate.set(key, bucket);
        }

        const classNameMap = new Map<string, string>(
            classes.map((cls) => [cls._id.toString(), cls.className ?? 'Unknown']),
        );

        const instructorNameMap = new Map<string, string>(
            instructorEnrollments.map((row) => [
                row.classId.toString(),
                row.userId?.name ?? 'Unknown',
            ]),
        );

        // 5) Shape DTOs.
        const classDto: DashboardClassDto[] = classes.map((cls) => ({
            _id: cls._id.toString(),
            className: cls.className,
            department: cls.department,
            semester: cls.semester,
            themeColor: cls.themeColor ?? '',
            coverImage: cls.coverImage ?? null,
            status: cls.status,
            allowEnroll: cls.allowEnroll ?? true,
            instructorName: instructorNameMap.get(cls._id.toString()) ?? 'Unknown',
            studentCount: studentCountMap.get(cls._id.toString()) ?? 0,
        }));

        const updateDto: DashboardUpdateDto[] = updates.map((u) => {
            const mats: DashboardMaterialDto[] = (
                materialsByUpdate.get(u._id.toString()) ?? []
            ).map((m) => ({
                _id: m._id.toString(),
                url: m.url,
                name: m.name ?? undefined,
                type: m.type,
                size: m.size ?? undefined,
            }));

            return {
                _id: u._id.toString(),
                classId: u.classId.toString(),
                className: classNameMap.get(u.classId.toString()) ?? 'Unknown',
                title: u.title,
                description: u.description,
                category: u.category,
                eventAt: u.eventAt ? u.eventAt.toISOString() : null,
                materials: mats,
                isPinned: u.isPinned,
                postedBy: u.postedBy.toString(),
                createdAt: u.createdAt.toISOString(),
                updatedAt: u.updatedAt.toISOString(),
            };
        });

        const facultyDto: DashboardFacultyDto[] = faculty.map((f) => ({
            _id: f._id.toString(),
            classId: f.classId.toString(),
            name: f.name,
            avatarUrl: f.avatarUrl ?? null,
            designation: f.designation,
            location: f.location,
            email: f.email,
            phone: f.phone ?? null,
            classroomCode: f.classroomCode ?? null,
        }));

        const groupDto: DashboardGroupDto[] = groups.map((g) => ({
            _id: g._id.toString(),
            classId: g.classId.toString(),
            name: g.name,
            description: g.description ?? '',
            link: g.link,
            platform: g.platform,
            uiConfig: g.uiConfig ?? undefined,
            memberCount: studentCountMap.get(g.classId.toString()) ?? 0,
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