"use client";

import { MoreVertical, Pin, PinOff, Pencil, Trash2, UserPlus, Copy } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UpdateActionMenuProps {
  isAdmin?: boolean;
  isPinned?: boolean;
  onTogglePin?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onSaveContact?: () => void;
  onCopy?: () => void;
}

export default function UpdateActionMenu({
  isAdmin = false,
  isPinned,
  onTogglePin,
  onEdit,
  onDelete,
  onSaveContact,
  onCopy,
}: UpdateActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
          <MoreVertical size={16} className="text-slate-500" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-40 border border-gray-300">
        {isAdmin && (
          isPinned ? (
            <DropdownMenuItem onClick={onTogglePin} disabled={true}>
              <PinOff size={14} />
              Unpin
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={onTogglePin} disabled={true}>
              <Pin size={14} />
              Pin
            </DropdownMenuItem>
          ))}

        {isAdmin && (
          <DropdownMenuItem onClick={onEdit}>
            <Pencil size={14} />
            Edit
          </DropdownMenuItem>
        )}

        {/* COPY */}
        <DropdownMenuItem onClick={onCopy}>
          <Copy size={14} />
          Copy
        </DropdownMenuItem>

        {/* SAVE CONTACT */}
        <DropdownMenuItem onClick={onSaveContact}>
          <UserPlus size={14} />
          Save Contact
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {isAdmin && (
          <DropdownMenuItem onClick={onDelete} className="text-red-500 focus:text-red-500">
            <Trash2 size={14} />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}