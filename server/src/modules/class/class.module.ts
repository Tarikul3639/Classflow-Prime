import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Class, ClassSchema } from '../../database/entities/class.entity';
import {
  Enrollment,
  EnrollmentSchema,
} from '../../database/entities/enrollment.entity';
import {
  ClassUpdate,
  ClassUpdateSchema,
} from '../../database/entities/update.entity';
import {
  Material,
  MaterialSchema,
} from '../../database/entities/material.entity';
import {
  ClassGroup,
  ClassGroupSchema,
} from '../../database/entities/group.entity';

import { User, UserSchema } from '../../database/entities/user.entity';

import { Faculty, FacultySchema } from '../../database/entities/faculty.entity';

import { CreateClassController } from './controllers/create-class.controller';
import { CreateClassService } from './services/create-class.service';

import { FetchClassesController } from './controllers/fetch-enrolled-classes.controller';
import { FetchEnrolledClassesService } from './services/fetch-enrolled-classes.service';

import { EnrollClassService } from './services/enroll-class.service';
import { EnrollClassController } from './controllers/enroll-class.controller';

import { FetchClassController } from './controllers/fetch-class.controller';
import { FetchClassService } from './services/fetch-class.service';

import { FetchClassOverviewController } from './controllers/fetch-class-overview.controller';
import { FetchClassOverviewService } from './services/fetch-class-overview.service';

import { FetchClassUpdateController } from './controllers/fetch-class-update.controller';
import { FetchClassUpdateService } from './services/fetch-class-update.service';

import { CreateClassUpdateController } from './controllers/create-class-update.controller';
import { CreateClassUpdateService } from './services/create-class-update.service';

import { FetchSingleClassUpdateController } from './controllers/fetch-single-class-update.controller';
import { FetchSingleClassUpdateService } from './services/fetch-single-class-update.service';

import { UpdateClassUpdateController } from './controllers/update-class-update.controller';
import { UpdateClassUpdateService } from './services/update-class-update.service';

import { TogglePinClassUpdateController } from './controllers/toggle-pin-class-update.controller';
import { TogglePinClassUpdateService } from './services/toggle-pin-class-update.service';

import { DeleteSingleClassUpdateController } from './controllers/delete-single-class-update.controller';
import { DeleteSingleClassUpdateService } from './services/delete-single-class-update.service';

import { ClassFacultyController } from './controllers/class-faculty.controller';
import { FetchClassFacultiesService } from './services/fetch-class-faculties.service';
import { CreateClassFacultyService } from './services/create-class-faculty.service';
import { UpdateSingleClassFacultyService } from './services/update-single-class-faculty.service';
import { DeleteClassFacultyService } from './services/delete-class-faculty.service';
import { FetchSingleClassFacultyService } from './services/fetch-single-class-faculty.service';

import { ClassMemberController } from './controllers/class-member.controller';
import { FetchClassMembersService } from './services/fetch-class-members.service';
import { AssistantAssignClassMemberService } from './services/assistant-assign-class-member.service';
import { AssistantRevokeClassMemberService } from './services/assistant-revoke-class-member.service';
import { MemberRevokeClassMemberService } from './services/member-revoke-class-member.service';

import { ClassGroupController } from './controllers/class-group.controller';
import { FetchClassGroupsService } from './services/fetch-class-groups.service';
import { FetchSingleClassGroupService } from './services/fetch-single-class-group.service';
import { CreateClassGroupService } from './services/create-class-group.service';
import { UpdateClassGroupService } from './services/update-class-group.service';
import { DeleteClassGroupService } from './services/delete-class-group.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Class.name, schema: ClassSchema }]),
    MongooseModule.forFeature([
      { name: Enrollment.name, schema: EnrollmentSchema },
    ]),
    MongooseModule.forFeature([
      { name: ClassUpdate.name, schema: ClassUpdateSchema },
    ]),
    MongooseModule.forFeature([
      { name: Material.name, schema: MaterialSchema },
    ]),

    MongooseModule.forFeature([{ name: Faculty.name, schema: FacultySchema }]),
    MongooseModule.forFeature([{ name: ClassGroup.name, schema: ClassGroupSchema }]),
  ],
  controllers: [
    CreateClassController,
    FetchClassesController,
    EnrollClassController,
    FetchClassController,
    FetchClassOverviewController,
    FetchClassUpdateController,
    CreateClassUpdateController,
    FetchSingleClassUpdateController,
    UpdateClassUpdateController,
    TogglePinClassUpdateController,
    DeleteSingleClassUpdateController,

    // Class Faculty Controller
    ClassFacultyController,
    // Class Member Controller
    ClassMemberController,
    // Class Group Controller
    ClassGroupController,
  ],
  providers: [
    CreateClassService,
    FetchEnrolledClassesService,
    EnrollClassService,
    FetchClassService,
    FetchClassOverviewService,
    FetchClassUpdateService,
    CreateClassUpdateService,
    FetchSingleClassUpdateService,
    UpdateClassUpdateService,
    TogglePinClassUpdateService,
    DeleteSingleClassUpdateService,
    // Class Faculty Services
    FetchClassFacultiesService,
    CreateClassFacultyService,
    UpdateSingleClassFacultyService,
    DeleteClassFacultyService,
    FetchSingleClassFacultyService,
    // Class Member Services
    FetchClassMembersService,
    AssistantAssignClassMemberService,
    AssistantRevokeClassMemberService,
    MemberRevokeClassMemberService,
    // Class Group Services
    FetchClassGroupsService,
    FetchSingleClassGroupService,
    CreateClassGroupService,
    UpdateClassGroupService,
    DeleteClassGroupService,
  ],
})
export class ClassModule { }
