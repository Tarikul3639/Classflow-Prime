"use client";

import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAgentsThunk } from "@/store/features/agent/thunks/fetch-agents.thunk";

import AgentHeader from "./_components/AgentHeader";
import AgentList from "./_components/AgentList";
import EmptyAgents from "./_components/EmptyAgents";
import CreateAgentDialog from "./_components/CreateAgentDialog";
import { TopLoader } from "@/components/ui/TopLoader";

const AgentsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.agent.fetch.status);
  const agents = useAppSelector((state) => state.agent.agents);

  useEffect(() => {
    dispatch(fetchAgentsThunk());
  }, [dispatch]);

  return (
    <main className="relative min-h-screen bg-slate-50">
      <AgentHeader>
        <CreateAgentDialog />
      </AgentHeader>

      <div className="mx-auto w-full max-w-6xl px-4 lg:px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <TopLoader isLoading={loading} />
          </div>
        ) : agents.length === 0 ? (
          <EmptyAgents />
        ) : (
          <AgentList agents={agents} />
        )}
      </div>
    </main>
  );
};

export default AgentsPage;