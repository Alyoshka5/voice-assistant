export type CalendarItem = {
    id: string;
    summary: string;
    description: string;
    accessRole?: string;
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

export type CalendarEventDetails = {
    calendarName: string;
    eventName: string;
    relativeDate: string;
    relativeTime: string;
    duration: string;
}