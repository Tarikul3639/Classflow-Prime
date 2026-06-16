import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, PipelineStage } from 'mongoose';
import { Class, ClassDocument } from '../../../infrastructure/database/entities/class.entity';
import { FetchClassUpdateResponseDto } from '../dto/fetch-class-update.dto';

// TODO: Have some issue with the aggregation pipeline
@Injectable()
export class FetchClassUpdateService {
  constructor(
    @InjectModel(Class.name)
    private readonly classModel: Model<ClassDocument>,
  ) { }

  async execute(
    userId: string,
    classId: string,
  ): Promise<FetchClassUpdateResponseDto> {
    const userObjId = new Types.ObjectId(userId);
    const classObjectId = new Types.ObjectId(classId);

    const pipeline: PipelineStage[] = [
      // ১. নির্দিষ্ট ক্লাসটি খুঁজে বের করা
      {
        $match: {
          _id: classObjectId,
        },
      },
      // ২. 'classupdates' কালেকশন থেকে ঐ ক্লাসের সব আপডেট নিয়ে আসা
      {
        $lookup: {
          from: 'classupdates', // আপনার ডাটাবেসে কালেকশনের নাম চেক করে নিন
          localField: '_id',
          foreignField: 'classId',
          as: 'updates',
        },
      },
      // ৩. আপডেটগুলোকে আলাদা আলাদা ডকুমেন্টে রূপান্তর করা যাতে প্রজেকশন করা সহজ হয়
      { $unwind: '$updates' },
      // ৪. আপডেট যে পোস্ট করেছে (postedBy) তার ডিটেইলস নিয়ে আসা
      {
        $lookup: {
          from: 'users',
          localField: 'updates.postedBy',
          foreignField: '_id',
          as: 'postedByDetails',
        },
      },
      {
        $unwind: { path: '$postedByDetails', preserveNullAndEmptyArrays: true },
      },
      // ৫. মেটেরিয়ালস/অ্যাটাচমেন্টস নিয়ে আসা
      {
        $lookup: {
          from: 'materials',
          localField: 'updates._id',
          foreignField: 'updateId',
          as: 'materialDetails',
        },
      },
      // ৬. সর্টিং (Pinned আগে, তারপর লেটেস্ট)
      {
        $sort: {
          'updates.isPinned': -1,
          'updates.eventAt': 1,
          'updates.createdAt': -1,
        },
      },
      // ৭. DTO অনুযায়ী ফাইনাল প্রজেকশন
      {
        $project: {
          _id: { $toString: '$updates._id' },
          classId: { $toString: '$_id' },
          title: '$updates.title',
          description: { $ifNull: ['$updates.description', null] },
          category: '$updates.category',
          isPinned: '$updates.isPinned',
          eventAt: '$updates.eventAt',
          createdAt: '$updates.createdAt',
          updatedAt: '$updates.updatedAt',
          postedBy: {
            _id: { $toString: '$postedByDetails._id' },
            name: { $ifNull: ['$postedByDetails.name', 'Unknown User'] },
            avatarUrl: { $ifNull: ['$postedByDetails.avatarUrl', null] },
          },
          materials: {
            $map: {
              input: '$materialDetails',
              as: 'mat',
              in: {
                _id: { $toString: '$$mat._id' },
                name: { $ifNull: ['$$mat.name', 'Untitled File'] },
                url: '$$mat.url',
                type: '$$mat.type',
                size: {
                  $ifNull: ['$$mat.size', 0]
                },
              },
            },
          },
          // Engagement স্ট্যাটিক ডাটা (যদি আপনার কমেন্ট সিস্টেম না থাকে)
          engagement: {
            avatars: [],
            commentCount: { $literal: 0 },
          },
        },
      },
      // ৮. প্রজেকশন করার পর ডাটাগুলোকে আবার একটি অ্যারোতে সাজানো
      {
        $group: {
          _id: null,
          allUpdates: { $push: '$$ROOT' },
        },
      },
    ];

    const result = await this.classModel.aggregate(pipeline).exec();

    // রেজাল্ট হ্যান্ডলিং
    const updates = result.length > 0 ? result[0].allUpdates : [];

    return {
      success: true,
      message: 'Class updates fetched successfully',
      data: {
        update: updates,
      },
    };
  }
}
