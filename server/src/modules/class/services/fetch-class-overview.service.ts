import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, PipelineStage } from 'mongoose';
import { Class, ClassDocument } from '../../../database/entities/class.entity';
import { EnrollmentRole } from '../../../database/interface/enrollment.interface';
import { FetchClassOverviewResponseDto } from '../dto/fetch-class-overview.dto';

@Injectable()
export class FetchClassOverviewService {
  constructor(
    @InjectModel(Class.name)
    private readonly classModel: Model<ClassDocument>,
  ) { }

  async execute(
    userId: string,
    classId: string,
  ): Promise<FetchClassOverviewResponseDto> {
    const classObjectId = new Types.ObjectId(classId);
    const userObjectId = new Types.ObjectId(userId);
    const pipeline: PipelineStage[] = [
      { $match: { _id: classObjectId } },

      // Check if user is instructor or assistant via enrollment
      {
        $lookup: {
          from: 'enrollments',
          let: { cid: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$classId', '$$cid'] },
                    { $eq: ['$userId', userObjectId] },
                  ],
                },
              },
            },
            { $project: { role: 1 } },
          ],
          as: 'userEnrollment',
        },
      },

      {
        $addFields: {
          isInstructor: { $eq: ['$instructorId', userObjectId] },
          isAssistant: {
            $in: [
              EnrollmentRole.ASSISTANT,
              { $map: { input: '$userEnrollment', as: 'e', in: '$$e.role' } },
            ],
          },
        },
      },

      {
        $match: { $or: [{ isInstructor: true }, { isAssistant: true }] },
      },

      // Count students
      {
        $lookup: {
          from: 'enrollments',
          let: { currentClassId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$classId', '$$currentClassId'] } } },
            { $count: 'total' },
          ],
          as: 'studentCountArray',
        },
      },

      // Count events
      {
        $lookup: {
          from: 'classupdates',
          let: { currentClassId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$classId', '$$currentClassId'] },
                eventAt: { $exists: true, $ne: null },
              },
            },
            { $count: 'total' },
          ],
          as: 'eventCountArray',
        },
      },

      { $unwind: { path: '$eventCountArray', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$studentCountArray', preserveNullAndEmptyArrays: true } },

      {
        $project: {
          _id: 0,
          classId: { $toString: '$_id' },
          about: { $ifNull: ['$about', null] },
          studentsCount: { $ifNull: ['$studentCountArray.total', 0] },
          eventsCount: { $ifNull: ['$eventCountArray.total', 0] },
        },
      },
    ];

    const result = await this.classModel.aggregate(pipeline).exec();
    const classData = result[0] || null;
    return {
      success: true,
      message: 'Class overview fetched successfully',
      data: {
        class: classData,
      },
    };
  }
}
