"use client";

import React, { useState } from "react";
import { Bot, KeyRound, MoreVertical, Copy, Check } from "lucide-react";
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
import UpdateAgentDialog from "./UpdateAgentDialog";
import DeleteAgentDialog from "./DeleteAgentDialog";

interface Props {
    agent: IAgent;
}

export default function AgentCard({ agent }: Props) {
    const [copiedApiKey, setCopiedApiKey] = useState(false);
    const [copiedClassId, setCopiedClassId] = useState<string | null>(null);

    const copyApiKey = async () => {
        await navigator.clipboard.writeText(agent.apiKey);
        toast.success("API key copied");
        setCopiedApiKey(true);
        setTimeout(() => setCopiedApiKey(false), 2000);
    };

    const copyClassId = async (classId: string) => {
        await navigator.clipboard.writeText(classId);
        toast.success("Class ID copied");
        setCopiedClassId(classId);
        setTimeout(() => setCopiedClassId(null), 2000);
    };

    const activeScopes = Object.entries(agent.scopes || {})
        .filter(([_, value]) => value === true)
        .map(([key]) => key);

    const allowedClasses = agent.classList?.filter((c) => c.allowed) ?? [];

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 hover:border-slate-300 hover:shadow-sm transition-all duration-200">
            {/* Header Row */}
            <div className="flex items-center gap-3">
                <div className="shrink-0 h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 text-primary flex items-center justify-center">
                    <Bot className="size-4" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-slate-900 truncate">
                            {agent.name}
                        </h3>
                        <Badge
                            variant="secondary"
                            className="rounded-md text-[10px] font-medium capitalize h-4.5 px-1.5"
                        >
                            {agent.status}
                        </Badge>
                        {activeScopes.map((scope) => (
                            <Badge
                                key={scope}
                                variant="outline"
                                className="rounded-md text-[10px] font-medium capitalize h-4.5 px-1.5"
                            >
                                {scope}
                            </Badge>
                        ))}
                    </div>

                    <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200">
                        <KeyRound className="size-3 text-slate-400" />
                        <span className="text-[11px] font-mono text-slate-600">
                            {agent.apiKeyPrefix}
                        </span>
                    </div>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-md cursor-pointer shrink-0"
                        >
                            <MoreVertical className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        className="w-38 rounded-lg border-slate-200 p-1"
                    >
                        <DropdownMenuItem
                            onClick={copyApiKey}
                            className="w-full justify-start text-sm rounded-sm cursor-pointer hover:bg-slate-100"
                        >
                            {copiedApiKey ? (
                                <Check className="size-3.5 text-green-500" />
                            ) : (
                                <Copy className="size-3.5" />
                            )}
                            Copy API Key
                        </DropdownMenuItem>
                        <UpdateAgentDialog agent={agent} />
                        <DeleteAgentDialog agentId={agent._id} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Allowed Classes */}
            {allowedClasses.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider mb-2">
                        Allowed Classes
                    </p>
                    <div className="space-y-1.5">
                        {allowedClasses.map((cls) => (
                            <div
                                key={cls._id}
                                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5"
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-slate-800">
                                        {cls.name}
                                    </p>
                                    <p className="text-[11px] font-mono text-slate-500 truncate">
                                        {cls._id}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 shrink-0"
                                    onClick={() => copyClassId(cls._id)}
                                >
                                    {copiedClassId === cls._id ? (
                                        <Check className="size-3.5 text-green-500" />
                                    ) : (
                                        <Copy className="size-3.5" />
                                    )}
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
