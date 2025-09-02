import openAIClient from "@/app/lib/openai";
import { auth } from "@/auth";
import { CalendarItem, CalendarList, EventItem } from "@/app/types/types";


export default async function getEventsFromCalendar(requestedCalendarName: string, currentDate: string, currentTime: string) {
    const session = await auth();
    if (!session)
        return {outputText: 'You need to be signed in to check your calendar.'}

    const accessToken = session.accessToken;
    if (!accessToken)
        return {outputText: 'You need to be signed in to check your calendar.'}
    if (!requestedCalendarName)
        return {outputText: `What calendar would you like to check?`}
    
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
    let openaiResponse;
    try {
        openaiResponse = await openAIClient.responses.create({
            model: "gpt-4.1-nano",
            input: calendarIdentifierMessage
        });
        if (openaiResponse.error)
            throw new Error(openaiResponse.error.message);
    } catch (error) {
        return {outputText: `Sorry, I couldn't check your ${requestedCalendarName} calendar.`}
    }

    let calendarId = openaiResponse.output_text.trim();
    if (!calendarId.endsWith('.com')) {
        calendarId += '@group.calendar.google.com'; // append domain if missing
    }

    let calendarName = calendarListData.items.find((calendar: CalendarItem) => calendar.id === calendarId)?.summary;
    const openaiDefaultIds = ['', '\'\'', '""', '```plaintext\n```']
    if (openaiDefaultIds.includes(calendarId)) { // calendar doesn't exist
        return {outputText: `Sorry, I couldn't find a calendar with the name ${requestedCalendarName}.`}
    }

    const currentDateTime = `${currentDate} ${currentTime}`;
    const calendarEvents = await getEvents(accessToken, calendarId, currentDateTime);
    if (calendarEvents === '')
        return {outputText: `Sorry, I couldn't find your events.`}

    const formatter = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true
      });
    const events = calendarEvents.items.map((event: EventItem) => {
        return {
            name: event.summary,
            time: formatter.format(new Date(event.start.dateTime ?? event.start.date ?? ""))
        }
    });
    const eventsNameDateTime = events.map((event: {name: string, time: string}) => `${event.name} on ${event.time}`);
    const eventsString = [eventsNameDateTime.slice(0, -1).join(', '), eventsNameDateTime.slice(-1)[0]].join(eventsNameDateTime.length == 2 ? ' and ' : eventsNameDateTime.length < 2 ? '' : ', and ')

    return {outputText: events.length > 0 ? `Your future events in ${calendarName} are: ${eventsString}.` : `You have no future events in your ${calendarName} calendar.`}
}

function createCalendarIdentifierMessage(calendarNames: string[], requestedCalendarName: string) {
    return `Given a list of calendar names and ids, respond with the calendar id of the most relevant calendar name based on the user's request.
    If no relevant calendar is found, return an empty string. Do not return anything except for the calendar id or an empty string.
    Do not exclude @group.calendar.google.com from ids that contain it.
    Calendar Names and IDs: ${calendarNames.join('\n')}
    Requested calendar name: ${requestedCalendarName}`;
}

async function getEvents(accessToken: string, calendarId: string, currentDateTime: string) {
    let currentISODateTime = (new Date(currentDateTime)).toISOString();
    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?maxResults=3&orderBy=startTime&singleEvents=true&timeMin=${currentISODateTime}`, {
        headers: {
            Authorization: 'Bearer ' + accessToken,
        }
    });
    
    if (!res.ok)
        return '';
    
    const data = await res.json();
    return data
}

