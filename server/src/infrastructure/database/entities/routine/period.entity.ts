// period.entity.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ _id: true })
export class Period {
    _id!: Types.ObjectId;

    @Prop({
        required: true,
        min: 1,
    })
    periodNo!: number;

    @Prop({
        required: true,
        trim: true,
    })
    label!: string; // "1st Period", "Lunch Break"

    @Prop({
        required: true,
        match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    })
    startTime!: string;

    @Prop({
        required: true,
        match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    })
    endTime!: string;

    @Prop({
        default: false,
    })
    isBreak!: boolean;
}

export const PeriodSchema = SchemaFactory.createForClass(Period);

PeriodSchema.index({ periodNo: 1 });