import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CLASS_ROLE_KEY } from '../decorators/class-role.decorator';
import { EnrollmentRole } from '../../../infrastructure/database/interface/enrollment.interface';
import { Enrollment, EnrollmentDocument } from '../../../infrastructure/database/entities/enrollment.entity';
import { Class, ClassDocument } from '../../../infrastructure/database/entities/class.entity';

@Injectable()
export class ClassRoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectModel(Enrollment.name) private readonly enrollmentModel: Model<EnrollmentDocument>,
    @InjectModel(Class.name) private readonly classModel: Model<ClassDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Check if specific roles are required
    const requiredRoles = this.reflector.getAllAndOverride<EnrollmentRole[]>(CLASS_ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const { user, params } = request;
    const classId = params?.classId;

    // 2. Validate Request Data
    if (!classId || !Types.ObjectId.isValid(classId)) {
      throw new ForbiddenException('Valid class ID is required');
    }

    if (!user?.userId) {
      throw new ForbiddenException('Authentication required');
    }

    const classObjectId = new Types.ObjectId(classId);
    const userObjectId = new Types.ObjectId(user.userId);

    // 3. Verify Class Existence
    const existingClass = await this.classModel.findById(classObjectId).select('_id').lean();
    if (!existingClass) {
      throw new NotFoundException('Class not found');
    }

    // 4. Verify Enrollment & Roles
    const enrollment = await this.enrollmentModel.findOne({
      classId: classObjectId,
      userId: userObjectId,
    });

    if (!enrollment) {
      throw new ForbiddenException('You are not enrolled in this class');
    }

    if (!requiredRoles.includes(enrollment.role)) {
      throw new ForbiddenException(`Access denied. Required roles: ${requiredRoles.join(', ')}`);
    }

    // 5. Attach context to request
    request.enrollment = enrollment;
    request.classRole = enrollment.role;

    return true;
  }
}