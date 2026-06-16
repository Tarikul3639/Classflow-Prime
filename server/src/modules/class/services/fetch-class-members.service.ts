import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Class, ClassDocument } from '../../../infrastructure/database/entities/class.entity';
import { Enrollment, EnrollmentDocument } from '../../../infrastructure/database/entities/enrollment.entity';
import { IEnrollment, EnrollmentRole } from '../../../infrastructure/database/interface/enrollment.interface';
import { User, UserDocument } from '../../../infrastructure/database/entities/user.entity';

import { GetClassMembersResponseWrapperDto } from '../dto/class-member.dto';

@Injectable()
export class FetchClassMembersService {
    constructor(
        @InjectModel(Class.name) private readonly classModel: Model<ClassDocument>,
        @InjectModel(Enrollment.name) private readonly enrollmentModel: Model<EnrollmentDocument>,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    ) { }

    async execute(userId: string, classId: string): Promise<GetClassMembersResponseWrapperDto> {
        const userObjId = new Types.ObjectId(userId);
        const classObjId = new Types.ObjectId(classId);

        // 1. Check class existence
        const existingClass = await this.classModel.findById(classObjId).lean();
        if (!existingClass) {
            throw new NotFoundException('Class not found');
        }

        // 2. Authorization (Instructor OR Enrolled)
        const isEnrolled = await this.enrollmentModel.exists({
            classId: classObjId,
            userId: userObjId,
        });

        const isInstructor = existingClass.instructorId.equals(userObjId);

        if (!isInstructor && !isEnrolled) {
            throw new ForbiddenException('Only enrolled members can view class members');
        }

        // 3. Fetch enrollments
        const enrollments = await this.enrollmentModel
            .find({ classId: classObjId })
            .lean();

        // 4. Collect all userIds (including instructor) + remove duplicates
        const userIds = Array.from(
            new Set([
                ...enrollments.map(e => e.userId.toString()),
                existingClass.instructorId.toString(),
            ])
        ).map(id => new Types.ObjectId(id));

        // 5. Fetch all users in one query
        const users = await this.userModel
            .find({ _id: { $in: userIds as any } })
            .lean();

        // 6. Create fast lookup map
        const userMap = new Map(
            users.map(user => [user._id.toString(), user])
        );

        // 7. Build members list from enrollments
        const members = enrollments.map(enrollment => {
            const user = userMap.get(enrollment.userId.toString());

            return {
                userId: enrollment.userId.toString(),
                name: user?.name || 'Unknown User',
                email: maskEmail(user?.email),
                verified: user?.emailVerified || false,
                avatarUrl: user?.avatarUrl || '',
                role: enrollment.role,
                enrolledAt: enrollment.enrolledAt,
            };
        });

        // 8. Add instructor separately
        const instructor = userMap.get(existingClass.instructorId.toString());

        members.push({
            userId: existingClass.instructorId.toString(),
            name: instructor?.name || 'Instructor',
            email: instructor?.email || '',
            verified: instructor?.emailVerified || false,
            avatarUrl: instructor?.avatarUrl || '',
            role: EnrollmentRole.INSTRUCTOR,
            enrolledAt: existingClass.createdAt || new Date(),
        });

        // 9. Response
        return {
            success: true,
            message: 'Class members fetched successfully',
            data: {
                classId,
                members,
            },
        };
    }
}


function maskEmail(email?: string): string {
    if (!email) return "Unknown Email";

    const [name, domain] = email.split("@");
    if (!name || !domain) return email;

    let visibleLength = name.length
    let end = name.slice(-2); // Show last 2 characters of the name

    if (name.length <= 2) {
        visibleLength = 1; // Show only the first character for very short names  
    }

    if (name.length > 2 && name.length <= 4) {
        visibleLength = 2; // Show the first 2 characters for names longer than 2 characters
    }

    if (name.length > 4 && name.length <= 6) {
        visibleLength = 3; // Show the first 3 characters for longer names
    }

    if (name.length > 6 && name.length <= 10) {
        visibleLength = 4; // Show the first 4 characters for very long names
    }

    if (name.length > 10) {
        visibleLength = 5; // Show the first 5 characters for very long names
    }

    const visiblePart = name.slice(0, visibleLength);
    const stars = "*".repeat(name.length - visibleLength).slice(0, -2) + end; // Limit to 5 stars for very long names
    

    return `${visiblePart}${stars}@${domain}`;
}