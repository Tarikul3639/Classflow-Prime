import { Suspense } from "react";
import type { Metadata } from "next";
import SignInContent from "./SignInContent";

export const metadata: Metadata = {
  title: "Sign In | ClassFlow",
  description:
    "Sign in to ClassFlow to access your classes, assignments, and learning dashboard.",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Sign In | ClassFlow",
    description:
      "Access your ClassFlow account and continue your learning journey.",
    type: "website",
  },
};

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          Loading...
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}