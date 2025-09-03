import { Coordinates, ForecastDay, ForecastDetails, CurrentWeatherDetails, FutureWeatherForecastDetails } from './weatherTypes';
import { AddVideoToPlaylistDetails, YoutubePlaylist, YoutubePlaylistsList } from './youtubeTypes';
import { TaskList, TaskDetails, TaskListsList, TaskItem } from './tasksTypes';
import { CalendarItem, CalendarList, EventItem, CalendarEventDetails, EventResource } from './calendarTypes';

export type AuthToken = {
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    error?: string;
}

export type Conversation = {
    role: 'system' | 'developer' | 'user' | 'assistant';
    content: string;
}[];

export type UserRequestDetails = {
    coordinates: Coordinates | null;
    date: string;
    time: string;
    isoNow: string;
    timeZone: string;
}

type ServerResponseObject = {
    outputText: string;
    databaseText?: string;
    action?: string;
    details?: Record<string, string | number | undefined>;
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

export type { Coordinates, ForecastDay, ForecastDetails, CurrentWeatherDetails, FutureWeatherForecastDetails }
export type { AddVideoToPlaylistDetails, YoutubePlaylist, YoutubePlaylistsList };
export type { TaskList, TaskDetails, TaskListsList, TaskItem };
export type { CalendarItem, CalendarList, EventItem, CalendarEventDetails, EventResource };