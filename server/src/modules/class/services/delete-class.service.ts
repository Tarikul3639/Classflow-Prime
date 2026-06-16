// delete-class.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Class, ClassDocument } from '../../../infrastructure/database/entities/class.entity';
import { Enrollment, EnrollmentDocument } from '../../../infrastructure/database/entities/enrollment.entity';
import { Material, MaterialDocument } from '../../../infrastructure/database/entities/material.entity';
import { ClassUpdate, ClassUpdateDocument } from '../../../infrastructure/database/entities/update.entity';
import { Faculty, FacultyDocument } from '../../../infrastructure/database/entities/faculty.entity';
import { ClassGroup, GroupDocument } from '../../../infrastructure/database/entities/group.entity';
import { DeleteClassResponseDto } from '../dto/class-settings.dto';

@Injectable()
export class DeleteClassService {
    constructor(
        @InjectModel(Class.name) private readonly classModel: Model<ClassDocument>,
        @InjectModel(Enrollment.name) private readonly enrollmentModel: Model<EnrollmentDocument>,
        @InjectModel(Material.name) private readonly materialModel: Model<MaterialDocument>,
        @InjectModel(ClassUpdate.name) private readonly updateModel: Model<ClassUpdateDocument>,
        @InjectModel(Faculty.name) private readonly facultyModel: Model<FacultyDocument>,
        @InjectModel(ClassGroup.name) private readonly groupModel: Model<GroupDocument>,
    ) { }

    async execute(userId: string, classId: string): Promise<DeleteClassResponseDto> {
        const userObjectId = new Types.ObjectId(userId);
        const classObjectId = new Types.ObjectId(classId);

        // Check if class exists
        const existingClass = await this.classModel.findById(classObjectId);
        if (!existingClass) throw new NotFoundException('Class not found');

        if (!existingClass.instructorId.equals(userObjectId)) {
            throw new ForbiddenException('Only the instructor can delete this class');
        }

        // Delete all related data
        await Promise.all([
            this.enrollmentModel.deleteMany({ classId: classObjectId }),
            this.materialModel.deleteMany({ classId: classObjectId }),
            this.updateModel.deleteMany({ classId: classObjectId }),
            this.facultyModel.deleteMany({ classId: classObjectId }),
            this.groupModel.deleteMany({ classId: classObjectId }),
            this.classModel.findByIdAndDelete(classObjectId),
        ]);

        return {
            success: true,
            message: 'Class and all related data deleted successfully.',
        };
    }
}