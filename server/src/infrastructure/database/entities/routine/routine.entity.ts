// routine.entity.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Period, PeriodSchema } from './period.entity';

export type RoutineDocument = HydratedDocument<Routine> & {
    createdAt: Date;
    updatedAt: Date;
};

@Schema({
    collection: 'routines',
    timestamps: true,
})
export class Routine {
    @Prop({
        type: Types.ObjectId,
        ref: 'Class',
        required: true,
    })
    classId!: Types.ObjectId;

    @Prop({
        type: [PeriodSchema],
        default: [],
    })
    periods!: Period[];
}

export const RoutineSchema = SchemaFactory.createForClass(Routine);

RoutineSchema.index(
    {
        classId: 1,
    },
    {
        unique: true,
    },
);