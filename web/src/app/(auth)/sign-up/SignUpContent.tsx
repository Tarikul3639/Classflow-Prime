"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";

import { EmailInputStep } from "./_components/EmailStep";
import { InfoStep } from "./_components/InfoStep";
import { OTPVerificationStep } from "./_components/OtpStep";
import { StepSuccess } from "./_components/SuccessStep";
import SignUpSteps from "./_components/SignUpSteps";

import { clearSignupStatus } from "@/store/features/auth/slices/signup.slice";
import { useAppDispatch } from "@/store/hooks";

type SignUpStepsType = "email" | "info" | "otp" | "success";

interface SignUpFormData {
    name: string;
    email: string;
    password: string;
    avatarUrl: string;
}

const SignUpPage: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useAppDispatch();

    const stepFromUrl = (searchParams.get("step") as SignUpStepsType) || "email";
    const [currentStep, setCurrentStep] = useState<SignUpStepsType>(stepFromUrl);

    const [formData, setFormData] = useState<SignUpFormData>(() => ({
        name: "",
        email: searchParams.get("email") || "",
        password: "",
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random().toString(36).substring(7)}`,
    }));

    // Sync step to URL
    const updateUrl = (step: SignUpStepsType, email?: string) => {
        const params = new URLSearchParams();
        params.set("step", step);
        if (email) params.set("email", email);
        router.replace(`/sign-up?${params.toString()}`);
    };

    const handleNextStep = (step: SignUpStepsType) => {
        setCurrentStep(step);
        updateUrl(step, formData.email);
    };

    useEffect(() => {
        return () => {
            dispatch(clearSignupStatus());
        };
    }, [dispatch]);

    const renderStep = () => {
        switch (currentStep) {
            case "email":
                return (
                    <EmailInputStep
                        email={formData.email}
                        setEmail={(email) => setFormData((prev) => ({ ...prev, email }))}
                        onNext={() => {
                            dispatch(clearSignupStatus());
                            handleNextStep("info");
                        }}
                    />
                );
            case "info":
                return (
                    <InfoStep
                        email={formData.email}
                        name={formData.name}
                        setName={(name) => setFormData((prev) => ({ ...prev, name }))}
                        password={formData.password}
                        setPassword={(password) =>
                            setFormData((prev) => ({ ...prev, password }))
                        }
                        avatarUrl={formData.avatarUrl}
                        setAvatarUrl={(avatarUrl) =>
                            setFormData((prev) => ({ ...prev, avatarUrl }))
                        }
                        onNext={() => {
                            dispatch(clearSignupStatus());
                            handleNextStep("otp");
                        }}
                        onBack={() => {
                            dispatch(clearSignupStatus());
                            handleNextStep("email");
                        }}
                    />
                );
            case "otp":
                return (
                    <OTPVerificationStep
                        email={formData.email}
                        onNext={() => {
                            dispatch(clearSignupStatus());
                            handleNextStep("success");
                        }}
                        onBack={() => {
                            dispatch(clearSignupStatus());
                            handleNextStep("info");
                        }}
                    />
                );
            case "success":
                return <StepSuccess onGoToLogin={() => router.push("/sign-in")} />;
            default:
                return null;
        }
    };

    return (
        <div className="bg-[#f8fafc] min-h-screen flex items-center justify-center font-display antialiased p-4">
            <div className="w-full max-w-md flex flex-col gap-4">
                {/* Steps */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-xl shadow-blue-100/50 p-4 border border-slate-200"
                >
                    <SignUpSteps currentStep={currentStep} />
                </motion.div>

                {/* Form */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-xl shadow-blue-100/50 p-6 sm:p-8 border border-slate-200"
                >
                    {renderStep()}
                </motion.div>
            </div>
        </div>
    );
};

export default SignUpPage;
