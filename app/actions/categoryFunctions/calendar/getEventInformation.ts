import openAIClient from "@/app/lib/openai";
import { auth } from "@/auth";
import { CalendarItem, CalendarList, Conversation, EventItem, EventResource } from "@/app/types/types";


export default async function getEventInformation(conversation: Conversation, requestedCalendarName: string, requestedEventName: string, currentDate: string, currentTime: string) {
    const session = await auth();
    if (!session)
        return {outputText: 'You need to be signed in to check your calendar events.'}

    const accessToken = session.accessToken;
    if (!accessToken)
        return {outputText: 'You need to be signed in to check your calendar events.'}

    if (!requestedCalendarName)
        return {outputText: `What calendar is the event in?`}

    if (!requestedEventName) {
        return {outputText: `What's the name of the event?`}
    }
    
    const calendarListResponse = await fetch(`https://www.googleapis.com/calendar/v3/users/me/calendarList`, {
        headers: {
            Authorization: 'Bearer ' + accessToken,
            'Content-Type': 'application/json',
        }
    });
    
    if (!calendarListResponse.ok)
        return {outputText: `Sorry, I couldn't find your calendars.`}

    const calendarListData: CalendarList = await calendarListResponse.json();
    
    const calendarNames = calendarListData.items.map((calendar: CalendarItem) => {
        return `Name: ${calendar.summary}, ID: ${calendar.id}`;
    });
    
    const calendarIdentifierMessage = createCalendarIdentifierMessage(calendarNames, requestedCalendarName);
    let openaiCalendarResponse;
    try {
        openaiCalendarResponse = await openAIClient.responses.create({
            model: "gpt-4.1-nano",
            input: calendarIdentifierMessage
        });
        if (openaiCalendarResponse.error)
            throw new Error(openaiCalendarResponse.error.message);
    } catch (error) {
        return {outputText: `Sorry, I couldn't check your ${requestedCalendarName} calendar.`}
    }

    let calendarId = openaiCalendarResponse.output_text.trim();
    const openaiDefaultIds = ['', '\'\'', '""', '```plaintext\n```']
    if (openaiDefaultIds.includes(calendarId)) { // calendar doesn't exist
        return {outputText: `Sorry, I couldn't find a calendar with the name ${requestedCalendarName}.`}
    }
    if (!calendarId.endsWith('.com')) {
        calendarId += '@group.calendar.google.com'; // append domain if missing
    }

    let calendarName = calendarListData.items.find((calendar: CalendarItem) => calendar.id === calendarId)?.summary;

    const currentDateTime = `${currentDate} ${currentTime}`;
    const eventListData = await getEvents(accessToken, calendarId, currentDateTime);
    if (eventListData === '')
        return {outputText: `Sorry, I couldn't find your events.`}

    const eventNames = eventListData.items.map((event: EventItem) => {
        return `Name: ${event.summary}, ID: ${event.id}`;
    });
    const eventIdentifierMessage = createEventIdentifierMessage(eventNames, requestedEventName);
    let openaiEventResponse;
    try {
        openaiEventResponse = await openAIClient.responses.create({
            model: "gpt-4.1-nano",
            input: eventIdentifierMessage
        });
        if (openaiEventResponse.error)
            throw new Error(openaiEventResponse.error.message);
    } catch (error) {
        return {outputText: `Sorry, I couldn't check your ${requestedEventName} event.`}
    }

    const eventId = openaiEventResponse.output_text.trim();

    const event = eventListData.items.find((event: EventItem) => event.id === eventId);
    if (openaiDefaultIds.includes(eventId)) { // calendar doesn't exist
        return {outputText: `Sorry, I couldn't find an event with the name ${requestedEventName} in your ${requestedCalendarName} calendar.`}
    }

    const formatter = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true
      });

    const eventDetails = {
        status: event?.status,
        summary: event?.summary,
        description: event?.description,
        location: event?.location,
        creator: event?.creator,
        start: formatter.format(new Date(event.start.dateTime ?? event.start.date ?? "")),
        end: formatter.format(new Date(event.end.dateTime ?? event.end.date ?? ""))
    }

    const eventInformationMessage = createEventInformationMessage(calendarName || "primary", eventDetails);

    let openaiEventInformationResponse;
    try {
        openaiEventInformationResponse = await openAIClient.responses.create({
            model: "gpt-4.1-nano",
            input: [
                { role: 'system', content: eventInformationMessage },
                ...conversation,
            ],
        });
        if (openaiEventInformationResponse.error)
            throw new Error(openaiEventInformationResponse.error.message);
    } catch (error) {
        return {outputText: `Sorry, I couldn't check your ${eventDetails.summary} event.`}
    }

    return {outputText: openaiEventInformationResponse.output_text.trim()}
}

function createCalendarIdentifierMessage(calendarNames: string[], requestedCalendarName: string) {
    return `Given a list of calendar names and ids, respond with the calendar id of the most relevant calendar name based on the user's request.
    If no relevant calendar is found, return an empty string. Do not return anything except for the calendar id or an empty string.
    Do not exclude @group.calendar.google.com from ids that contain it.
    Calendar Names and IDs: ${calendarNames.join('\n')}
    Requested calendar name: ${requestedCalendarName}`;
}

function createEventIdentifierMessage(eventNames: string[], requestedEventName: string) {
    return `Given a list of event names and ids, respond with the event id of the most relevant event name based on the user's request.
    If no relevant event is found, return an empty string. Do not return anything except for the event id or an empty string.
    Event Names and IDs: ${eventNames.join('\n')}
    Requested event name: ${requestedEventName}`;
}

function createEventInformationMessage(calendarName: string, eventDetails: EventResource) {
    return `You are an assistant that must help the user with an event in their ${calendarName} calendar. Present the answer in a clear and natural way (not raw JSON). 
    Do not invent or assume details that are not present in the provided event information. Only respond with the information the user requested.
    Event information: ${JSON.stringify(eventDetails)}`;
}

async function getEvents(accessToken: string, calendarId: string, currentDateTime: string) {
    let currentISODateTime = (new Date(currentDateTime)).toISOString();
    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?maxResults=20&orderBy=startTime&singleEvents=true&timeMin=${currentISODateTime}`, {
        headers: {
            Authorization: 'Bearer ' + accessToken,
        }
    });
    
    if (!res.ok)
        return '';
    
    const data = await res.json();
    return data
}

