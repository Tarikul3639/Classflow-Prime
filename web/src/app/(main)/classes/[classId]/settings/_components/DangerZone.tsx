"use client";

import React, { useState } from "react";
import { LogOut, Trash2, Archive, AlertTriangle, DoorOpen } from "lucide-react";
import ConfirmDialog from "./ConfirmDialog";
import { Toggle } from "@/components/ui/Toggle";

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────
interface DangerZoneProps {
  className: string;
  isInstructor: boolean;
  isJoiningAllowed: boolean;
  isClassEnded: boolean;
  onLeaveClass: () => void;
  onDeleteClass: () => void;
  onMarkAsEnded: () => void;
  onToggleJoining: () => void;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function DangerZone({
  className,
  isInstructor,
  isJoiningAllowed,
  isClassEnded,
  onLeaveClass,
  onDeleteClass,
  onMarkAsEnded,
  onToggleJoining,
}: DangerZoneProps) {
  // ── Dialog visibility state ──
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEndedDialog, setShowEndedDialog] = useState(false);

  return (
    <>
      {/* ── Card ── */}
      <div className="bg-white rounded-xl shadow-sm border border-red-200 p-4 md:p-6">

        {/* ── Header ── */}
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle size={20} className="text-red-600" />
          <h3 className="text-base font-bold text-slate-900">Danger Zone</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Irreversible actions that will affect your class data
        </p>

        {/* ── Actions ── */}
        <div className="space-y-3">

          {/* ── INSTRUCTOR VIEW ── */}
          {isInstructor ? (
            <>
              {/* Allow Joining + Mark as Ended — only when class is still active */}
              {!isClassEnded && (
                <>
                  {/* Toggle: Allow new students to join */}
                  <div className="border border-slate-200 rounded-lg px-4">
                    <Toggle
                      icon={DoorOpen}
                      iconClassName="rounded-sm text-amber-600 bg-amber-50"
                      title="Allow Joining"
                      description="Control whether new students can join this class."
                      enabled={isJoiningAllowed}
                      onToggle={onToggleJoining}
                    />
                  </div>

                  {/* Mark Semester as Ended */}
                  <div className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="p-1.5 rounded-sm bg-amber-50 shrink-0">
                          <Archive size={18} className="text-amber-600" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-slate-900 text-sm truncate">
                            Mark Semester Ended
                          </h4>
                          <p className="text-xs text-slate-600 truncate">
                            Archive this class. You can still view it but won't
                            receive updates.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowEndedDialog(true)}
                        className="flex items-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-amber-500/30 bg-amber-50 text-amber-700 font-semibold text-xs sm:text-sm hover:bg-amber-100 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
                      >
                        Mark as Ended
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Delete Class — always visible for instructor */}
              <div className="border border-red-200 rounded-lg p-4 bg-red-50/30">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-1.5 rounded-sm bg-red-100 shrink-0">
                      <Trash2 size={18} className="text-red-600" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-slate-900 text-sm truncate">
                        Delete Class
                      </h4>
                      <p className="text-xs text-slate-600 truncate">
                        Permanently delete all class data. This action cannot
                        be undone.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDeleteDialog(true)}
                    className="flex items-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border-2 border-red-500/30 font-semibold text-xs sm:text-sm bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </>

          ) : (
            /* ── STUDENT VIEW ── */
            /* Leave Class — only option for students */
            <div className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="p-1.5 rounded-sm bg-orange-50 shrink-0">
                    <LogOut size={18} className="text-orange-600" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-slate-900 text-sm truncate">
                      Leave Class
                    </h4>
                    <p className="text-xs text-slate-600 truncate">
                      Remove yourself from this class. You'll lose access
                      immediately.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLeaveDialog(true)}
                  className="flex items-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-orange-500/30 bg-orange-50 text-orange-700 font-semibold text-xs sm:text-sm hover:bg-orange-100 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
                >
                  Leave Class
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── Confirm Dialogs ── */}

      {/* Mark as Ended Dialog */}
      <ConfirmDialog
        isOpen={showEndedDialog}
        onClose={() => setShowEndedDialog(false)}
        onConfirm={onMarkAsEnded}
        title="Mark Class as Ended?"
        description="This will archive the class and stop all notifications."
        confirmText="To confirm, type the class name below:"
        confirmValue={className}
        confirmButtonText="Mark as Ended"
        confirmButtonColor="amber"
        icon={
          <div className="p-2 rounded-full bg-amber-100">
            <Archive size={24} className="text-amber-600" />
          </div>
        }
      />

      {/* Leave Class Dialog */}
      <ConfirmDialog
        isOpen={showLeaveDialog}
        onClose={() => setShowLeaveDialog(false)}
        onConfirm={onLeaveClass}
        title="Leave This Class?"
        description="You will immediately lose access to all class materials and updates."
        confirmText="To confirm, type the class name below:"
        confirmValue={className}
        confirmButtonText="Leave Class"
        confirmButtonColor="orange"
        icon={
          <div className="p-2 rounded-full bg-orange-100">
            <LogOut size={24} className="text-orange-600" />
          </div>
        }
      />

      {/* Delete Class Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={onDeleteClass}
        title="Delete Class Permanently?"
        description="This will permanently delete all class data. This action cannot be undone."
        confirmText="To confirm, type the class name below:"
        confirmValue={className}
        confirmButtonText="Delete Forever"
        confirmButtonColor="red"
        icon={
          <div className="p-2 rounded-full bg-red-100">
            <Trash2 size={24} className="text-red-600" />
          </div>
        }
      />
    </>
  );
}