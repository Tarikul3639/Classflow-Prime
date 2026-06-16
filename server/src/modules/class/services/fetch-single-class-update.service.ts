import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, PipelineStage } from 'mongoose';
import { Class, ClassDocument } from '../../../infrastructure/database/entities/class.entity';
import { FetchSingleClassUpdateResponseDto } from '../dto/fetch-single-class-update.dto';

// TODO: Have some issue with the aggregation pipeline
@Injectable()
export class FetchSingleClassUpdateService {
  constructor(
    @InjectModel(Class.name)
    private readonly classModel: Model<ClassDocument>,
  ) {}

  async execute(
    userId: string,
    classId: string,
    updateId: string,
  ): Promise<FetchSingleClassUpdateResponseDto> {
    const updateObjectId = new Types.ObjectId(updateId);
    const classObjectId = new Types.ObjectId(classId);
    const userObjectId = new Types.ObjectId(userId);

    const pipeline: PipelineStage[] = [
      // ১. নির্দিষ্ট আপডেটটি খুঁজে বের করা (যা নির্দিষ্ট ক্লাসের আন্ডারে)
      // সরাসরি ClassUpdate কালেকশন থেকেও করা যায়, তবে এখানে ক্লাস আইডি ভ্যালিডেশন সহ করা হলো
      {
        $match: {
          _id: updateObjectId,
          classId: classObjectId,
        },
      },
      // ২. পোস্টদাতার (postedBy) ডিটেইলস নিয়ে আসা
      {
        $lookup: {
          from: 'users',
          localField: 'postedBy',
          foreignField: '_id',
          as: 'postedByDetails',
        },
      },
      {
        $unwind: { path: '$postedByDetails', preserveNullAndEmptyArrays: true },
      },
      // ৩. মেটেরিয়ালস/অ্যাটাচমেন্টস নিয়ে আসা
      {
        $lookup: {
          from: 'materials',
          localField: '_id',
          foreignField: 'updateId',
          as: 'materialDetails',
        },
      },
      // ৪. DTO অনুযায়ী ফাইনাল প্রজেকশন
      {
        $project: {
          _id: { $toString: '$_id' },
          classId: { $toString: '$classId' },
          title: 1,
          description: { $ifNull: ['$description', null] },
          category: 1,
          isPinned: 1,
          eventAt: 1,
          createdAt: 1,
          updatedAt: 1,
          postedBy: {
            _id: { $toString: '$postedByDetails._id' },
            name: { $ifNull: ['$postedByDetails.name', 'Unknown User'] },
            avatarUrl: { $ifNull: ['$postedByDetails.avatarUrl', null] },
          },
          materials: {
            // ফ্রন্টএন্ড ইন্টারফেস অনুযায়ী 'materials'
            $map: {
              input: '$materialDetails',
              as: 'mat',
              in: {
                _id: { $toString: '$$mat._id' },
                name: { $ifNull: ['$$mat.name', 'Untitled File'] },
                url: '$$mat.url',
                type: '$$mat.type',
                size: '$$mat.size', // DTO অনুযায়ী সরাসরি number পাঠাচ্ছি
              },
            },
          },
          engagement: {
            avatars: [],
            commentCount: { $literal: 0 },
          },
        },
      },
    ];

    // নোট: এখানে classUpdateModel ব্যবহার করা উচিত যদি আপনি সরাসরি আপডেট কালেকশনে কোয়েরি করেন
    // যদি আপনার সার্ভিসে classUpdateModel ইনজেক্ট করা না থাকে তবে classModel.db.collection('classupdates') ব্যবহার করতে পারেন
    const result = await this.classModel.db
      .collection('classupdates') // আপনার আপডেট কালেকশনের নাম
      .aggregate(pipeline)
      .toArray();

    if (!result || result.length === 0) {
      throw new NotFoundException('The update was not found.');
    }

    return {
      success: true,
      message: 'Class update details fetched successfully',
      data: {
        update: result[0] as any, // প্রথম অবজেক্টটি রিটার্ন করা হচ্ছে
      },
    };
  }
}
