// routine-slot.entity.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { DayOfWeek } from './day-of-week.enum';

export type RoutineSlotDocument = HydratedDocument<RoutineSlot> & {
    createdAt: Date;
    updatedAt: Date;
};

@Schema({
    collection: 'routine_slots',
    timestamps: true,
})
export class RoutineSlot {
    @Prop({
        type: Types.ObjectId,
        ref: 'Routine',
        required: true,
    })
    routineId!: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: 'Class',
        required: true,
    })
    classId!: Types.ObjectId;

    @Prop({
        required: true,
        enum: DayOfWeek,
    })
    day!: DayOfWeek;

    @Prop({
        required: true,
        min: 1,
    })
    periodNo!: number;

    @Prop({
        required: true,
        trim: true,
    })
    subject!: string;

    @Prop({
        required: true,
        trim: true,
    })
    teacherName!: string;

    @Prop({
        trim: true,
        default: null,
    })
    room?: string;
}

export const RoutineSlotSchema =
    SchemaFactory.createForClass(RoutineSlot);

/**
 * FAST CLASS ROUTINE QUERY
 */
RoutineSlotSchema.index({
    classId: 1,
    day: 1,
    periodNo: 1,
});

/**
 * TEACHER ROUTINE QUERY
 */
RoutineSlotSchema.index({
    teacherName: 1,
    day: 1,
    periodNo: 1,
});

/**
 * ROOM CONFLICT QUERY
 */
RoutineSlotSchema.index({
    room: 1,
    day: 1,
    periodNo: 1,
});

/**
 * UNIQUE SLOT PER CLASS
 */
RoutineSlotSchema.index(
    {
        classId: 1,
        academicYear: 1,
        section: 1,
        day: 1,
        periodNo: 1,
    },
    {
        unique: true,
    },
);