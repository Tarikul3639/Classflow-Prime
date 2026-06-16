import { Types } from 'mongoose';

export enum AgentStatus {
    ACTIVE = 'active',
    REVOKED = 'revoked',
}

export interface IAgentScopes {
    create: boolean;
    update: boolean;
    delete: boolean;
}

export interface IAgent {
    name: string;
    userId: Types.ObjectId;
    apiKey: string;
    apiKeyPrefix: string;
    scopes: IAgentScopes; 
    allowedClassIds: Types.ObjectId[];
    status: AgentStatus;
    expiresAt?: Date;
    lastUsedAt?: Date;
}

export interface IAgentMethods {
    setApiKey(rawKey: string): Promise<void>;
    compareApiKey(rawKey: string): Promise<boolean>;
    isExpired(): boolean;
    revoke(): void;
    touch(): void;
}