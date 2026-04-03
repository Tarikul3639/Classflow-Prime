"use client";

import React from "react";
import { User, LoaderIcon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

interface ProfileHeaderProps {
  onSave: () => void;
  isChanged: boolean;
}

export default function ProfileHeader({
  onSave,
  isChanged,
}: ProfileHeaderProps) {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.profile.updateProfile.status); // Assuming user data is stored here
  return (
    <header className="sticky top-0 bg-slate-50 pb-4 pt-4 px-4 lg:px-8 border-b border-slate-200 z-50">
      <div className="flex items-center gap-3 mx-auto">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
          <User className="size-5.5" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 truncate">
            Profile Settings
          </h1>
          <p className="text-slate-500 text-xs truncate">
            Manage your account settings and class preferences.
          </p>
        </div>
        <button
          onClick={onSave}
          disabled={!isChanged || loading}
          className={`flex px-4 lg:px-5 h-9 rounded-lg text-[13px] font-semibold transition-colors shadow-sm shadow-primary/20 cursor-pointer ${
            isChanged
              ? "bg-primary text-white hover:bg-primary/90"
              : "hidden bg-slate-200 text-slate-500 border border-slate-300 cursor-not-allowed"
          }`}
        >
          {loading ? (
            <div className="flex items-center text-white">
              <LoaderIcon className="size-4 animate-spin" />
              <span className="ml-1 -mt-0.5 hidden md:inline">Saving...</span>
            </div>
          ) : (
            <div className="flex items-center mb-0.5">
              Save <span className="ml-1 hidden md:inline">Changes</span>
            </div>
          )}
        </button>
      </div>
    </header>
  );
}
