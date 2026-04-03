"use client";

import React from "react";
import { Bell, Moon, Globe } from "lucide-react";
import { Toggle } from "@/components/ui/Toggle";
import PreferenceItem from "./PreferenceItem";

import { useAppSelector } from "@/store/hooks";

interface PreferencesProps {
  notifications: boolean;
  darkMode: boolean;
  onNotificationsToggle: () => void;
  onDarkModeToggle: () => void;
  onLanguageClick: () => void;
  notificationLoading?: boolean;
  notificationError?: string | null;
}

export default function Preferences({
  notifications,
  darkMode,
  onNotificationsToggle,
  onDarkModeToggle,
  onLanguageClick,
  notificationLoading = false,
  notificationError = null,
}: PreferencesProps) {

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <h3 className="text-base font-bold text-slate-900 mb-4">Preferences</h3>
      <div className="divide-y divide-slate-100">

        {/* Notification toggle */}
        <div className="relative">
          <Toggle
            icon={Bell}
            title="Push Notifications"
            description="Stay updated with class announcements"
            enabled={notifications}
            onToggle={onNotificationsToggle}
            disabled={notificationLoading}
          />
          {notificationError && (
            <p className="text-xs text-red-500 mt-2 ml-10">
              {notificationError}
            </p>
          )}
        </div>

        <Toggle
          icon={Moon}
          title="Dark Mode"
          description="Reduce eye strain in low light"
          enabled={darkMode}
          onToggle={onDarkModeToggle}
          disabled
        />

        <PreferenceItem
          icon={Globe}
          title="Language"
          description="System default language"
          value="English (US)"
          onClick={onLanguageClick}
        />
      </div>
    </div>
  );
}