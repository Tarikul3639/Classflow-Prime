"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Bot, Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { IAgent, IAgentScopes } from "@/store/features/agent/agent.types";
import { updateAgentThunk } from "@/store/features/agent/thunks/update-agent.thunk";

interface Props {
    agent: IAgent;
}

const DEFAULT_SCOPES: IAgentScopes = {
    create: false,
    update: false,
    delete: false,
};

export default function UpdateAgentDialog({ agent }: Props) {
    const dispatch = useAppDispatch();
    const { loading } = useAppSelector((state) => state.agent.update.status);
    const agents = useAppSelector((state) => state.agent.agents);

    const rawClasses = useMemo(() => agents.flatMap((a) => a.classList ?? []), [agents]);

    const classes = useMemo(() => {
        return Array.from(new Map(rawClasses.map((cls) => [cls._id, cls])).values());
    }, [rawClasses]);

    const [open, setOpen] = useState(false);
    const [name, setName] = useState(agent.name ?? "");
    const [expiresAt, setExpiresAt] = useState(agent.expiresAt ?? "");
    const [scopes, setScopes] = useState<IAgentScopes>(agent.scopes ?? DEFAULT_SCOPES);
    const [allowedClassIds, setAllowedClassIds] = useState<string[]>(
        (agent.classList ?? []).filter((cls) => cls.allowed).map((cls) => cls._id)
    );

    useEffect(() => {
        if (!open) return;

        setName(agent.name ?? "");
        setExpiresAt(agent.expiresAt ?? "");
        setScopes(agent.scopes ?? DEFAULT_SCOPES);
        setAllowedClassIds(
            (agent.classList ?? []).filter((cls) => cls.allowed).map((cls) => cls._id)
        );
    }, [open, agent]);

    const handleUpdate = () => {
        if (!name.trim()) {
            toast.error("Agent name is required");
            return;
        }

        const promise = dispatch(
            updateAgentThunk({
                agentId: agent._id,
                body: {
                    name,
                    scopes,
                    allowedClassIds,
                    expiresAt: expiresAt || undefined,
                },
            })
        ).unwrap();

        toast.promise(promise, {
            loading: "Updating agent...",
            success: (res) => {
                setOpen(false);
                return res.message;
            },
            error: (err) => err,
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    className="w-full justify-start text-sm rounded-sm cursor-pointer hover:bg-slate-100"
                >
                    <Pencil className="size-3.5" />
                    Edit Settings
                </Button>
            </DialogTrigger>

            <DialogContent className="w-[95vw] sm:max-w-105 max-h-[90vh] flex flex-col rounded-2xl p-0 overflow-hidden border border-slate-200">
                <DialogHeader className="px-4 pt-4 pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <Bot className="size-4" />
                        </div>
                        <div>
                            <DialogTitle className="text-sm font-semibold text-slate-900">
                                Edit Agent
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-500">
                                Manage permissions and class access
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="px-4 py-4 space-y-4 flex-1 overflow-y-auto">
                    <div>
                        <label className="text-sm font-medium text-slate-700">Name</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1.5 h-9 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors cursor-pointer"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-700">Permissions</label>
                        <div className="flex flex-wrap gap-x-5 gap-y-2 mt-2">
                            {Object.keys(scopes).map((scope) => {
                                const key = scope as keyof IAgentScopes;
                                return (
                                    <label
                                        key={scope}
                                        className="flex items-center gap-2 text-sm cursor-pointer select-none"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={scopes[key]}
                                            onChange={(e) =>
                                                setScopes((prev) => ({
                                                    ...prev,
                                                    [key]: e.target.checked,
                                                }))
                                            }
                                            className="h-4 w-4 accent-primary cursor-pointer"
                                        />
                                        <span className="capitalize text-slate-700">{scope}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-700">Allowed Classes</label>
                        <div className="max-h-32 mt-2 rounded-sm border border-slate-200 overflow-scroll">
                            <table className="w-full text-sm">
                                <thead className="sticky top-0 bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-3 py-2 text-left font-medium text-xs text-slate-600">
                                            Class Name
                                        </th>
                                        <th className="px-3 py-2 text-right font-medium text-xs text-slate-600">
                                            Access
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {classes.map((cls) => (
                                        <tr key={cls._id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-3 py-2 text-sm text-slate-700 truncate">
                                                {cls.name}
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                                <input
                                                    type="checkbox"
                                                    checked={allowedClassIds.includes(cls._id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setAllowedClassIds((prev) => [...prev, cls._id]);
                                                        } else {
                                                            setAllowedClassIds((prev) =>
                                                                prev.filter((id) => id !== cls._id)
                                                            );
                                                        }
                                                    }}
                                                    className="h-4 w-4 accent-primary cursor-pointer"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-700">Expire At</label>
                        <input
                            type="datetime-local"
                            value={expiresAt}
                            onChange={(e) => setExpiresAt(e.target.value)}
                            className="mt-1.5 h-9 w-full rounded-sm border border-slate-200 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors cursor-pointer"
                        />
                    </div>
                </div>

                <DialogFooter className="px-4 py-3 border-t border-slate-200 flex-row justify-end gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        className="border-slate-200 hover:bg-slate-50 cursor-pointer rounded-sm"
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleUpdate} disabled={loading} className="cursor-pointer rounded-sm">
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 size-4 animate-spin" />
                                Saving
                            </>
                        ) : (
                            "Save"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}