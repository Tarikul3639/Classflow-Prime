import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { Class, ClassSchema } from "../../infrastructure/database/entities/class.entity";
import { Enrollment, EnrollmentSchema } from "../../infrastructure/database/entities/enrollment.entity";
import { ClassUpdate, ClassUpdateSchema } from "../../infrastructure/database/entities/update.entity";
import { Material, MaterialSchema } from "../../infrastructure/database/entities/material.entity";
import { Faculty, FacultySchema } from "../../infrastructure/database/entities/faculty.entity";
import { ClassGroup, ClassGroupSchema } from "../../infrastructure/database/entities/group.entity";
import { User, UserSchema } from "../../infrastructure/database/entities/user.entity";

import { DashboardService } from "./services/dashboard.service";
import { DashboardController } from "./controllers/dashboard.controller";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Class.name, schema: ClassSchema },
            { name: Enrollment.name, schema: EnrollmentSchema },
            { name: ClassUpdate.name, schema: ClassUpdateSchema },
            { name: Material.name, schema: MaterialSchema },
            { name: Faculty.name, schema: FacultySchema },
            { name: ClassGroup.name, schema: ClassGroupSchema },
            { name: User.name, schema: UserSchema },
        ]),
    ],
    controllers: [DashboardController],
    providers: [DashboardService],
})
export class DashboardModule { }