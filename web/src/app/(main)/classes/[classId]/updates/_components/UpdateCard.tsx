"use client";

import React from "react";
import { type LucideIcon, CalendarClock } from "lucide-react";
import UpdateActionMenu from "./UpdateActionMenu";
import UpdateMaterial from "./UpdateMaterials";
import type { Material, PostedBy, UpdateEngagement } from "@/types/update.types";
import { formatRelativeDate } from "@/utils/date.utils";
import { RichTextContent } from "@/components/ui/RichTextContent";

interface UpdateCardProps {
  updateId: string;
  isAdmin?: boolean;
  isPast?: boolean;
  icon?: LucideIcon;
  iconBg?: string;
  iconColor?: string;
  title: string;
  description: string;
  eventAt?: string;
  materials?: Material[];
  engagement?: UpdateEngagement;
  postedBy?: PostedBy;
  isPinned?: boolean;
  createdAt: string;
  updatedAt?: string;
  onTogglePin?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onCopy?: () => void;
}

export default function UpdateCard({
  isAdmin = false,
  updateId,
  isPast = false,
  icon: Icon,
  iconBg,
  iconColor,
  title,
  description,
  eventAt,
  materials,
  postedBy,
  isPinned,
  createdAt,
  updatedAt,
  onCopy,
  onTogglePin,
  onEdit,
  onDelete,
}: UpdateCardProps) {
  return (
    <article id={updateId} className={`bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-3 active:bg-slate-50 transition-all overflow-hidden ${isPast ? "opacity-50 hover:opacity-90" : "hover:shadow-md"}`}>
      {/* Header */}
      <div className="flex justify-between items-start gap-2">
        <div className="flex items-center gap-3 min-w-0">
          {Icon && (
            <div className={`w-10 h-10 shrink-0 rounded-full ${iconBg} flex items-center justify-center ${iconColor}`}>
              <Icon size={18} />
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              {isPinned && (
                <span className="text-[11px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0">
                  Pinned
                </span>
              )}
              <h4 className="text-sm font-bold text-slate-900 truncate">{title}</h4>
            </div>

            <div className="flex items-center gap-2 text-slate-500 text-xs">
              {updatedAt && updatedAt !== createdAt ? (
                <span>
                  Updated:{" "}
                  {formatRelativeDate(updatedAt, {
                    showTime: true,
                    showYear: false,
                    relativeDaysLimit: 3,
                    showTimeAfterLimit: false,
                  })}
                </span>
              ) : (
                <span>
                  Published:{" "}
                  {formatRelativeDate(createdAt, {
                    showTime: true,
                    showYear: false,
                    relativeDaysLimit: 3,
                    showTimeAfterLimit: false,
                  })}
                </span>
              )}
            </div>
          </div>
        </div>

        <UpdateActionMenu
          isAdmin={isAdmin}
          isPinned={isPinned}
          onTogglePin={onTogglePin}
          onEdit={onEdit}
          onDelete={onDelete}
          onCopy={onCopy}
        />
      </div>

      {/* Schedule / Event */}
      {eventAt && (
        <div className="flex items-center gap-1.5 text-blue-600 text-[13px] md:text-sm font-semibold bg-blue-50 w-fit px-2.5 py-1 rounded-md capitalize">
          <CalendarClock className="size-4 md:size-4.5 mt-[0.5px]" />
          <span>
            {formatRelativeDate(eventAt, { showTime: true, showYear: false, relativeDaysLimit: 0 })}
          </span>
        </div>
      )}

      {/* Description Section in UpdateCard */}
      {description && (
        <div className="py-1">
          <RichTextContent html={description} className="px-2" />
        </div>
      )}

      {/* Materials */}
      {materials && materials.length > 0 && (
        <div className="space-y-2">
          {materials.map((att) => (
            <UpdateMaterial key={att._id} material={att} />
          ))}
        </div>
      )}

      {/* Posted By */}
      {postedBy && (
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
          <div className="w-5 h-5 rounded-full bg-slate-200 overflow-hidden shrink-0">
            {postedBy.avatarUrl ? (
              <img src={postedBy.avatarUrl} alt={postedBy.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[11px] font-bold text-slate-500">
                {postedBy.name.split(" ").map((n) => n[0]).join("")}
              </div>
            )}
          </div>
          <span className="text-xs text-slate-400">{postedBy.name}</span>
        </div>
      )}
    </article>
  );
}