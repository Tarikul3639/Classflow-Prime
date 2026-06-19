"use client";
import React from "react";
import { motion } from "framer-motion";
import { GraduationCapIcon } from "lucide-react";

export const Loader = () => {
  return (
    <div className="fixed inset-0 z-999 bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 sm:gap-6">
        {/* Logo badge with orbiting dots */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          {/* Orbiting dots */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            className="absolute inset-0"
          >
            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#399aef]" />
          </motion.div>

          <motion.div
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            className="absolute inset-0"
          >
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-200" />
          </motion.div>

          {/* Dashed ring */}
          <div className="absolute inset-2 rounded-full border-2 border-dashed border-slate-200" />

          {/* Center logo */}
          <motion.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            className="relative w-14 h-14 rounded-2xl bg-[#399aef] shadow-lg shadow-blue-200 flex items-center justify-center"
          >
            <GraduationCapIcon className="w-7 h-7 text-white" strokeWidth={2} />
          </motion.div>
        </div>

        {/* Wordmark */}
        <h2 className="text-base font-black tracking-[0.25em] text-[#0f172a]">
          CLASSFLOW
        </h2>

        {/* Bouncing dots loader */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[#399aef]"
              animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
              transition={{
                repeat: Infinity,
                duration: 0.9,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0.4 }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          className="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
        >
          Syncing Academic Data
        </motion.p>
      </div>

      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50/50 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-slate-50 rounded-full blur-[120px]" />
      </div>
    </div>
  );
};