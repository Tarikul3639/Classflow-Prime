import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Enrollment, EnrollmentDocument } from '../../../database/entities/enrollment.entity';
import { EnrollmentRole } from '../../../database/interface/enrollment.interface';
import { ClassUpdate, ClassUpdateDocument } from '../../../database/entities/update.entity';
import { Material, MaterialDocument } from '../../../database/entities/material.entity';
import { Faculty, FacultyDocument } from '../../../database/entities/faculty.entity';
import { ClassGroup, GroupDocument } from '../../../database/entities/group.entity';

import {
    DashboardResponseDto,
    DashboardClassDto,
    DashboardUpdateDto,
    DashboardFacultyDto,
    DashboardGroupDto,
    DashboardMaterialDto,
} from '../dto/dashboard.dto';

@Injectable()
export class DashboardService {
    constructor(
        @InjectModel(Enrollment.name)
        private readonly enrollmentModel: Model<EnrollmentDocument>,

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

        // ── Step 1: Enrolled classes ──────────────────────────────────────────
        const enrollments = await this.enrollmentModel
            .find({ userId: userObjectId })
            .populate<{ classId: any }>({
                path: 'classId',
                populate: { path: 'instructorId', select: 'name' },
            })
            .lean();

        const classIds = enrollments
            .map((e) => e.classId?._id)
            .filter(Boolean) as Types.ObjectId[];

        // ── Step 2: Parallel queries ──────────────────────────────────────────
        const [updates, faculty, groups, studentCounts] = await Promise.all([
            this.updateModel
                .find({ classId: { $in: classIds } })
                .sort({ isPinned: -1, createdAt: -1 })
                .limit(10)
                .lean(),

            this.facultyModel
                .find({ classId: { $in: classIds } })
                .lean(),

            this.groupModel
                .find({ classId: { $in: classIds } })
                .lean(),

            this.enrollmentModel.aggregate<{ _id: Types.ObjectId; count: number }>([
                { $match: { classId: { $in: classIds }, role: EnrollmentRole.LEARNER } },
                { $group: { _id: '$classId', count: { $sum: 1 } } },
            ]),
        ]);

        // ── Step 3: Populate materials for updates that have them ─────────────
        const updateIds = updates
            .filter((u) => u.materials?.length > 0)
            .map((u) => u._id);

        const materials = updateIds.length
            ? await this.materialModel.find({ updateId: { $in: updateIds } }).lean()
            : [];

        // ── Step 4: Lookup maps ───────────────────────────────────────────────
        const studentCountMap = new Map(
            studentCounts.map((s) => [s._id.toString(), s.count]),
        );

        const materialsByUpdate = new Map<string, MaterialDocument[]>();
        for (const mat of materials) {
            const key = (mat as any).updateId.toString();
            if (!materialsByUpdate.has(key)) materialsByUpdate.set(key, []);
            materialsByUpdate.get(key)!.push(mat as any);
        }

        const classNameMap = new Map(
            enrollments.map((e) => [
                e.classId?._id?.toString(),
                e.classId?.name ?? 'Unknown',
            ]),
        );

        // ── Step 5: Shape DTOs ────────────────────────────────────────────────
        const classDto: DashboardClassDto[] = enrollments.map((e) => {
            const cls = e.classId as any;
            return {
                _id: cls._id.toString(),
                name: cls.name,
                enrollCode: cls.enrollCode,
                department: cls.department,
                semester: cls.semester,
                themeColor: cls.themeColor,
                coverImage: cls.coverImage ?? null,
                status: cls.status,
                allowEnroll: cls.allowEnroll,
                instructorName: cls.instructorId?.name ?? 'Unknown',
                studentCount: studentCountMap.get(cls._id.toString()) ?? 0,
            };
        });

        const updateDto: DashboardUpdateDto[] = updates.map((u) => {
            const mats: DashboardMaterialDto[] = (
                materialsByUpdate.get(u._id.toString()) ?? []
            ).map((m: any) => ({
                _id: m._id.toString(),
                url: m.url,
                name: m.name,
                type: m.type,
                size: m.size,
            }));

            return {
                _id: u._id.toString(),
                classId: u.classId.toString(),
                className: classNameMap.get(u.classId.toString()) ?? 'Unknown',
                title: u.title,
                description: u.description,
                category: u.category,
                eventAt: u.eventAt ? (u.eventAt as Date).toISOString() : null,
                materials: mats,
                isPinned: u.isPinned,
                postedBy: u.postedBy?.toString() ?? '',
                createdAt: (u as any).createdAt.toISOString(),
                updatedAt: (u as any).updatedAt.toISOString(),
            };
        });

        const facultyDto: DashboardFacultyDto[] = faculty.map((f: any) => ({
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

        const groupDto: DashboardGroupDto[] = groups.map((g: any) => ({
            _id: g._id.toString(),
            classId: g.classId.toString(),
            name: g.name,
            description: g.description,
            link: g.link,
            platform: g.platform,
            uiConfig: g.uiConfig ?? undefined,
            memberCount: studentCountMap.get(g.classId.toString()) ?? 0,
        }));

        return {
            classes: classDto,
            updates: updateDto,
            faculty: facultyDto,
            groups: groupDto,
        };
    }
}