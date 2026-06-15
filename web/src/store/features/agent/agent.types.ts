export enum AgentStatus {
    ACTIVE = 'active',
    REVOKED = 'revoked',
}

export interface IAgentScopes {
    create: boolean;
    update: boolean;
    delete: boolean;
}

export interface IClassListItem {
    _id: string;
    name: string;
    allowed: boolean;
}

export interface IAgent {
    _id: string;
    name: string;
    apiKey: string;
    apiKeyPrefix: string;
    scopes: IAgentScopes;
    classList: IClassListItem[];
    status: AgentStatus;
    expiresAt?: string | null;
}

export interface ICreateAgentRequest {
    name: string;
    scopes?: Partial<IAgentScopes>;
    allowedClassIds?: string[];
    expiresAt?: string;
}

export interface IUpdateAgentRequest {
    name?: string;
    scopes?: Partial<IAgentScopes>;
    allowedClassIds?: string[];
    expiresAt?: string;
}

export interface ICreateAgentResponse {
    success: boolean;
    message: string;
    data: {
        agent: IAgent & {
            apiKey: string;
        };
    };
}

export interface IUpdateAgentResponse {
    success: boolean;
    message: string;
    data: {
        agent: IAgent;
    };
}

export interface IDeleteAgentResponse {
    success: boolean;
    message: string;
}

export interface IFetchAgentsResponse {
    success: boolean;
    message: string;
    data: {
        agents: IAgent[];
    };
}