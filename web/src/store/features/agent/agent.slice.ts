import { createSlice } from "@reduxjs/toolkit";
import type { IAgent, IClassSearchItem } from "./agent.types";
import { createAgentThunk } from "./thunks/create-agent.thunk";
import { deleteAgentThunk } from "./thunks/delete-agent.thunk";
import { fetchAgentsThunk } from "./thunks/fetch-agents.thunk";
import { searchClassesThunk } from "./thunks/search-classes.thunk";

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
    search: {
        classes: IClassSearchItem[];
        status: IRequestStatus;
    };
    create: {
        status: IRequestStatus;
        agent: IAgent | null;
        apiKey: string | null;
    };
    delete: { status: IRequestStatus };
    fetch: { status: IRequestStatus };
};

export const initialState: AgentState = {
    agents: [],
    search: { classes: [], status: { ...initialStatus } },
    create: { status: { ...initialStatus }, agent: null, apiKey: null },
    delete: { status: { ...initialStatus } },
    fetch: { status: { ...initialStatus } },
};

export const agentSlice = createSlice({
    name: "agent",
    initialState,
    reducers: {
        clearCreateAgentStatus: (state) => { state.create.status = { ...initialStatus }; },
        clearDeleteAgentStatus: (state) => { state.delete.status = { ...initialStatus }; },
        clearFetchAgentsStatus: (state) => { state.fetch.status = { ...initialStatus }; },
        clearSearchClassesStatus: (state) => { state.search.status = { ...initialStatus }; },
        clearSearchClassesResult: (state) => { state.search.classes = []; },
        clearCreateAgentResult: (state) => { state.create.agent = null; state.create.apiKey = null; },
    },
    extraReducers: (builder) => {
        builder
            // SEARCH CLASSES
            .addCase(searchClassesThunk.pending, (state) => {
                state.search.status = { ...initialStatus, loading: true };
            })
            .addCase(searchClassesThunk.fulfilled, (state, action) => {
                state.search.status = { ...initialStatus, message: action.payload.message };
                state.search.classes = action.payload.data.classes;
            })
            .addCase(searchClassesThunk.rejected, (state, action) => {
                state.search.status = { ...initialStatus, error: action.payload ?? "Failed to search classes" };
                state.search.classes = [];
            })

            // FETCH AGENTS
            .addCase(fetchAgentsThunk.pending, (state) => {
                state.fetch.status = { ...initialStatus, loading: true };
            })
            .addCase(fetchAgentsThunk.fulfilled, (state, action) => {
                state.fetch.status = { ...initialStatus, message: action.payload.message };
                state.agents = action.payload.data.agents;
            })
            .addCase(fetchAgentsThunk.rejected, (state, action) => {
                state.fetch.status = { ...initialStatus, error: action.payload ?? "Failed to load agents" };
            })

            // CREATE AGENT
            .addCase(createAgentThunk.pending, (state) => {
                state.create.status = { ...initialStatus, loading: true };
            })
            .addCase(createAgentThunk.fulfilled, (state, action) => {
                state.create.status = { ...initialStatus, message: action.payload.message };
                state.create.agent = action.payload.data.agent;
                state.create.apiKey = action.payload.data.agent.apiKey;
                state.create.agent.class = state.create.agent.class ?? null; // Ensure class is not undefined
                state.agents = [action.payload.data.agent, ...state.agents];
            })
            .addCase(createAgentThunk.rejected, (state, action) => {
                state.create.status = { ...initialStatus, error: action.payload ?? "Failed to create agent" };
            })

            // DELETE AGENT
            .addCase(deleteAgentThunk.pending, (state) => {
                state.delete.status = { ...initialStatus, loading: true };
            })
            .addCase(deleteAgentThunk.fulfilled, (state, action) => {
                state.delete.status = { ...initialStatus, message: action.payload.message };
                state.agents = state.agents.filter((agent) => agent._id !== action.meta.arg);
                if (state.create.agent?._id === action.meta.arg) {
                    state.create.agent = null;
                    state.create.apiKey = null;
                }
            })
            .addCase(deleteAgentThunk.rejected, (state, action) => {
                state.delete.status = { ...initialStatus, error: action.payload ?? "Failed to delete agent" };
            });
    },
});

export const {
    clearCreateAgentStatus,
    clearDeleteAgentStatus,
    clearFetchAgentsStatus,
    clearSearchClassesStatus,
    clearSearchClassesResult,
    clearCreateAgentResult,
} = agentSlice.actions;

export default agentSlice.reducer;