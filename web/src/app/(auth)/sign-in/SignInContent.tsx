"use client";

import React, { useState, useEffect } from "react";
import {
    Lock,
    ArrowRight,
    Loader2,
    GraduationCap,
    Eye,
    EyeOff,
    AlertCircle,
    Mail,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SignInThunk } from "@/store/features/auth/thunks/signin.thunks";
import { resetSignInStatus } from "@/store/features/auth/slices/signin.slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Input } from "@/components/ui/Input";

interface SignInPayload {
    email: string;
    password: string;
}

const SignInPage: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get("next");
    const dispatch = useAppDispatch();

    // Select auth state
    const { loading, error } = useAppSelector(
        (state) => state.auth.signin.status,
    );

    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState<SignInPayload>({
        email: "",
        password: "",
    });

    // Clear error on unmount
    useEffect(() => {
        return () => {
            dispatch(resetSignInStatus());
        };
    }, [dispatch]);

    const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const resultAction = await dispatch(SignInThunk(formData));

            if (SignInThunk.fulfilled.match(resultAction)) {
                // Successful sign-in
                // const user = resultAction.payload;
                // console.log("🎯 Sign-in successful:", user);

                // Redirect to the specified URL or home page
                const safeRedirect =
                    redirectUrl && redirectUrl.startsWith("/")
                        ? redirectUrl
                        : "/";

                router.replace(safeRedirect);

            } else {
                // Error - stays on page and shows error
                console.error("❌ Sign-in failed:", resultAction.payload);
            }
        } catch (err) {
            console.error("❌ Unexpected error during sign-in:", err);
        }
    };

    return (
        <div className="bg-[#f8fafc] min-h-screen flex flex-col font-display antialiased">
            <main className="flex-1 flex items-center justify-center p-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-blue-100/50 p-6 sm:p-8 border border-slate-200"
                >
                    {/* Header Section */}
                    <div className="text-center mb-8">
                        <div className="mx-auto mb-5 w-16 h-16 rounded-2xl bg-[#399aef]/10 flex items-center justify-center text-[#399aef]">
                            <GraduationCap size={32} />
                        </div>
                        <h1 className="text-[#0f172a] text-xl md:text-2xl font-extrabold tracking-tight">
                            Welcome Back
                        </h1>
                        <p className="text-slate-600 text-xs md:text-sm font-medium mt-1.5">
                            Log in to continue your academic journey.
                        </p>
                    </div>

                    {/* Error Message */}
                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden mb-6"
                            >
                                <div className="flex items-center gap-2.5 py-3 px-4 rounded-xl bg-red-50 border border-red-100">
                                    <AlertCircle className="text-red-500 shrink-0" size={16} />
                                    <p className="text-red-700 text-xs font-bold leading-tight">
                                        {typeof error === "string"
                                            ? error
                                            : "Authentication failed. Please try again."}
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSignIn} className="space-y-5">
                        <div className="space-y-4">
                            {/* Email Field */}
                            <Input
                                required
                                label="Email Address"
                                type="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                                icon={Mail}
                                disabled={loading}
                            />

                            {/* Password Field */}
                            <div className="relative">
                                <Link
                                    href="/forgot-password"
                                    className="absolute right-0 -top-0.5 text-[#399aef] text-[11px] md:text-[12px] font-bold tracking-[0.1px] hover:underline transition-colors z-10"
                                >
                                    Forgot Password?
                                </Link>

                                <Input
                                    required
                                    label="Password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData({ ...formData, password: e.target.value })
                                    }
                                    icon={Lock}
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    disabled={loading}
                                    className="absolute right-3 top-8.5 md:top-9 text-gray-500 hover:text-gray-700 focus:outline-none disabled:opacity-50"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <EyeOff className="size-4 md:size-4.5" />
                                    ) : (
                                        <Eye className="size-4 md:size-4.5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 md:py-3 bg-[#399aef] text-white text-xs md:text-sm font-medium rounded-lg md:rounded-xl hover:bg-[#3289d6] shadow-lg shadow-blue-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-7 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#399aef] cursor-pointer group"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin size-5" />
                                    Signing In...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight
                                        size={18}
                                        className="group-hover:translate-x-1 transition-transform"
                                    />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer Link */}
                    <div className="py-3 pt-8 border-t border-slate-100 text-center">
                        <p className="text-[#64748b] text-xs sm:text-xxsm font-medium">
                            Don&apos;t have an account?
                            <Link
                                href="/sign-up"
                                className="text-[#399aef] font-bold hover:underline ml-1.5"
                            >
                                Create Account
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default SignInPage;
