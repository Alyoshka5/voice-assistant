export type Conversation = {
    role: 'system' | 'developer' | 'user' | 'assistant';
    content: string;
}[];

export type Coordinates = {
    latitude?: number;
    longitude?: number;
}

export type CategoryControllers = {
    [key: string]: (conversation: Conversation) => Promise<string>;
};

export type OpenAIResponseOutput = {
    id?: string | undefined;
    type: string;
    status?: string | undefined;
    arguments?: string;
    call_id?: string;
    name?: string;
}