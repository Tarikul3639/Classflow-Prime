import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Class,
  ClassSchema,
} from '../../infrastructure/database/entities/class.entity';
import {
  Enrollment,
  EnrollmentSchema,
} from '../../infrastructure/database/entities/enrollment.entity';
import {
  ClassUpdate,
  ClassUpdateSchema,
} from '../../infrastructure/database/entities/update.entity';
import {
  Material,
  MaterialSchema,
} from '../../infrastructure/database/entities/material.entity';
import {
  ClassGroup,
  ClassGroupSchema,
} from '../../infrastructure/database/entities/group.entity';

import {
  User,
  UserSchema,
} from '../../infrastructure/database/entities/user.entity';

import {
  Faculty,
  FacultySchema,
} from '../../infrastructure/database/entities/faculty.entity';

import {
  Agent,
  AgentSchema,
} from '../../infrastructure/database/entities/agent.entity';

import { CreateClassController } from './controllers/create-class.controller';
import { CreateClassService } from './services/create-class.service';

import { FetchClassesController } from './controllers/fetch-enrolled-classes.controller';
import { FetchEnrolledClassesService } from './services/fetch-enrolled-classes.service';

import { EnrollClassService } from './services/enroll-class.service';
import { EnrollClassController } from './controllers/enroll-class.controller';

import { FetchClassController } from './controllers/fetch-class.controller';
import { FetchClassService } from './services/fetch-class.service';

import { FetchClassUpdateController } from './controllers/fetch-class-update.controller';
import { FetchClassUpdateService } from './services/updates/fetch-class-update.service';

import { CreateClassUpdateController } from './controllers/create-class-update.controller';
import { CreateClassUpdateService } from './services/updates/create-class-update.service';

import { FetchSingleClassUpdateController } from './controllers/fetch-single-class-update.controller';
import { FetchSingleClassUpdateService } from './services/updates/fetch-single-class-update.service';

import { UpdateClassUpdateController } from './controllers/update-class-update.controller';
import { UpdateClassUpdateService } from './services/updates/update-class-update.service';

import { TogglePinClassUpdateController } from './controllers/toggle-pin-class-update.controller';
import { TogglePinClassUpdateService } from './services/updates/toggle-pin-class-update.service';

import { DeleteSingleClassUpdateController } from './controllers/delete-single-class-update.controller';
import { DeleteSingleClassUpdateService } from './services/updates/delete-single-class-update.service';

import { ClassFacultyController } from './controllers/class-faculty.controller';
import { FetchClassFacultiesService } from './services/facultys/fetch-class-faculties.service';
import { CreateClassFacultyService } from './services/facultys/create-class-faculty.service';
import { UpdateSingleClassFacultyService } from './services/facultys/update-single-class-faculty.service';
import { DeleteClassFacultyService } from './services/facultys/delete-class-faculty.service';
import { FetchSingleClassFacultyService } from './services/facultys/fetch-single-class-faculty.service';

import { ClassMemberController } from './controllers/class-member.controller';
import { FetchClassMembersService } from './services/members/fetch-class-members.service';
import { AssistantAssignClassMemberService } from './services/members/assistant-assign-class-member.service';
import { AssistantRevokeClassMemberService } from './services/members/assistant-revoke-class-member.service';
import { MemberRevokeClassMemberService } from './services/members/member-revoke-class-member.service';

import { ClassGroupController } from './controllers/class-group.controller';
import { FetchClassGroupsService } from './services/group/fetch-class-groups.service';
import { FetchSingleClassGroupService } from './services/group/fetch-single-class-group.service';
import { CreateClassGroupService } from './services/group/create-class-group.service';
import { UpdateClassGroupService } from './services/group/update-class-group.service';
import { DeleteClassGroupService } from './services/group/delete-class-group.service';

import { ClassActionsController } from './controllers/class-settings.controller';
import { LeaveClassService } from './services/settings/leave-class.service';
import { DeleteClassService } from './services/settings/delete-class.service';
import { MarkClassAsEndedService } from './services/settings/mark-class-as-ended.service';
import { FetchClassSettingsService } from './services/settings/fetch-class-settings.service';
import { RegenerateClassCodeService } from './services/settings/regenerate-class-code.service';
import { ClassJoinAllowedToggleService } from './services/settings/class-join-allowed-toggle.service';

import { UpdateClassController } from './controllers/update-class.controller';
import { UpdateClassService } from './services/update-class.service';

import { ClassRoleGuard } from './guards/class-role.guard';
import { AgentClassUpdateController } from './controllers/agent-class-update.controller';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Class.name, schema: ClassSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
      { name: ClassUpdate.name, schema: ClassUpdateSchema },
      { name: Material.name, schema: MaterialSchema },
      { name: Faculty.name, schema: FacultySchema },
      { name: ClassGroup.name, schema: ClassGroupSchema },
      { name: Agent.name, schema: AgentSchema },
    ]),
  ],
  controllers: [
    CreateClassController,
    FetchClassesController,
    EnrollClassController,
    FetchClassController,
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
    // class settings controller
    ClassActionsController,
    // Update Class Controller
    UpdateClassController,

    // Agent Controller
    AgentClassUpdateController,
  ],
  providers: [
    // Services
    CreateClassService,
    UpdateClassService,
    FetchEnrolledClassesService,
    EnrollClassService,
    FetchClassService,

    FetchClassUpdateService,
    CreateClassUpdateService,
    FetchSingleClassUpdateService,
    UpdateClassUpdateService,
    TogglePinClassUpdateService,
    DeleteSingleClassUpdateService,

    // Faculty
    FetchClassFacultiesService,
    CreateClassFacultyService,
    UpdateSingleClassFacultyService,
    DeleteClassFacultyService,
    FetchSingleClassFacultyService,

    // Members
    FetchClassMembersService,
    AssistantAssignClassMemberService,
    AssistantRevokeClassMemberService,
    MemberRevokeClassMemberService,

    // Groups
    FetchClassGroupsService,
    FetchSingleClassGroupService,
    CreateClassGroupService,
    UpdateClassGroupService,
    DeleteClassGroupService,

    // Settings
    LeaveClassService,
    DeleteClassService,
    MarkClassAsEndedService,
    FetchClassSettingsService,
    RegenerateClassCodeService,
    ClassJoinAllowedToggleService,

    // Guards
    ClassRoleGuard,
  ],
  // exports: [ClassAccessService, ClassRoleGuard],
})
export class ClassModule { }
