import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Class, ClassDocument } from '../../../infrastructure/database/entities/class.entity';
import { RegenerateClassCodeResponseDto } from '../dto/class-settings.dto';

@Injectable()
export class RegenerateClassCodeService {
    constructor(
        @InjectModel(Class.name) private readonly classModel: Model<ClassDocument>,
    ) { }

    private generateCode(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    async execute(userId: string, classId: string): Promise<RegenerateClassCodeResponseDto> {
        const userObjectId = new Types.ObjectId(userId);
        const classObjectId = new Types.ObjectId(classId);

        // Check if class exists
        const existingClass = await this.classModel.findById(classObjectId);
        if (!existingClass) {
            throw new NotFoundException('Class not found');
        }

        // Only instructor can regenerate code
        if (!existingClass.instructorId.equals(userObjectId)) {
            throw new ForbiddenException('Only the instructor can regenerate the class code');
        }

        // Generate unique code
        let newCode: string;
        let exists: boolean;

        do {
            newCode = this.generateCode();
            exists = !!(await this.classModel.findOne({ enrollCode: newCode }));
        } while (exists);

        // Update the class with the new code
        await this.classModel.findByIdAndUpdate(classObjectId, { enrollCode: newCode });

        return {
            success: true,
            message: 'Class code regenerated successfully.',
            data: { code: newCode },
        };
    }
}