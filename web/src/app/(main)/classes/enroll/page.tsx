"use client";

import React, { useState, useRef, KeyboardEvent, ClipboardEvent } from "react";
import {
  ArrowLeft,
  Lightbulb,
  Search,
  Rocket,
  HelpCircle,
  Smartphone,
  QrCode,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { enrollClass } from "@/store/features/classes/thunks/enroll-class.thunk";
import { resetEnrollState } from "@/store/features/classes/slices/enroll-class.slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toast } from "sonner";

export default function EnrollClassPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isEnrolling } = useAppSelector((state) => state.classes.enrollClass);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    // Only allow alphanumeric characters
    const sanitized = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (sanitized.length > 1) return;

    const newCode = [...code];
    newCode[index] = sanitized;
    setCode(newCode);

    // Auto-focus next input
    if (sanitized && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");
    const newCode = pastedData.slice(0, 6).split("");

    setCode([...newCode, ...Array(6 - newCode.length).fill("")]);

    // Focus last filled input or next empty
    const focusIndex = Math.min(newCode.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const enrollCode = code.join("");

    await dispatch(enrollClass({ enrollCode }))
      .unwrap()
      .then((response) => {
        toast.success("Successfully enrolled the class", {
          description: response.message || "Successfully enrolled the class!",
        });

        // Redirect to class page if classId is returned
        if (response.data.classId) {
          router.push(`/classes/${response.data.classId}/updates`);
          dispatch(resetEnrollState());
        }
      })
      .catch((err) => {
        // console.error("Enroll Error: ", err);
        toast.error("Failed to enroll class", {
          description:
            err.message || "An error occurred while enrolling the class",
          position: "top-center",
        });
      });
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-slate-200/80 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={router.back}
            className="group flex items-center justify-center p-2 rounded-lg hover:bg-white transition-colors border border-slate-200 bg-white cursor-pointer hover:border-primary/30"
          >
            <ArrowLeft
              className="text-slate-900 group-hover:text-primary group-hover:-translate-x-0.5 transition-all duration-200"
              size={18}
            />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Enroll a Class</h1>
            <p className="text-slate-500 text-xs hidden md:block">
              Enter the code provided by your instructor
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
          {/* Left Column - Enroll Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 min-h-100 flex flex-col justify-center">
              <form
                onSubmit={handleSubmit}
                className="max-w-lg mx-auto w-full text-center space-y-6"
              >
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-slate-900">
                    Enter Class Code
                  </h2>
                  <p className="text-sm text-slate-500">
                    Enter the 6-character code from your instructor
                  </p>
                </div>

                {/* Code Input */}
                <div className="flex justify-center gap-2 mt-6">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      autoFocus={index === 0}
                      className="w-12 h-14 text-center text-xl font-bold border-2 border-slate-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 bg-white transition-all outline-none uppercase"
                      placeholder="0"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isEnrolling || code.join("").length !== 6}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/20 transition-all text-sm mt-6 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isEnrolling ? "Enrolling..." : "Enroll Class"}
                </button>

                <p className="text-xs text-slate-400">
                  By enrolling, you agree to the classroom's terms and policies.
                </p>
              </form>
            </div>
          </div>

          {/* Right Column - Tips */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 px-1">
              <Lightbulb className="text-primary" size={18} />
              Quick Tips
            </h3>

            {/* Tip 1 */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-start gap-3">
              <div className="bg-blue-50 p-2 rounded-lg shrink-0">
                <Search className="text-primary" size={16} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-0.5 text-sm">
                  Where is my code?
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Check your syllabus, course email, or ask your instructor.
                </p>
              </div>
            </div>

            {/* Tip 2 */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-start gap-3">
              <div className="bg-emerald-50 p-2 rounded-lg shrink-0">
                <Rocket className="text-emerald-600" size={16} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-0.5 text-sm">
                  What happens next?
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  You'll be added to the class dashboard with all materials.
                </p>
              </div>
            </div>

            {/* Tip 3 */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-start gap-3">
              <div className="bg-amber-50 p-2 rounded-lg shrink-0">
                <HelpCircle className="text-amber-600" size={16} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-0.5 text-sm">
                  Need help?
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Ensure you typed correctly or contact support.
                </p>
              </div>
            </div>

            {/* Mobile App Card */}
            <div className="bg-linear-to-br from-primary to-primary/80 p-5 rounded-xl text-white relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="font-bold text-sm mb-1">ClassFlow Mobile</h4>
                <p className="text-xs text-blue-100 mb-3">
                  Take your learning on the go.
                </p>
                <div className="bg-white/20 backdrop-blur-md w-16 h-16 rounded-lg border border-white/30 flex items-center justify-center">
                  <QrCode className="text-white" size={28} />
                </div>
              </div>
              <Smartphone
                className="absolute -bottom-2 -right-2 text-white/10"
                size={80}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
