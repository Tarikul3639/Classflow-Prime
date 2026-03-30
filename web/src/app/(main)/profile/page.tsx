"use client";

import React, { use, useCallback, useState } from "react";
// Import form ./_components
import ProfileHeader from "./_components/ProfileHeader";
import ProfilePicture from "./_components/ProfilePicture";
import PersonalInformation from "./_components/PersonalInformation";
import LogoutButton from "./_components/LogoutButton";
import EnrolledClasses from "./_components/EnrolledClasses";
import Preferences from "./_components/Preferences";
import VersionInfo from "./_components/VersionInfo";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  // signoutAllThunk,
  signoutCurrentThunk,
} from "@/store/features/auth/thunks/signout.thunk";
import { updateProfileThunk } from "@/store/features/profile/thunks/update-profile.thunk";
import { Loader } from "@/components/ui/Loader";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useFileUpload } from "@/hooks/useCloudinary";

const ProfileSettings: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, status } = useAppSelector((state) => state.profile.fetchUser); // Assuming user data is stored here
  const { loading } = useAppSelector(
    (state) => state.auth.signout.signoutCurrent,
  ); // For logout feedback

  const [userForm, setUserForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: user?.bio || "",
    avatarUrl: user?.avatarUrl || "",
  });

  const [initialUserForm, setInitialUserForm] = useState(userForm);

  const [preferences, setPreferences] = useState({
    notifications: true,
    darkMode: false,
  });

  const isChanged =
    JSON.stringify(userForm) !== JSON.stringify(initialUserForm);

  const handleChange = (field: keyof typeof userForm, value: string) => {
    setUserForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!isChanged) return console.log("No changes to save");
    dispatch(updateProfileThunk(userForm))
      .unwrap()
      .then((res) => {
        setInitialUserForm(userForm);
        toast.success("Profile updated successfully", {
          description: res.message,
          position: "top-center",
        });
      })
      .catch((err) => {
        toast.error("Failed to update profile", {
          description: err,
          position: "top-center",
        });
      });
  };

  const handleToggle = (field: keyof typeof preferences) => {
    setPreferences((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleLogout = async () => {
    dispatch(signoutCurrentThunk())
      .unwrap()
      .then((res) => {
        toast.success(res.message, { position: "top-center" });
        router.push("/sign-in");
      })
      .catch((err) =>
        toast("Logout Failed", { description: err, position: "top-center" }),
      );
  };

  const handleLanguageSettings = () => {
    console.log("Opening language settings...");
  };

    const { upload, loading: uploadLoading } = useFileUpload();
  
    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
  
      const promise = upload(file, "avatars");
  
      toast.promise(promise, {
        loading: "Uploading image...",
        success: "Image uploaded",
        error: "Failed to upload image",
      });
  
      try {
        const res = await promise;
  
        setUserForm((prev) => ({
          ...prev,
          avatarUrl: res.secure_url, //  real URL from Cloudinary
        }));
      } catch (err) {
        console.error(err);
      }
    };

  if (status.loading || !user) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <ProfileHeader onSave={handleSave} isChanged={isChanged} />

      <div className="flex-1 overflow-y-auto pb-24 lg:pb-8">
        <div className="mx-auto px-4 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column - Profile Info */}
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <ProfilePicture
                  imageUrl={userForm.avatarUrl || ""}
                  name={userForm.name || ""}
                  role="We are working on it..."
                  email={userForm.email || ""}
                  onImageUpload={handleAvatarUpload}
                  isUploading={uploadLoading}
                />

                <PersonalInformation
                  name={userForm.name || ""}
                  email={userForm.email || ""}
                  bio={userForm.bio || "White space for bio..."}
                  onNameChange={(value) => handleChange("name", value)}
                  onBioChange={(value) => handleChange("bio", value)}
                />

                <LogoutButton isLoading={loading} onLogout={handleLogout} />
              </div>
            </div>

            {/* Right Column - Classes & Preferences */}
            <div className="lg:col-span-7 space-y-5">
              {user.enrolledClasses.length > 0 && (
                <EnrolledClasses classes={user.enrolledClasses} />
              )}

              <Preferences
                notifications={preferences.notifications}
                darkMode={preferences.darkMode}
                onNotificationsToggle={() => handleToggle("notifications")}
                onDarkModeToggle={() => handleToggle("darkMode")}
                onLanguageClick={handleLanguageSettings}
              />

              <VersionInfo />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
