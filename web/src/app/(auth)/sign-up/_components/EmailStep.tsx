"use client";

import React from "react";
import { Mail, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/Input";
import AuthFooter from "./AuthFooter";

interface StepEmailInputProps {
  email: string;
  setEmail: (email: string) => void;
  onNext: () => void;
}

export const EmailInputStep: React.FC<StepEmailInputProps> = ({
  email,
  setEmail,
  onNext,
}) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    onNext();
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-6 text-center">
        <h1 className="text-[#0f172a] text-lg md:text-xl font-extrabold tracking-tight">
          Create Account
        </h1>
        <p className="text-slate-700 text-xs md:text-sm font-medium mt-1.5">
          Enroll ClassFlow to track your progress effortlessly.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          required
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={Mail}
        />

        <button
          type="submit"
          disabled={!email.trim()}
          className="w-full py-3 bg-[#399aef] text-white text-xs md:text-sm font-medium rounded-lg hover:bg-[#3289d6] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#399aef] cursor-pointer group"
        >
          Continue <ArrowRight className="size-4 md:size-4.5" />
        </button>
      </form>

      <AuthFooter
        message="Already have an account?"
        linkText="Back to Sign In"
        linkHref="/sign-in"
      />
    </div>
  );
};
