import { Module } from "@nestjs/common";

import { MongooseModule } from "@nestjs/mongoose";

import {
    Routine,
    RoutineSchema,
} from "../../infrastructure/database/entities/routine/routine.entity";

import {
    RoutineSlot,
    RoutineSlotSchema,
} from "../../infrastructure/database/entities/routine/routine-slot.entity";

import {
    AddSlotService,
    EditSlotService,
    GetRoutineService,
    CreateRoutineService,
    RemoveSlotService,
    DeleteRoutineService,
} from "./services";

import { RoutineController } from "./routine.controller";

import {
    User,
    UserSchema,
} from "../../infrastructure/database/entities/user.entity";

import {
    Class,
    ClassSchema,
} from "../../infrastructure/database/entities/class.entity";

import {
    Enrollment,
    EnrollmentSchema,
} from "../../infrastructure/database/entities/enrollment.entity";

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Routine.name,
                schema: RoutineSchema,
            },

            {
                name: RoutineSlot.name,
                schema: RoutineSlotSchema,
            },

            {
                name: User.name,
                schema: UserSchema,
            },

            {
                name: Class.name,
                schema: ClassSchema,
            },

            {
                name: Enrollment.name,
                schema: EnrollmentSchema,
            },
        ]),
    ],

    controllers: [RoutineController],

    providers: [
        CreateRoutineService,
        GetRoutineService,
        AddSlotService,
        EditSlotService,
        RemoveSlotService,
        DeleteRoutineService,
    ],

    exports: [
        AddSlotService,
        EditSlotService,
    ],
})
export class RoutineModule {}