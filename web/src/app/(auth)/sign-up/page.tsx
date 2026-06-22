import type { Metadata } from "next";
import { Suspense } from "react";
import SignUpContent from "./SignUpContent";

export const metadata: Metadata = {
  title: "Sign Up | ClassFlow",
  description:
    "Create your ClassFlow account to join classes, track progress, and start learning.",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Sign Up | ClassFlow",
    description:
      "Join ClassFlow and start your learning journey today.",
    type: "website",
  },
};

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          Loading...
        </div>
      }
    >
      <SignUpContent />
    </Suspense>
  );
}