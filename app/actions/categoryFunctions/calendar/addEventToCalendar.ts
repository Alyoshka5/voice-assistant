import openAIClient from "@/app/lib/openai";
import { auth } from "@/auth";
import { CalendarItem, CalendarList, EventItem, CalendarEventDetails } from "@/app/types/types";
import * as chrono from 'chrono-node';
import { DateTime } from "luxon";

export default async function addEventToCalendar(details: CalendarEventDetails, isoNow: string, timeZone: string) {
    if (!details.eventName) {
        return {outputText: 'What is the name of the event you would like to add?'}
    }

    if (!details.calendarName) {
        return {outputText: 'Which calendar would you like to add the event to?'}
    }

    if (!details.relativeDate && !details.relativeTime) {
        return {outputText: 'When would you like to add the event?'}
    }

    if (!isoNow || !timeZone) {
        return {outputText: 'Sorry, I could not determine the current time and timezone.'}
    }

    
    const session = await auth();
    if (!session)
        return {outputText: 'You need to be signed in to add an event.'}
    
    const accessToken = session.accessToken;
    if (!accessToken)
        return {outputText: 'You need to be signed in to add an event.'}
    
    const calendarListResponse = await fetch(`https://www.googleapis.com/calendar/v3/users/me/calendarList`, {
        headers: {
            Authorization: 'Bearer ' + accessToken,
            'Content-Type': 'application/json',
        }
    });
    if (!calendarListResponse.ok)
        return {outputText: `Sorry, I couldn't add the event to your ${details.calendarName} calendar.`}
    
    const calendarListData: CalendarList = await calendarListResponse.json();
    
    const calendarListNames = calendarListData.items.filter((calendar: CalendarItem) => {
        return calendar.accessRole === 'owner' || calendar.accessRole === 'writer';
    }).map((calendar: CalendarItem) => {
        return `Name: ${calendar.summary}, ID: ${calendar.id}`;
    });
    
    const requestedCalendarName = details.calendarName;
    const requestedEventName = details.eventName;
    
    const calendarListIdentifierMessage = createCalendarIdentifierMessage(calendarListNames, requestedCalendarName);
    let openaiResponse;
    try {
        openaiResponse = await openAIClient.responses.create({
            model: "gpt-4.1-nano",
            input: calendarListIdentifierMessage
        });
        if (openaiResponse.error)
            throw new Error(openaiResponse.error.message);
    } catch (error) {
        return {outputText: `Sorry, I couldn't add the event to your ${details.calendarName} calendar.`}
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

    const eventStartDateTime = relativeToAbsoluteStartDateTime(details.relativeDate, details.relativeTime, isoNow, timeZone);
    const eventEndDateTime = eventStartDateTime.allDay ? null : relativeToAbsoluteEndDateTime(eventStartDateTime.dateTime, details.duration);
    
    const eventName = await addEvent(accessToken, calendarId, requestedEventName, eventStartDateTime.dateTime, eventStartDateTime.allDay, eventEndDateTime);
    if (eventName === '')
        return {outputText: `Sorry, I couldn't add the event to your ${requestedCalendarName} calendar.`}
    
    return {outputText: `I added "${eventName}" to your ${calendarName} calendar`}
}

function createCalendarIdentifierMessage(calendarNames: string[], requestedCalendarName: string) {
    return `Given a list of calendar names and ids, respond with the calendar id of the most relevant calendar name based on the user's request.
    If no relevant calendar is found, return an empty string. Do not return anything except for the calendar id or an empty string.
    Do not exclude @group.calendar.google.com from ids that contain it.
    Calendar Names and IDs: ${calendarNames.join('\n')}
    Requested calendar name: ${requestedCalendarName}`;
}

async function addEvent(accessToken: string, calendarId: string, eventName: string, startDateTime: string, allDay: boolean, endDateTime: string | null) {
    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`, {
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + accessToken,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            summary: eventName,
            start: allDay ? { date: startDateTime } : { dateTime: startDateTime },
            end: allDay ? { date: startDateTime } : { dateTime: endDateTime }
        })
    });
    
    if (!res.ok)
        return '';
    
    const data = await res.json();
    return data.summary;
}

function relativeToAbsoluteStartDateTime(relativeDate: string, relativeTime: string, isoNow: string, timeZone: string) {
    const now = DateTime.fromISO(isoNow, { zone: timeZone });

    const dateTimeStr = getDateTimeStr(relativeDate, relativeTime);
    const parsedDate = chrono.parseDate(dateTimeStr!, now.toJSDate());

    if (parsedDate) {
        const date = DateTime.fromJSDate(parsedDate, { zone: timeZone });
        if (relativeTime === 'all day') {
            return {
                dateTime: date.toFormat('yyyy-MM-dd'),
                allDay: true
            }
        }
        return {
            dateTime: date.toString(),
            allDay: false
        }
    }

    // fall back
    return {
        dateTime: isoNow,
        allDay: false
    }
}

function relativeToAbsoluteEndDateTime(startDateTime: string, duration: string) {
    let datetime = DateTime.fromISO(startDateTime);

    const [durationValueStr, durationUnit] = duration.split(' ');
    const durationValue = parseInt(durationValueStr);

    if (isNaN(durationValue)) {
        datetime = datetime.plus({ hours: 1 });
        return datetime.toISO();
    }

    const normalizedDurationUnit = durationUnit.toLowerCase().replace(/s$/, '');
    datetime = datetime.plus({ [normalizedDurationUnit]: durationValue });
    return datetime.toISO();
}

function getDateTimeStr(relativeDate: string, relativeTime: string) {
    const relativeDateArray = relativeDate.split(' ');
    const relativeTimeArray = relativeTime.split(' ');
    if (relativeDateArray[0] === 'in') {
        if (relativeDateArray[2] === 'minutes' || relativeDateArray[2] === 'minute') {
            return relativeDate;
        }
        else if (relativeDateArray[2] === 'hours' || relativeDateArray[2] === 'hour') {
            return relativeDate;
        }
        else if (relativeDateArray[2] === 'days' || relativeDateArray[2] === 'day') {
            if (relativeTime === 'all day') {
                return relativeDate;
            }
            else if (relativeTimeArray[0] === 'in' && (relativeTimeArray[2] === 'hours' || relativeTimeArray[2] === 'hour')) {
                return 'in ' + ((parseInt(relativeDateArray[1]) * 24) + (parseInt(relativeTimeArray[1]))) + ' hours';
            }
            else {
                return [relativeDate, relativeTime].filter(Boolean).join(' ');
            }
        }
        else if (relativeDateArray[2] === 'weeks' || relativeDateArray[2] === 'week') {
            return [relativeDate, relativeTime].filter(Boolean).join(' ')
        }
        else if (relativeDateArray[2] === 'months' || relativeDateArray[2] === 'month') {
            return [relativeDate, relativeTime].filter(Boolean).join(' ')
        }
        else if (relativeDateArray[2] === 'years' || relativeDateArray[2] === 'year') {
            return [relativeDate, relativeTime].filter(Boolean).join(' ')
        }
    } 
    else if (relativeTime.slice(0, 3) == 'in ') {
        return relativeTime;
    }
    else {
        return [relativeDate, relativeTime].filter(Boolean).join(' ');
    }
}