"use client";

import React, { useEffect, useState } from "react";
import { UserX } from "lucide-react";
import ProfileHeader from "./_components/ProfileHeader";
import ProfilePicture from "./_components/ProfilePicture";
import PersonalInformation from "./_components/PersonalInformation";
import LogoutButton from "./_components/LogoutButton";
import EnrolledClasses from "./_components/EnrolledClasses";
import Preferences from "./_components/Preferences";
import VersionInfo from "./_components/VersionInfo";
import { EmptyState } from "@/components/ui/EmptyState";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { signoutCurrentThunk } from "@/store/features/auth/thunks/signout.thunk";
import { updateProfileThunk } from "@/store/features/profile/thunks/update-profile.thunk";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useFileUpload } from "@/hooks/useCloudinary";
import { TopLoader } from "@/components/ui/TopLoader";
import { usePushNotification } from "@/hooks/usePushNotification";

const ProfileSettings: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { user, status } = useAppSelector((state) => state.profile.fetchUser);
  const { loading: logoutLoading } = useAppSelector(
    (state) => state.auth.signout.signoutCurrent,
  );

  const userId = useAppSelector((state) => state.profile.fetchUser.user?._id);
  const {
    isSubscribed,
    toggleNotification,
    loading: notificationLoading,
  } = usePushNotification(userId ?? null);

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    bio: "",
    avatarUrl: "",
  });

  const [initialUserForm, setInitialUserForm] = useState(userForm);
  const [notificationError, setNotificationError] = useState<string | null>(
    null,
  );

  // Sync Redux user data with local form state
  useEffect(() => {
    if (user) {
      const data = {
        name: user.name || "",
        email: user.email || "",
        bio: user.bio || "",
        avatarUrl: user.avatarUrl || "",
      };
      setUserForm(data);
      setInitialUserForm(data);
    }
  }, [user]);

  const [preferences, setPreferences] = useState({
    notifications: isSubscribed,
    darkMode: false,
  });

  // Sync push notification state with preferences
  useEffect(() => {
    setPreferences((prev) => ({
      ...prev,
      notifications: isSubscribed,
    }));
  }, [isSubscribed]);

  const isChanged =
    JSON.stringify(userForm) !== JSON.stringify(initialUserForm);

  const handleChange = (field: keyof typeof userForm, value: string) => {
    setUserForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!isChanged) return;

    const promise = dispatch(updateProfileThunk(userForm)).unwrap();

    toast.promise(promise, {
      loading: "Saving changes...",
      success: (res) => {
        setInitialUserForm(userForm);
        return res.message || "Profile updated successfully";
      },
      error: (err) => err || "Failed to update profile",
    });
  };

  const handleNotificationToggle = async () => {
    setNotificationError(null);

    const promise = toggleNotification();

    toast.promise(promise, {
      loading: "Updating notification settings...",
      success: () => {
        return isSubscribed
          ? "Notifications disabled successfully"
          : "Notifications enabled successfully";
      },
      error: (err) => {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to update notification settings";
        setNotificationError(errorMessage);
        console.error("Notification error:", err);
        return errorMessage;
      },
    });
  };

  const handleToggle = (field: keyof typeof preferences) => {
    if (field === "notifications") {
      handleNotificationToggle();
    } else {
      setPreferences((prev) => ({ ...prev, [field]: !prev[field] }));
    }
  };

  const handleLogout = async () => {
    const promise = dispatch(signoutCurrentThunk()).unwrap();

    toast.promise(promise, {
      loading: "Logging out...",
      success: () => {
        router.push("/sign-in");
        return "Logged out successfully";
      },
      error: (err) => err || "Logout failed",
    });
  };

  const { upload, loading: uploadLoading } = useFileUpload();

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const promise = upload(file, "avatars");

    toast.promise(promise, {
      loading: "Uploading avatar...",
      success: (res) => {
        setUserForm((prev) => ({ ...prev, avatarUrl: res.secure_url }));
        return "Avatar updated successfully";
      },
      error: "Avatar upload failed",
    });
  };

  return (
    <main className="relative flex flex-col min-h-screen bg-slate-50">
      {/* Fixed Header */}
      <ProfileHeader onSave={handleSave} isChanged={isChanged} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* ── State 1: Loading ── */}
        {status.loading && (
          <div className="flex-1 flex items-center justify-center">
            <TopLoader isLoading={status.loading} />
          </div>
        )}

        {/* ── State 2: User found ── */}
        {!status.loading && user && (
          <div className="flex-1 overflow-y-auto pb-24 lg:pb-8">
            <div className="mx-auto px-4 lg:px-8 py-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-5 space-y-5">
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                    <ProfilePicture
                      imageUrl={userForm.avatarUrl}
                      name={userForm.name}
                      username={userForm.email.split("@")[0]}
                      email={userForm.email}
                      onImageUpload={handleAvatarUpload}
                      isUploading={uploadLoading}
                    />
                    <PersonalInformation
                      name={userForm.name}
                      email={userForm.email}
                      bio={userForm.bio || "No bio added yet"}
                      onNameChange={(value) => handleChange("name", value)}
                      onBioChange={(value) => handleChange("bio", value)}
                    />
                    <div className="pt-4 mt-4 border-t border-slate-100">
                      <LogoutButton
                        isLoading={logoutLoading}
                        onLogout={handleLogout}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-7 space-y-5">
                  {user.enrolledClasses?.length > 0 && (
                    <EnrolledClasses classes={user.enrolledClasses} />
                  )}
                  <Preferences
                    notifications={preferences.notifications}
                    darkMode={preferences.darkMode}
                    onNotificationsToggle={() => handleToggle("notifications")}
                    onDarkModeToggle={() => handleToggle("darkMode")}
                    onLanguageClick={() => console.log("Language settings")}
                    notificationLoading={notificationLoading}
                    notificationError={notificationError}
                  />
                  <VersionInfo />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── State 3: No user + not loading ── */}
        {!status.loading && !user && (
          <div className="flex-1 flex items-center justify-center p-4">
            <EmptyState
              icon={UserX}
              title="Profile Not Found"
              description="We couldn't retrieve your profile data at this moment."
              actionLabel="Try Reloading"
              onAction={() => window.location.reload()}
            />
          </div>
        )}
      </div>
    </main>
  );
};

export default ProfileSettings;
