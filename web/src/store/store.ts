import { configureStore, combineReducers } from "@reduxjs/toolkit";

// Auth slices
import signinReducer from "./features/auth/slices/signin.slice";
import signupReducer from "./features/auth/slices/signup.slice";
import signoutReducer from "./features/auth/slices/signout.slice";
import passwordResetReducer from "./features/auth/slices/password-reset.slice";

// Combine auth slices
const authReducer = combineReducers({
  signin: signinReducer,
  signup: signupReducer,
  signout: signoutReducer,
  passwordReset: passwordResetReducer,
});

// Classes slices
import createClassReducer from "./features/classes/slices/create-class.slice";
import enrollClass from "./features/classes/slices/enroll-class.slice";
import fetchSingleClassReducer from "./features/classes/slices/fetch-single-class.slice";
import fetchEnrolledClassesReducer from "./features/classes/slices/fetch-enrolled-classes.slice";

// Class Faculty slices
import classFacultyReducer from "./features/classes/slices/class-faculty.slice";

// Class Members slices
import classMemberReducer from "./features/classes/slices/members/class-member.slice";

// Class Groups slices
import classGroupReducer from "./features/classes/slices/groups/class-group.slice";

// Class Settings slices
import classSettingsReducer from "./features/classes/slices/settings/class-setting.slice";

// Class Updates slices
import classUpdatesReducer from "./features/classes/slices/class-updates.slice";

// Class routine slices
import classRoutineSlice from "./features/classes/slices/routine/routine.slice";

const classesReducer = combineReducers({
  createClass: createClassReducer,
  enrollClass: enrollClass,
  // Class updates are now normalized by classId to prevent data overlap and improve performance.
  classUpdates: classUpdatesReducer,
  // Class faculty is now organized by classId, allowing for efficient access and management of faculty data per class.
  classFaculty: classFacultyReducer,
  // Class Groups are also normalized by classId, ensuring that group data is properly segmented and easily retrievable for each class.
  classGroups: classGroupReducer,

  fetchSingleClass: fetchSingleClassReducer,
  fetchEnrolledClasses: fetchEnrolledClassesReducer,
  classMembers: classMemberReducer,
  classSettings: classSettingsReducer,
  routine: classRoutineSlice,
});

// Profile slices
import fetchUserReducer from "./features/profile/slices/fetch-user.slice";
import updateProfileReducer from "./features/profile/slices/update-profile.slice";

const profileReducer = combineReducers({
  fetchUser: fetchUserReducer,
  updateProfile: updateProfileReducer,
});

// Notifications slices
import notificationReducer from "./features/notifications/slices/notification.slice";

// Dashboard slices
import dashboardReducer from "./features/dashboard/slice/dashboard.slice";

// Agent slices
import agentReducer from "./features/agent/agent.slice";

// Root store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    classes: classesReducer,
    profile: profileReducer,
    notification: notificationReducer,
    dashboard: dashboardReducer,
    agent: agentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;