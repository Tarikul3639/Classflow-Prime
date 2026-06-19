import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// Entities
import { Agent, AgentSchema } from '../../infrastructure/database/entities/agent.entity';
import { Class, ClassSchema } from '../../infrastructure/database/entities/class.entity';
import { ClassGroup, ClassGroupSchema } from '../../infrastructure/database/entities/group.entity';
import { ClassUpdate, ClassUpdateSchema } from '../../infrastructure/database/entities/update.entity';
import { Enrollment, EnrollmentSchema } from '../../infrastructure/database/entities/enrollment.entity';
import { Faculty, FacultySchema } from '../../infrastructure/database/entities/faculty.entity';
import { Material, MaterialSchema } from '../../infrastructure/database/entities/material.entity';
import { User, UserSchema } from '../../infrastructure/database/entities/user.entity';

// Controllers
import { AgentClassUpdateController } from './controllers/agent-class-update.controller';
import { ClassActionsController } from './controllers/class-settings.controller';
import { ClassFacultyController } from './controllers/class-faculty.controller';
import { ClassGroupController } from './controllers/class-group.controller';
import { ClassMemberController } from './controllers/class-member.controller';
import { CreateClassController } from './controllers/create-class.controller';
import { CreateClassUpdateController } from './controllers/create-class-update.controller';
import { DeleteSingleClassUpdateController } from './controllers/delete-single-class-update.controller';
import { EnrollClassController } from './controllers/enroll-class.controller';
import { FetchClassController } from './controllers/fetch-class.controller';
import { FetchClassUpdateController } from './controllers/fetch-class-update.controller';
import { FetchClassesController } from './controllers/fetch-enrolled-classes.controller';
import { FetchSingleClassUpdateController } from './controllers/fetch-single-class-update.controller';
import { TogglePinClassUpdateController } from './controllers/toggle-pin-class-update.controller';
import { UpdateClassController } from './controllers/update-class.controller';
import { UpdateClassUpdateController } from './controllers/update-class-update.controller';

// Services
import { AssistantAssignClassMemberService } from './services/members/assistant-assign-class-member.service';
import { AssistantRevokeClassMemberService } from './services/members/assistant-revoke-class-member.service';
import { ClassJoinAllowedToggleService } from './services/settings/class-join-allowed-toggle.service';
import { CreateClassFacultyService } from './services/facultys/create-class-faculty.service';
import { CreateClassGroupService } from './services/group/create-class-group.service';
import { CreateClassService } from './services/create-class.service';
import { CreateClassUpdateService } from './services/updates/create-class-update.service';
import { DeleteClassFacultyService } from './services/facultys/delete-class-faculty.service';
import { DeleteClassGroupService } from './services/group/delete-class-group.service';
import { DeleteClassService } from './services/settings/delete-class.service';
import { DeleteSingleClassUpdateService } from './services/updates/delete-single-class-update.service';
import { EnrollClassService } from './services/enroll-class.service';
import { FetchClassFacultiesService } from './services/facultys/fetch-class-faculties.service';
import { FetchClassGroupsService } from './services/group/fetch-class-groups.service';
import { FetchClassMembersService } from './services/members/fetch-class-members.service';
import { FetchClassSettingsService } from './services/settings/fetch-class-settings.service';
import { FetchClassUpdateService } from './services/updates/fetch-class-update.service';
import { FetchEnrolledClassesService } from './services/fetch-enrolled-classes.service';
import { FetchClassService } from './services/fetch-class.service';
import { FetchSingleClassFacultyService } from './services/facultys/fetch-single-class-faculty.service';
import { FetchSingleClassGroupService } from './services/group/fetch-single-class-group.service';
import { FetchSingleClassUpdateService } from './services/updates/fetch-single-class-update.service';
import { LeaveClassService } from './services/settings/leave-class.service';
import { MarkClassAsEndedService } from './services/settings/mark-class-as-ended.service';
import { MemberRevokeClassMemberService } from './services/members/member-revoke-class-member.service';
import { RegenerateClassCodeService } from './services/settings/regenerate-class-code.service';
import { TogglePinClassUpdateService } from './services/updates/toggle-pin-class-update.service';
import { UpdateClassGroupService } from './services/group/update-class-group.service';
import { UpdateClassService } from './services/update-class.service';
import { UpdateClassUpdateService } from './services/updates/update-class-update.service';
import { UpdateSingleClassFacultyService } from './services/facultys/update-single-class-faculty.service';

// Guards
import { ClassRoleGuard } from './guards/class-role.guard';

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
    AgentClassUpdateController,
    ClassActionsController,
    ClassFacultyController,
    ClassGroupController,
    ClassMemberController,
    CreateClassController,
    CreateClassUpdateController,
    DeleteSingleClassUpdateController,
    EnrollClassController,
    FetchClassController,
    FetchClassUpdateController,
    FetchClassesController,
    FetchSingleClassUpdateController,
    TogglePinClassUpdateController,
    UpdateClassController,
    UpdateClassUpdateController,
  ],
  providers: [
    AssistantAssignClassMemberService,
    AssistantRevokeClassMemberService,
    ClassJoinAllowedToggleService,
    ClassRoleGuard,
    CreateClassFacultyService,
    CreateClassGroupService,
    CreateClassService,
    CreateClassUpdateService,
    DeleteClassFacultyService,
    DeleteClassGroupService,
    DeleteClassService,
    DeleteSingleClassUpdateService,
    EnrollClassService,
    FetchClassFacultiesService,
    FetchClassGroupsService,
    FetchClassMembersService,
    FetchClassSettingsService,
    FetchClassUpdateService,
    FetchEnrolledClassesService,
    FetchClassService,
    FetchSingleClassFacultyService,
    FetchSingleClassGroupService,
    FetchSingleClassUpdateService,
    LeaveClassService,
    MarkClassAsEndedService,
    MemberRevokeClassMemberService,
    RegenerateClassCodeService,
    TogglePinClassUpdateService,
    UpdateClassGroupService,
    UpdateClassService,
    UpdateClassUpdateService,
    UpdateSingleClassFacultyService,
  ],
})
export class ClassModule {}