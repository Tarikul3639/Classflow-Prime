import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Enrollment, EnrollmentSchema } from "../../database/entities/enrollment.entity";
import { ClassUpdate, ClassUpdateSchema } from "../../database/entities/update.entity";
import { Material, MaterialSchema } from "../../database/entities/material.entity";
import { Faculty, FacultySchema } from "../../database/entities/faculty.entity";
import { ClassGroup, ClassGroupSchema } from "../../database/entities/group.entity";
import { User, UserSchema } from "../../database/entities/user.entity";

import { DashboardService } from "./services/dashboard.service";
import { DashboardController } from "./controllers/dashboard.controller";

@Module({
    imports: [
        MongooseModule.forFeature([
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