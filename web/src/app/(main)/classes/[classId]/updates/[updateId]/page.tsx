"use client";

// 1. React & Next
import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";

// 2. Redux
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchSingleClassUpdate } from "@/store/features/classes/thunks/fetch-single-class-update.thunk";
import { updateClassUpdate } from "@/store/features/classes/thunks/update-class-update.thunk";
import { selectSingleUpdateState } from "@/store/features/classes/selectors/class-updates.selectors";
import { clearUpdateError } from "@/store/features/classes/slices/class-updates.slice";

// 3. Types
import type { CreateUpdateFormData } from "@/types/update.types";

// 4. Components
import { UpdateEditorHeader } from "../../updates/create/_components/UpdateEditorHeader";
import { UpdateForm } from "../../updates/create/_components/UpdateForm";
import { UpdatePreview } from "../../updates/create/_components/UpdatePreview";
import { ProTip } from "../../updates/create/_components/ProTip";

// 5. Utils / Lib
import { getDirtyFields } from "@/utils/form.utils";
import { toast } from "sonner";

export default function EditUpdatePage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const params = useParams();

    const classId = params.classId as string;
    const updateId = params.updateId as string;

    // Select update data from Redux
    const { data, loading, updating, error } = useAppSelector((state) =>
        selectSingleUpdateState(state, classId, updateId)
    );

    // Original snapshot —> dirty tracking
    const originalFormRef = useRef<CreateUpdateFormData | null>(null);

    const [form, setForm] = useState<CreateUpdateFormData>({
        category: "announcement",
        title: "",
        description: "",
        eventAt: null,
        materials: [],
    });

    // Fetch update details on mount (if not already in Redux)
    useEffect(() => {
        if (!data) {
            dispatch(fetchSingleClassUpdate({ classId, updateId }));
        }
    }, [classId, updateId, dispatch, data]);

    // Clear update-related errors on mount/unmount
    useEffect(() => {
        dispatch(clearUpdateError({ classId }));

        return () => {
            dispatch(clearUpdateError({ classId }));
        };
    }, [classId, dispatch]);

    // Redux data → form sync
    useEffect(() => {
        if (!data) return;

        const initial: CreateUpdateFormData = {
            category: data.category,
            title: data.title,
            description: data.description ?? "",
            eventAt: data.eventAt ?? null,
            materials: data.materials ?? [],
        };

        originalFormRef.current = initial;
        setForm(initial);
    }, [data]);

    // Scroll on validation error
    useEffect(() => {
        if ((error as any)?.field) {
            document
                .getElementById("update-form")
                ?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [error]);

    const handleSubmit = async () => {
        if (!originalFormRef.current) return;

        const dirtyFields = getDirtyFields(originalFormRef.current, form);

        if (Object.keys(dirtyFields).length === 0) {
            toast.info("Nothing changed.", { position: "top-center" });
            return;
        }

        try {
            await dispatch(
                updateClassUpdate({
                    classId,
                    updateId,
                    updateData: dirtyFields,
                })
            ).unwrap();

            toast.success("Update saved successfully!", {
                position: "top-center",
            });

            router.push(`/classes/${classId}/updates`);
        } catch (err: any) {
            toast.error("Failed to save update", {
                description: err?.message,
                position: "top-center",
            });
        }
    };

    // FIX: use loading (not fetchLoading)
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <p className="text-sm text-slate-500">Loading update...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <UpdateEditorHeader
                classId={classId}
                isNew={false}
                isLoading={updating}
                error={error?.message}
                onSubmit={handleSubmit}
                isDirty={
                    originalFormRef.current
                        ? Object.keys(getDirtyFields(originalFormRef.current, form)).length > 0
                        : false
                }
            />

            <main className="flex-1 overflow-y-auto p-2 md:p-4 lg:p-6">
                <div className="mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8">
                    <div className="xl:col-span-7">
                        <UpdateForm
                            form={form}
                            setForm={setForm}
                            error={error ?? null}
                        />
                    </div>

                    <div className="xl:col-span-5">
                        <div className="sticky top-24 xl:top-0 space-y-4">
                            <UpdatePreview form={form} />
                            <ProTip />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}