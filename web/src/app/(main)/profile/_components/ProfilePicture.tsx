"use client";

import React from "react";
import { Edit, CheckCircle2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfilePictureProps {
  imageUrl: string;
  name: string;
  username: string;
  email: string;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
}

export default function ProfilePicture({
  imageUrl,
  name,
  username,
  email,
  onImageUpload,
  isUploading,
}: ProfilePictureProps) {
  return (
    <div className="flex flex-col items-center text-center">
      {/* Avatar */}
      <div className="relative mb-4">
        <Avatar className="h-24 w-24 rounded-full border-[3px] border-white shadow-md">
          <AvatarImage
            className="w-full h-full object-cover"
            src={imageUrl}
            alt={name}
          />
          <AvatarFallback className="text-2xl font-bold bg-blue-50 text-primary">
            {name.charAt(0)}
          </AvatarFallback>
        </Avatar>

        {/* Upload button */}
        <button
          disabled={isUploading}
          className={`absolute bottom-0.5 right-0.5 w-7 h-7 rounded-full bg-primary border-2 border-slate-200 flex items-center justify-center transition-transform z-10
            ${isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-110 active:scale-95"}`}
          title="Change profile picture"
        >
          <input
            disabled={isUploading}
            type="file"
            accept="image/*"
            onChange={onImageUpload}
            title="Change profile picture"
            className={`absolute inset-0 opacity-0 rounded-full ${isUploading ? "pointer-events-none" : "cursor-pointer hover:cursor-pointer"}`}
          />
          <Edit size={12} className="text-white pointer-events-none" />
        </button>
      </div>

      {/* Name */}
      <h2 className="text-[17px] font-bold text-slate-900 leading-tight">
        {name}
      </h2>

      {/* Username */}
      <p className="text-sm text-slate-400 mt-0.5 mb-2.5">@{username}</p>

      {/* Email badge */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50">
        <CheckCircle2 size={13} className="text-primary shrink-0" />
        <span className="text-xs font-medium text-primary">{email}</span>
      </div>
    </div>
  );
}
