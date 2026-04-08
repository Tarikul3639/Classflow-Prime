"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

interface TopLoaderProps {
  isLoading: boolean;
  bgColor?: string;
}

export const TopLoader: React.FC<TopLoaderProps> = ({
  isLoading,
  bgColor = "#fff", // Default to white background, can be overridden by parent
}) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          // Starts above the screen (-100%)
          initial={{ y: -50, x: "-50%", opacity: 0 }}
          // Slides down to 20px from the top
          animate={{ y: 20, x: "-50%", opacity: 1 }}
          // Slides back up when hidden
          exit={{ y: -50, x: "-50%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30, duration: 0.5 }}
          className="absolute top-0 left-1/2 z-9999"
        >
          <div className={`flex items-center justify-center w-10 h-10 rounded-full shadow-lg border border-slate-200`} style={{ backgroundColor: bgColor }}>
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
