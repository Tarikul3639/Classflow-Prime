import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, PipelineStage } from 'mongoose';
import { Class, ClassDocument } from '../../../database/entities/class.entity';
import { FetchClassResponseDto } from '../dto/fetch-class.dto';
import { EnrollmentRole } from '../../../database/interface/enrollment.interface';

@Injectable()
export class FetchClassService {
  constructor(
    @InjectModel(Class.name)
    private readonly classModel: Model<ClassDocument>,
  ) { }

  async execute(
    userId: string,
    classId: string,
  ): Promise<FetchClassResponseDto> {
    const classObjectId = new Types.ObjectId(classId);
    const userObjectId = new Types.ObjectId(userId);

    const pipeline: PipelineStage[] = [
      // 1️) Match the class (not archived)
      {
        $match: { _id: classObjectId, isArchived: false },
      },

      // 2️) Lookup all enrollments for this class
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

      // 3️) Lookup current user enrollment (to check if student)
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

      // 4️) Lookup instructor details
      {
        $lookup: {
          from: 'users',
          localField: 'instructorId',
          foreignField: '_id',
          as: 'instructorDetails',
        },
      },
      { $unwind: { path: '$instructorDetails', preserveNullAndEmptyArrays: true } },

      // 5️) Add fields: isAssistant & members count
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
          members: {
            $add: [
              { $size: '$allEnrollments' }, // total enrolled
              1, // instructor
            ],
          },
        },
      },

      // 6️) Access control: only instructor / assistant / enrolled student
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

      // 7️) Project the final response
      {
        $project: {
          _id: 0,
          classId: { $toString: '$_id' },
          name: 1,
          department: { $ifNull: ['$department', 'General'] },
          semester: { $ifNull: ['$semester', 'TBA'] },
          about: { $ifNull: ['$about', null] },
          themeColor: 1,
          coverImage: { $ifNull: ['$coverImage', null] },
          status: 1,
          allowEnroll: 1,

          members: 1,

          instructor: '$instructorDetails.name',
          avatarUrl: '$instructorDetails.avatarUrl',

          isInstructor: { $eq: ['$instructorId', userObjectId] },
          isAssistant: 1,
        },
      },
    ];

    const classData = await this.classModel.aggregate(pipeline).exec();

    if (!classData.length) {
      return {
        success: false,
        message: 'Class not found or access denied',
        data: { class: null },
      };
    }

    return {
      success: true,
      message: 'Class fetched successfully',
      data: { class: classData[0] },
    };
  }
}