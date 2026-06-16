import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, PipelineStage } from 'mongoose';

import { User, UserDocument } from '../../../../infrastructure/database/entities/user.entity';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  bio?: string;
  avatarUrl?: string;
  enrolledClasses: {
    classId: string;
    className: string;
    themeColor?: string;
    coverImage?: string;
    role: string;
    status: string;
    enrolledAt: Date;
  };
}

export interface IGetCurrentUserResponseDto {
  success: boolean;
  message: string;
  data: {
    user: IUser;
  };
}

@Injectable()
export class GetCurrentUserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async execute(userId: string): Promise<IGetCurrentUserResponseDto> {
    // 1. Convert string ID to MongoDB ObjectId
    const userObjId = new Types.ObjectId(userId);

    const pipeline: PipelineStage[] = [
      { $match: { _id: userObjId } },
      {
        $lookup: {
          from: 'enrollments',
          let: { userId: '$_id' }, // 'let' define variable for current user ID, Here '$_id' is the field reference for the 'users' collection
          pipeline: [
            { $match: { $expr: { $eq: ['$userId', '$$userId'] } } }, // '$expr' need for variable vs field compare, '$$' for variable reference, '$' for field reference. Here we compare 'userId' field in 'enrollments' with the variable 'userId' defined in 'let'
            {
              $lookup: {
                from: 'classes',
                let: { classId: '$classId' },
                pipeline: [
                  { $match: { $expr: { $eq: ['$_id', '$$classId'] } } },
                  {
                    $project: {
                      name: 1,
                      status: 1,
                      themeColor: 1,
                      coverImage: 1,
                    },
                  },
                ],
                as: 'classDetails',
              },
            },
            {
              $unwind: {
                path: '$classDetails',
                preserveNullAndEmptyArrays: true,
              },
            }, // Array to object conversion for easier access to class details in projection
            {
              $project: {
                classId: 1,
                role: 1,
                enrolledAt: 1,
                className: '$classDetails.name',
                status: '$classDetails.status',
                themeColor: '$classDetails.themeColor',
                coverImage: '$classDetails.coverImage',
              },
            },
          ],
          as: 'enrolledClasses',
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          emailVerified: 1,
          bio: 1,
          avatarUrl: 1,
          enrolledClasses: 1,
        },
      },
    ];

    // 2. Optimized User & Enrollment Fetch using Aggregation
    const result: IUser[] = await this.userModel.aggregate(pipeline);

    // DEBUG: Add after aggregation result is obtained:
    // console.log("User Data: ", result);

    if (!result || result.length === 0) {
      throw new NotFoundException('User profile not found');
    }

    const userData = result[0]; // mongoose aggregate always returns an array even if it's just one document

    // 3. Final sanitization for response
    return {
      success: true,
      message: 'User profile fetched successfully',
      data: {
        user: {
          _id: userData._id.toString(),
          name: userData.name,
          email: userData.email,
          emailVerified: userData.emailVerified,
          bio: userData.bio,
          avatarUrl: userData.avatarUrl || undefined,
          enrolledClasses: userData.enrolledClasses || [],
        },
      },
    };
  }
}
