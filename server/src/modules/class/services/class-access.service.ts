import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Enrollment, EnrollmentDocument } from '../../../infrastructure/database/entities/enrollment.entity';
import { ClassDocument } from '../../../infrastructure/database/entities/class.entity';
import { EnrollmentRole } from '../../../infrastructure/database/interface/enrollment.interface';
import { ActorType, type IActor } from '../../auth/interfaces/actor.interface';

@Injectable()
export class ClassAccessService {
    constructor(
        @InjectModel(Enrollment.name)
        private enrollmentModel: Model<EnrollmentDocument>,
    ) { }

    async canCreateUpdate(
        targetClass: ClassDocument,
        actor: IActor,
    ): Promise<void> {
        // If the actor is a user, check if they are the instructor or an assistant for the class
        if (actor.type === ActorType.USER) {
            const userObjectId = new Types.ObjectId(actor.userId);
            const isInstructor = targetClass.instructorId.equals(userObjectId);
            const isAssistant = await this.enrollmentModel.exists({
                classId: targetClass._id,
                userId: userObjectId,
                role: EnrollmentRole.ASSISTANT,
            });

            if (!isInstructor && !isAssistant) {
                throw new ForbiddenException('You do not have permission to post updates');
            }
            return;
        }

        // If the actor is an agent, check if it has the necessary scopes and class access
        if (actor.type === ActorType.AGENT) {

            if (!actor.scopes.create) {
                throw new ForbiddenException('Agent does not have create permission');
            }

            const isAllowed = actor.allowedClassIds.includes(targetClass._id.toString());
            if (!isAllowed) {
                throw new ForbiddenException('Class access denied');
            }
        }
    }
}