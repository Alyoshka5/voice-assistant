import { Coordinates, UserRequestDetails, ForecastDay, ForecastDetails } from './weatherTypes';

export type Conversation = {
    role: 'system' | 'developer' | 'user' | 'assistant';
    content: string;
}[];

type ServerResponseObject = {
    outputText: string;
    action: string;
    details: Record<string, string | number | undefined>;
}

export type CategoryControllers = {
    [key: string]: (conversation: Conversation, userRequestDetails: UserRequestDetails) => Promise<ServerResponseObject>;
};

export type OpenAIResponseOutput = {
    id?: string | undefined;
    type: string;
    status?: string | undefined;
    arguments?: string;
    call_id?: string;
    name?: string;
}

export type DateObject = {
    year: number;
    month: number;
    day: number;
}

export type { Coordinates, UserRequestDetails, ForecastDay, ForecastDetails }