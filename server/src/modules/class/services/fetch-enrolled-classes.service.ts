import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, PipelineStage } from 'mongoose';
import { Class, ClassDocument } from '../../../infrastructure/database/entities/class.entity';
import { FetchClassesResponseDto } from '../dto/fetch-enrolled-classes.dto';
import { EnrollmentRole } from '../../../infrastructure/database/interface/enrollment.interface';

@Injectable()
export class FetchEnrolledClassesService {
  constructor(
    @InjectModel(Class.name)
    private readonly classModel: Model<ClassDocument>,
  ) { }

  async execute(userId: string): Promise<FetchClassesResponseDto> {
    const userObjectId = new Types.ObjectId(userId);

    const pipeline: PipelineStage[] = [
      // 1️) Lookup all enrollments for this class to count students
      {
        $lookup: {
          from: 'enrollments',
          let: { classId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$classId', '$$classId'] } } },
          ],
          as: 'allEnrollments',
        },
      },

      // 2️) Lookup current user's enrollment (to check if student)
      {
        $lookup: {
          from: 'enrollments',
          let: { classId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$classId', '$$classId'] },
                    { $eq: ['$userId', userObjectId] },
                  ],
                },
              },
            },
          ],
          as: 'currentUserEnrollment',
        },
      },

      // 3️) Lookup instructor details
      {
        $lookup: {
          from: 'users',
          localField: 'instructorId',
          foreignField: '_id',
          as: 'instructorDetails',
        },
      },
      { $unwind: { path: '$instructorDetails', preserveNullAndEmptyArrays: true } },

      // 4️) Add isAssistant field from enrollments
      {
        $addFields: {
          isAssistant: {
            $in: [
              userObjectId,
              {
                $map: {
                  input: {
                    $filter: {
                      input: '$allEnrollments',
                      cond: { $eq: ['$$this.role', EnrollmentRole.ASSISTANT] },
                    },
                  },
                  as: 'e',
                  in: '$$e.userId',
                },
              },
            ],
          },
        },
      },

      // 5️) Access control: only instructor / assistant / enrolled student
      {
        $match: {
          $expr: {
            $or: [
              { $eq: ['$instructorId', userObjectId] },
              { $eq: ['$isAssistant', true] },
              { $gt: [{ $size: '$currentUserEnrollment' }, 0] },
            ],
          },
        },
      },

      // 6️) Project final response
      {
        $project: {
          _id: 0,
          classId: { $toString: '$_id' },
          title: '$name',
          department: { $ifNull: ['$department', 'General'] },
          students: { $size: '$allEnrollments' },
          instructor: { $ifNull: ['$instructorDetails.name', 'Staff'] },
          avatarUrl: { $ifNull: ['$instructorDetails.avatarUrl', null] },
          semester: { $ifNull: ['$semester', 'TBA'] },
          themeColor: '$themeColor',
          coverImage: { $ifNull: ['$coverImage', null] },
          status: {
            $cond: {
              if: { $eq: ['$status', 'ended'] },
              then: 'archived',
              else: 'active',
            },
          },
          isInstructor: { $eq: ['$instructorId', userObjectId] },
          isAssistant: 1,
        },
      },
    ];

    const classes = await this.classModel.aggregate(pipeline).exec();

    return {
      success: true,
      message: 'Classes fetched successfully',
      data: { classes },
    };
  }
}