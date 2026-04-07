"use client";

import { GraduationCap, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center px-4 py-8">
      {/* Content */}
      <div className="w-full max-w-md text-center">
        {/* Logo Section */}
        <div className="mb-8 sm:mb-6">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-primary rounded-lg">
              <GraduationCap className="text-white" size={32} />
            </div>
            {/* <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            ClassFlow
          </h1> */}
          </div>
        </div>
        {/* 404 */}
        <div className="mb-6">
          <p className="text-6xl sm:text-7xl font-bold text-slate-300 mb-2">
            404
          </p>
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
          Page Not Found
        </h2>

        {/* Description */}
        <p className="text-sm sm:text-base text-slate-600 mb-8 leading-relaxed">
          Sorry, the page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.push("/")}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Go Back</span>
          </button>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/80 transition-colors"
          >
            <Home size={18} />
            <span>Home</span>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 text-center text-xs text-slate-500">
        <p>© 2026 ClassFlow. All rights reserved.</p>
      </div>
    </div>
  );
}
