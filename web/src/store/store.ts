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
import fetchClassUpdatesReducer from "./features/classes/slices/fetch-class-updates.slice";
import createClassUpdateReducer from "./features/classes/slices/create-class-update.slice";
import fetchSingleClassReducer from "./features/classes/slices/fetch-single-class.slice";
import fetchEnrolledClassesReducer from "./features/classes/slices/fetch-enrolled-classes.slice";
import fetchSingleClassUpdateReducer from "./features/classes/slices/fetch-single-class-update.slice";
import updateClassUpdateReducer from "./features/classes/slices/update-class-update.slice";

// Class Faculty slices
import classFacultyReducer from "./features/classes/slices/class-faculty.slice";
import fetchSingleClassFaculty from './features/classes/slices/fetch-single-class-faculty.slice'

// Class Members slices
import classMemberReducer from "./features/classes/slices/members/class-member.slice";

// Class Groups slices
import classGroupReducer from "./features/classes/slices/groups/class-group.slice";

// Class Settings slices
import classSettingsReducer from "./features/classes/slices/settings/class-setting.slice";

const classesReducer = combineReducers({
  createClass: createClassReducer,
  enrollClass: enrollClass,
  fetchClassUpdates: fetchClassUpdatesReducer,
  createClassUpdate: createClassUpdateReducer,
  fetchSingleClass: fetchSingleClassReducer,
  fetchEnrolledClasses: fetchEnrolledClassesReducer,
  fetchSingleClassUpdate: fetchSingleClassUpdateReducer,
  updateClassUpdate: updateClassUpdateReducer,

  classFaculty: classFacultyReducer,
  fetchSingleClassFaculty: fetchSingleClassFaculty,
  classMembers: classMemberReducer,
  classGroups: classGroupReducer,
  classSettings: classSettingsReducer,
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

// Root store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    classes: classesReducer,
    profile: profileReducer,
    notification: notificationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;