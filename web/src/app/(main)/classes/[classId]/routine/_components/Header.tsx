"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, AlertTriangle, Printer } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface HeaderProps {
  isAdmin: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  loading?: boolean;
  error?: string | null;
  onDeleteRoutine?: () => void;
  onTodayClick?: () => void;
  onPrint?: () => void; // Optional print handler
}

export const Header: React.FC<HeaderProps> = ({
  isAdmin,
  open,
  setOpen,
  loading,
  error,
  onDeleteRoutine,
  onTodayClick,
  onPrint,
}) => {
  const [deleteOpen, setDeleteOpen] = useState(false);

  const today = new Date();

  const formattedDate = today.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`w-full flex gap-4 sm:flex-row items-center justify-between px-4 pt-6 pb-2.5 ${isAdmin ? "flex-col" : ""}`}
      >
        {/* Left Section */}
        <div
          className="flex flex-col max-sm:w-full min-w-24 cursor-pointer select-none"
          onClick={onTodayClick}
        >
          <p className="text-sm text-gray-400 font-medium tracking-wide">
            {formattedDate}
          </p>
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">
            Today
          </h1>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
          {/* Print Button (visible for all users) */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={onPrint}
            className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-2.5 rounded-sm font-semibold text-xs shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer"
          >
            <Printer strokeWidth={2.5} className="size-4" />
            <span className="truncate sm:hidden">Print</span>
            <span className="hidden sm:inline">Print Routine</span>
          </motion.button>

          {isAdmin && (
            <>
              {/* Delete Routine Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setDeleteOpen(true)}
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-2.5 rounded-sm font-semibold text-xs shadow-lg shadow-red-500/20 hover:shadow-red-500/50 transition-shadow cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Trash2 strokeWidth={2.5} className="size-4" />
                <span className="truncate sm:hidden">
                  {loading ? "Deleting..." : "Delete"}
                </span>
                <span className="hidden sm:inline">
                  {loading ? "Deleting Routine..." : "Delete Routine"}
                </span>
              </motion.button>

              {/* Add Routine Slot Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setOpen(true)}
                className="flex items-center justify-center gap-2 bg-linear-to-r from-primary to-primary text-white px-4 py-2.5 rounded-sm font-semibold text-xs shadow-lg shadow-primary/20 hover:shadow-primary/50 transition-shadow cursor-pointer"
              >
                <Plus strokeWidth={2.5} className="size-4" />
                <span className="truncate sm:hidden">Add</span>
                <span className="hidden sm:inline">
                  Add Routine Slot
                </span>
              </motion.button>
            </>
          )}
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="mx-4 mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2"
        >
          <AlertTriangle
            size={16}
            className="mt-0.5 shrink-0 text-red-500"
          />
          <p className="text-[12px] font-medium leading-relaxed text-red-600">
            {error}
          </p>
        </motion.div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => onDeleteRoutine?.()}
        variant="delete"
        title="Delete Routine?"
        description="All routine slots will be permanently removed."
        loading={loading}
      />
    </>
  );
};