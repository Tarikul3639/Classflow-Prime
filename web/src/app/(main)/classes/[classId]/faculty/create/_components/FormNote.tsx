"use client";

import React from "react";

export default function FormNote() {
  return (
    <div className="col-start-1 col-end-2 bg-blue-50 border border-blue-200 rounded-xl p-4">
      <p className="text-xs text-slate-600 leading-relaxed">
        <span className="font-semibold text-slate-900">Note:</span> All
        information will be reviewed before being added to the faculty
        directory. Please ensure all details are accurate.
      </p>
    </div>
  );
}