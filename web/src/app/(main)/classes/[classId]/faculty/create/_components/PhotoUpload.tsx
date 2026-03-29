"use client";

import React from "react";
import { Camera, Trash2, Plus } from "lucide-react";

interface PhotoUploadProps {
  imagePreview: string | null;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
}

export default function PhotoUpload({
  imagePreview,
  onImageUpload,
  onRemoveImage,
}: PhotoUploadProps) {
  return (
    <div className=" w-full max-w-70">
      <div className="flex flex-col items-center gap-6">
        {/* Profile Circle Container */}
        <div className="relative group overflow-visible">
          <div className="w-24 md:w-36 h-24 md:h-36 rounded-full ring-4 ring-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] bg-slate-50 flex items-center justify-center transition-all duration-300 group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 overflow-hidden">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Faculty profile"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-300 group-hover:text-primary transition-colors">
                <Camera size={32} strokeWidth={1.5} />
              </div>
            )}

            {/* Hidden Input */}
            <input
              type="file"
              accept="image/*"
              onChange={onImageUpload}
              className="absolute inset-0 opacity-0 cursor-pointer z-20"
            />
          </div>

          {/* Floating Action Buttons */}
          {imagePreview ? (
            <button
              onClick={onRemoveImage}
              type="button"
              className="absolute -bottom-1 -right-1 z-30 p-1.5 md:p-2.5 bg-white text-rose-500 rounded-full shadow-lg border border-slate-100 hover:bg-rose-50 transition-all active:scale-90"
              title="Remove Photo"
            >
              <Trash2 className="size-4 md:size-5" />
            </button>
          ) : (
            <div className="absolute -bottom-1 -right-1 z-10 p-1.5 md:p-2.5 bg-primary text-white rounded-full shadow-lg ring-4 ring-white group-hover:scale-110 transition-transform">
              <Plus className="size-4 md:size-5" strokeWidth={3} />
            </div>
          )}
        </div>

        {/* Text Info */}
        <div className="text-center">
          <h4 className="text-[15px] font-semibold text-slate-800">
            Faculty Avatar
          </h4>
          <p className="text-[12px] text-slate-500 mt-1 font-medium tracking-tight">
            Click the circle to upload photo
          </p>
          <p className="text-[12px] text-slate-400 mt-1">
            Recommended size: 256x256 pixels
          </p>
        </div>
      </div>
    </div>
  );
}
