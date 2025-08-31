export type CalendarItem = {
    id: string;
    summary: string;
    description: string;
}

export type CalendarList = {
    items: CalendarItem[];
}

export type EventItem = {
    id: string;
    summary: string;
    start: {
        dateTime?: string;
        timeZone?: string;
        date?: string;
    };
    end: {
        dateTime?: string;
        timeZone?: string;
        date?: string;
    };
}