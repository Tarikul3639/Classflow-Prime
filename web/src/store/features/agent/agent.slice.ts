import { createSlice } from "@reduxjs/toolkit";
import type { IAgent } from "./agent.types";
import { createAgentThunk } from "./thunks/create-agent.thunk";
import { deleteAgentThunk } from "./thunks/delete-agent.thunk";
import { fetchAgentsThunk } from "./thunks/fetch-agents.thunk";
import { updateAgentThunk } from "./thunks/update-agent.thunk";

export interface IRequestStatus {
    loading: boolean;
    error: string | null;
    message: string | null;
}

const initialStatus: IRequestStatus = {
    loading: false,
    error: null,
    message: null,
};

export type AgentState = {
    agents: IAgent[];
    create: {
        status: IRequestStatus;
        agent: IAgent | null;
        apiKey: string | null;
    };
    update: { status: IRequestStatus };
    delete: { status: IRequestStatus };
    fetch: { status: IRequestStatus };
};

export const initialState: AgentState = {
    agents: [],
    create: { status: { ...initialStatus }, agent: null, apiKey: null },
    update: { status: { ...initialStatus } },
    delete: { status: { ...initialStatus } },
    fetch: { status: { ...initialStatus } },
};

export const agentSlice = createSlice({
    name: "agent",
    initialState,
    reducers: {
        clearCreateAgentStatus: (state) => {
            state.create.status = { ...initialStatus };
        },
        clearUpdateAgentStatus: (state) => {
            state.update.status = { ...initialStatus };
        },
        clearDeleteAgentStatus: (state) => {
            state.delete.status = { ...initialStatus };
        },
        clearFetchAgentsStatus: (state) => {
            state.fetch.status = { ...initialStatus };
        },
        clearCreateAgentResult: (state) => {
            state.create.agent = null;
            state.create.apiKey = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // FETCH
            .addCase(fetchAgentsThunk.pending, (state) => {
                state.fetch.status = { ...initialStatus, loading: true };
            })
            .addCase(fetchAgentsThunk.fulfilled, (state, action) => {
                state.fetch.status = { ...initialStatus, message: "Agents loaded" };
                state.agents = action.payload;
            })
            .addCase(fetchAgentsThunk.rejected, (state, action) => {
                state.fetch.status = {
                    ...initialStatus,
                    error: action.payload ?? "Failed to load agents",
                };
            })

            // CREATE
            .addCase(createAgentThunk.pending, (state) => {
                state.create.status = { ...initialStatus, loading: true };
            })
            .addCase(createAgentThunk.fulfilled, (state, action) => {
                state.create.status = {
                    ...initialStatus,
                    message: action.payload.message,
                };
                state.create.agent = action.payload.data.agent;
                state.create.apiKey = action.payload.data.agent.apiKey;
                state.agents = [action.payload.data.agent, ...state.agents];
            })
            .addCase(createAgentThunk.rejected, (state, action) => {
                state.create.status = {
                    ...initialStatus,
                    error: action.payload ?? "Failed to create agent",
                };
            })

            // UPDATE
            .addCase(updateAgentThunk.pending, (state) => {
                state.update.status = { ...initialStatus, loading: true };
            })
            .addCase(updateAgentThunk.fulfilled, (state, action) => {
                state.update.status = {
                    ...initialStatus,
                    message: action.payload.message,
                };
                const updatedAgent = action.payload.data.agent;
                state.agents = state.agents.map((a) =>
                    a._id === updatedAgent._id ? updatedAgent : a,
                );
                if (state.create.agent?._id === updatedAgent._id)
                    state.create.agent = updatedAgent;
            })
            .addCase(updateAgentThunk.rejected, (state, action) => {
                state.update.status = {
                    ...initialStatus,
                    error: action.payload ?? "Failed to update agent",
                };
            })

            // DELETE
            .addCase(deleteAgentThunk.pending, (state) => {
                state.delete.status = { ...initialStatus, loading: true };
            })
            .addCase(deleteAgentThunk.fulfilled, (state, action) => {
                state.delete.status = {
                    ...initialStatus,
                    message: action.payload.message,
                };
                state.agents = state.agents.filter((a) => a._id !== action.meta.arg);
                if (state.create.agent?._id === action.meta.arg) {
                    state.create.agent = null;
                    state.create.apiKey = null;
                }
            })
            .addCase(deleteAgentThunk.rejected, (state, action) => {
                state.delete.status = {
                    ...initialStatus,
                    error: action.payload ?? "Failed to delete agent",
                };
            });
    },
});

export const {
    clearCreateAgentStatus,
    clearUpdateAgentStatus,
    clearDeleteAgentStatus,
    clearFetchAgentsStatus,
    clearCreateAgentResult,
} = agentSlice.actions;

export default agentSlice.reducer;
