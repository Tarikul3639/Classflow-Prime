"use client";

import React from "react";
import { Edit, Verified } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfilePictureProps {
  imageUrl: string;
  name: string;
  role: string;
  email: string;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
}

export default function ProfilePicture({
  imageUrl,
  name,
  role,
  email,
  onImageUpload,
  isUploading,
}: ProfilePictureProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative group">
        <Avatar className="h-28 w-28 rounded-full bg-cover bg-center border-4 border-slate-50 shadow-lg">
          <AvatarImage
            className="w-full h-full object-cover"
            src={imageUrl}
            alt={name}
          />
          <AvatarFallback className="w-full h-full text-3xl font-black">
            {name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <button
          className={`absolute group bottom-0 right-0 bg-primary text-white p-1.5 rounded-full shadow-lg border-4 border-white transition-transform
    ${isUploading ? "cursor-not-allowed opacity-50" : "cursor-pointer! hover:scale-105 hover:bg-primary/90 active:scale-95"}
  `}
          title="Change Profile Picture"
        >
          {/* Hidden Input */}
          <input
            disabled={isUploading}
            type="file"
            accept="image/*"
            onChange={onImageUpload}
            className={`absolute inset-0 opacity-0 ${
              isUploading ? "pointer-events-none" : "cursor-pointer"
            }`}
          />
          <Edit size={14} className="pointer-events-none" />
        </button>
      </div>
      <h2 className="mt-5 text-xl font-bold text-slate-900">{name}</h2>
      <p className="text-slate-500 font-medium text-sm">{role}</p>
      <div className="mt-3 flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-primary font-medium text-xs">
        <Verified size={14} />
        {email}
      </div>
    </div>
  );
}
