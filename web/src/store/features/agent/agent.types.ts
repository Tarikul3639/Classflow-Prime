export enum AgentStatus {
    ACTIVE = 'active',
    REVOKED = 'revoked',
}

export interface IAgentScopes {
    create: boolean;
    update: boolean;
    delete: boolean;
}

export interface IAgentClass {
    _id: string;
    className: string;
}

export interface IAgent {
    _id: string;
    name: string;
    apiKeyPrefix: string;
    apiKey: string;
    scopes: IAgentScopes;
    class: IAgentClass | null;
    status: AgentStatus;
    expiresAt?: string | null;
    lastUsedAt?: string | null;
    createdAt: string;
}

export interface ICreateAgentRequest {
    name: string;
    classId: string;
    scopes?: Partial<IAgentScopes>;
    expiresAt?: string;
}

export interface ICreateAgentResponse {
    success: boolean;
    message: string;
    data: {
        agent: IAgent
    };
}

export interface IClassSearchItem {
    _id: string;
    className: string;
}

export interface ISearchClassesResponse {
    success: boolean;
    message: string;
    data: {
        classes: IClassSearchItem[];
    };
}

export interface IFetchAgentsResponse {
    success: boolean;
    message: string;
    data: {
        agents: IAgent[];
    };
}