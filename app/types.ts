export type Conversation = {
    role: 'system' | 'developer' | 'user' | 'assistant';
    content: string;
}[];

export type Coordinates = {
    latitude: number;
    longitude: number;
}
