"use client";

import Link from "next/link";
import { ArrowLeft, Save, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface EditorHeaderProps {
  classId: string;
  isNew: boolean;
  isLoading: boolean;
  error?: string | null;
}

export const EditorHeader = ({
  classId,
  isNew,
  isLoading,
  error,
}: EditorHeaderProps) => {
  const router = useRouter();

  return (
    <>
      {/* Header - Sticky with backdrop blur */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-3 md:py-4 transition-all">
        <div className="flex items-center justify-between mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={router.back}
              disabled={isLoading}
              className="group flex items-center justify-center p-2 rounded-lg hover:bg-white transition-colors border border-slate-200 bg-white cursor-pointer hover:border-primary/30"
            >
              <ArrowLeft
                className="text-slate-900 group-hover:text-primary group-hover:-translate-x-0.5 transition-all duration-200"
                size={18}
              />
            </button>
            <h1 className="text-lg font-bold text-slate-900">
              {isNew ? "Create" : "Edit"}
            </h1>
          </div>

          {/* Desktop Actions */}
          <div className="flex items-center gap-3">
            <Link href={`/classes/${classId}/updates`}>
              <button
                disabled={isLoading}
                className="flex items-center gap-2 px-5 py-2.5 md:py-3 rounded-2xl bg-gray-200 dark:bg-slate-800 text-slate-900 hover:text-red-500 hover:bg-red-100 transition-all duration-300 disabled:opacity-50 cursor-pointer"
              >
                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.25em]">
                  Discard
                </span>
              </button>
            </Link>

            <button
              type="submit"
              form="groupForm"
              disabled={isLoading}
              className="group relative flex items-center justify-center gap-2 px-6 py-2.5 md:py-3 rounded-2xl bg-[#399aef] text-white overflow-hidden transition-all duration-500 hover:bg-[#2d82cc] hover:shadow-[0_0_20px_rgba(57,154,239,0.4)] active:scale-[0.96] disabled:opacity-50 cursor-pointer"
            >
              {/* Shine effect */}
              <div className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-[-25deg] -translate-x-full group-hover:animate-shine" />

              {isLoading ? (
                <Loader2 className="size-3.5 md:size-4  animate-spin transition-transform" />
              ) : (
                <Save className="size-3.5 md:size-4 group-hover:scale-110 transition-transform" />
              )}
              <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.25em]">
                {isLoading ? "Publishing..." : isNew ? "Publish" : "Update"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Error Message - Below header */}
      {error && (
        <div className="px-4 md:px-8 pt-4">
          <div className="mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full"
              >
                <div className="flex items-center gap-3 px-4 py-2.5 bg-red-50/60 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-full backdrop-blur-md relative overflow-hidden shadow-sm shadow-red-100/20">
                  {/* Icon Area: Fixed size */}
                  <div className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 bg-red-100 dark:bg-red-900/40 rounded-2xl flex items-center justify-center text-red-600 dark:text-red-400">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 10, 0] }}
                      transition={{
                        repeat: Infinity,
                        duration: 2,
                        repeatDelay: 3,
                      }}
                    >
                      <AlertCircle size={20} strokeWidth={2.5} />
                    </motion.div>
                  </div>

                  {/* Text Area: Flexible width */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-red-800 dark:text-red-300 leading-tight sm:leading-snug">
                      {error}
                    </p>
                  </div>

                  {/* Decorative Blur Element */}
                  <div className="hidden sm:block absolute top-0 right-0 -mr-4 -mt-4 w-12 h-12 bg-red-200/30 dark:bg-red-500/20 blur-2xl rounded-full" />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}
    </>
  );
};
