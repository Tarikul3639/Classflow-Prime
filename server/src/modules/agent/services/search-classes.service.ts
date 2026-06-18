import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
    Enrollment,
    EnrollmentDocument,
} from 'src/infrastructure/database/entities/enrollment.entity';
import { ClassStatus } from 'src/infrastructure/database/interface/class.interface';
import { EnrollmentRole } from 'src/infrastructure/database/interface/enrollment.interface';
import { SearchClassesResponseDto } from '../dto/search-classes.dto';

@Injectable()
export class SearchClassesService {
    constructor(
        @InjectModel(Enrollment.name)
        private readonly enrollmentModel: Model<EnrollmentDocument>,
    ) { }

    async execute(userId: string, query = ''): Promise<SearchClassesResponseDto> {
        const trimmedQuery = query.trim();

        const enrollments = await this.enrollmentModel
            .find({
                userId: new Types.ObjectId(userId),
                role: {
                    $in: [EnrollmentRole.INSTRUCTOR, EnrollmentRole.ASSISTANT],
                },
            })
            .populate<{
                classId: { _id: string; className: string; status: ClassStatus };
            }>({
                path: 'classId',
                select: '_id className status',
                match: {
                    status: ClassStatus.ACTIVE,
                    ...(trimmedQuery
                        ? { className: { $regex: trimmedQuery, $options: 'i' } }
                        : {}),
                },
            })
            .lean()
            .exec();

        const classMap = new Map<string, { _id: string; className: string }>();

        for (const enrollment of enrollments) {
            const cls = enrollment.classId;
            if (cls && cls._id && cls.className) {
                classMap.set(cls._id.toString(), {
                    _id: cls._id.toString(),
                    className: cls.className,
                });
            }
        }

        return {
            success: true,
            message: 'Classes loaded successfully',
            data: {
                classes: Array.from(classMap.values()),
            },
        };
    }
}
