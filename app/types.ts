export type Conversation = {
    role: 'system' | 'developer' | 'user' | 'assistant';
    content: string;
}[];

export type Coordinates = {
    latitude?: number;
    longitude?: number;
}

export type CategoryControllers = {
    [key: string]: (conversation: Conversation, userRequestDetails: UserRequestDetails) => Promise<string>;
};

export type OpenAIResponseOutput = {
    id?: string | undefined;
    type: string;
    status?: string | undefined;
    arguments?: string;
    call_id?: string;
    name?: string;
}

export type UserRequestDetails = {
    coordinates: Coordinates | null;
    date: string;
}

export type ForecastDay = {
    displayDate: {
      year: number;
      month: number;
      day: number;
    };
};

export type ForecastDetails = {
    displayDate: DateObject;
    weatherCondition: {
        description: string;
        type: string;
    };
    maxTemperature: {
        degrees: number;
        unit: string;
    };
    minTemperature: {
        degrees: number;
        unit: string;
    };
}

export type DateObject = {
    year: number;
    month: number;
    day: number;
}
