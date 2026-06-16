import type { IAgentScopes } from '../../../infrastructure/database/interface/agent.interface';

export enum ActorType {
    USER = 'user',
    AGENT = 'agent',
}

interface IUserActor {
    type: ActorType.USER;
    userId: string;
}

interface IAgentActor {
    type: ActorType.AGENT;
    agentId: string;
    scopes: IAgentScopes;
    allowedClassIds: string[];
}

export type IActor = IUserActor | IAgentActor;
