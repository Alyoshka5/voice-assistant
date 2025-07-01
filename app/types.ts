export type Conversation = {
    role: 'system' | 'developer' | 'user' | 'assistant';
    content: string;
}[];