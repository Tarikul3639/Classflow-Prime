"use client";

import React, { useMemo, useState } from "react";
import {
    Bot,
    KeyRound,
    MoreVertical,
    Copy,
    Check,
    ShieldCheck,
    Calendar,
    Link2,
    Eye,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { IAgent } from "@/store/features/agent/agent.types";
import DeleteAgentDialog from "./DeleteAgentDialog";

interface Props {
    agent: IAgent;
}

function formatDate(value?: string | null) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString();
}

export default function AgentCard({ agent }: Props) {
    const [copiedKey, setCopiedKey] = useState(false);
    const [copiedClassId, setCopiedClassId] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    const activeScopes = useMemo(
        () =>
            Object.entries(agent.scopes || {})
                .filter(([, value]) => value === true)
                .map(([key]) => key),
        [agent.scopes]
    );

    const copyAgentKey = async () => {
        await navigator.clipboard.writeText(agent.apiKey);
        toast.success("API key copied");
        setCopiedKey(true);
        window.setTimeout(() => setCopiedKey(false), 1800);
    };

    const copyClassId = async () => {
        if (!agent.class?._id) return;
        await navigator.clipboard.writeText(agent.class._id);
        toast.success("Class ID copied");
        setCopiedClassId(true);
        window.setTimeout(() => setCopiedClassId(false), 1800);
    };

    return (
        <article className="overflow-hidden rounded-sm border border-slate-200 bg-white transition-colors hover:border-slate-300">
            <div className="p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3 min-w-0">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-slate-200 bg-slate-50 text-primary">
                            <Bot className="size-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h3 className="truncate text-sm font-semibold text-slate-900 sm:text-base">
                                    {agent.name}
                                </h3>

                                <Badge
                                    variant="secondary"
                                    className="rounded-sm bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0 text-[10px] font-medium capitalize"
                                >
                                    {agent.status}
                                </Badge>

                                {activeScopes.map((scope) => (
                                    <Badge
                                        key={scope}
                                        variant="outline"
                                        className="rounded-sm border-slate-200 bg-slate-50 px-2 py-0 text-[10px] font-medium capitalize text-slate-700"
                                    >
                                        {scope}
                                    </Badge>
                                ))}
                            </div>

                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                <span className="inline-flex items-center gap-1.5 rounded-sm border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono truncate">
                                    <KeyRound className="size-3.5 text-slate-400" />
                                    <span>{agent.apiKey}</span>
                                </span>

                                <span className="inline-flex items-center gap-1 rounded-sm border border-slate-200 bg-slate-50 px-2.5 py-1">
                                    <Calendar className="size-3.5 text-slate-400" />
                                    <span>Created {formatDate(agent.createdAt)}</span>
                                </span>

                                {agent.lastUsedAt ? (
                                    <span className="inline-flex items-center gap-1 rounded-sm border border-slate-200 bg-slate-50 px-2.5 py-1">
                                        <Eye className="size-3.5 text-slate-400" />
                                        <span>Last used {formatDate(agent.lastUsedAt)}</span>
                                    </span>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowDetails((prev) => !prev)}
                            className="h-8 rounded-sm border-slate-200 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer"
                        >
                            <Link2 className="mr-1.5 size-3.5" />
                            {showDetails ? "Hide" : "Details"}
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-sm cursor-pointer shrink-0"
                                >
                                    <MoreVertical className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                                align="end"
                                className="w-44 rounded-sm border-slate-200 p-1 shadow-md"
                            >
                                <DropdownMenuItem
                                    onClick={copyAgentKey}
                                    className="flex cursor-pointer items-center gap-2 rounded-sm px-3 py-2 text-sm"
                                >
                                    {copiedKey ? (
                                        <Check className="size-3.5 text-emerald-500" />
                                    ) : (
                                        <Copy className="size-3.5" />
                                    )}
                                    Copy API key
                                </DropdownMenuItem>

                                <DeleteAgentDialog agentId={agent._id} />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {showDetails ? (
                    <div className="mt-4 grid gap-3 rounded-sm border border-slate-200 bg-slate-50 p-4">
                        <div className="grid gap-2 sm:grid-cols-2">
                            <div className="rounded-sm border border-slate-200 bg-white p-3">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                    Class
                                </p>

                                {agent.class ? (
                                    <div className="mt-2 flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium text-slate-900">
                                                {agent.class.className}
                                            </p>
                                            <p className="mt-0.5 truncate font-mono text-[11px] text-slate-500">
                                                {agent.class._id}
                                            </p>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={copyClassId}
                                            className="h-8 w-8 shrink-0 rounded-sm"
                                        >
                                            {copiedClassId ? (
                                                <Check className="size-3.5 text-emerald-500" />
                                            ) : (
                                                <Copy className="size-3.5" />
                                            )}
                                        </Button>
                                    </div>
                                ) : (
                                    <p className="mt-2 text-sm text-slate-500">No class assigned</p>
                                )}
                            </div>

                            <div className="rounded-sm border border-slate-200 bg-white p-3">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                    Permissions
                                </p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {activeScopes.length > 0 ? (
                                        activeScopes.map((scope) => (
                                            <Badge
                                                key={scope}
                                                variant="outline"
                                                className="rounded-sm border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium capitalize text-slate-700"
                                            >
                                                <ShieldCheck className="mr-1 size-3 text-emerald-500" />
                                                {scope}
                                            </Badge>
                                        ))
                                    ) : (
                                        <p className="text-sm text-slate-500">No permissions enabled</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-3">
                            <div className="rounded-sm border border-slate-200 bg-white p-3">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                    API Key
                                </p>
                                <div className="mt-2 flex items-center justify-between gap-3">
                                    <span className="truncate font-mono text-sm text-slate-900">
                                        {agent.apiKey.slice(0, 6) + "..." + agent.apiKey.slice(-4)}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-sm"
                                        onClick={copyAgentKey}
                                    >
                                        {copiedKey ? (
                                            <Check className="size-3.5 text-emerald-500" />
                                        ) : (
                                            <Copy className="size-3.5" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <div className="rounded-sm border border-slate-200 bg-white p-3">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                    Expires At
                                </p>
                                <p className="mt-2 text-sm text-slate-900">
                                    {formatDate(agent.expiresAt)}
                                </p>
                            </div>

                            <div className="rounded-sm border border-slate-200 bg-white p-3">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                    Created At
                                </p>
                                <p className="mt-2 text-sm text-slate-900">
                                    {formatDate(agent.createdAt)}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </article>
    );
}