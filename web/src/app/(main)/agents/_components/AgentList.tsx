"use client";

import React from "react";
import type { IAgent } from "@/store/features/agent/agent.types";
import AgentCard from "./AgentCard";

interface Props {
    agents: IAgent[];
}

export default function AgentList({ agents }: Props) {
    return (
        <section className="rounded-sm border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                    <h3 className="text-base font-semibold text-slate-900">Agents</h3>
                    <p className="text-sm text-slate-500">
                        Manage access, permissions, and class binding.
                    </p>
                </div>

                <div className="hidden sm:flex items-center gap-2 rounded-sm border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
                    <span className="font-medium text-slate-900">{agents.length}</span>
                    total
                </div>
            </div>

            <div className="p-4 sm:p-5 grid gap-4">
                {agents.map((agent) => (
                    <AgentCard key={agent._id} agent={agent} />
                ))}
            </div>
        </section>
    );
}