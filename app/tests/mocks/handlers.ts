import { http, HttpResponse } from 'msw';

export const handlers = [
    http.post('https://api.openai.com/v1/responses', async ({ request }) => {
        const body = await request.json() as any;
        let systemMessage = '';
        let userMessage = '';
        if (typeof body?.input === 'string') {
            systemMessage = body.input.toLowerCase();
        } else {
            systemMessage = body?.input?.find((message: any) => message.role === 'system')?.content.toLowerCase() || '';
            userMessage = body?.input?.find((message: any) => message.role === 'user')?.content.toLowerCase() || '';
        }

        if (systemMessage.includes('classify')) {
            let category = 'other';

            if (userMessage.includes('task')) category = 'tasks/todo';
            if (userMessage.includes('event') || userMessage.includes('calendar')) category = 'calendar';
            if (userMessage.includes('weather')) category = 'weather';
            if (userMessage.includes('video') || userMessage.includes('youtube')) category = 'youtube';

            return createOpenAIResponse(category);
        }
        
        // other category
        if (userMessage.includes('how are you?')) {
            return createOpenAIResponse('I am doing great. How about you?');
        }
        
        // tasks/todo category
        if (systemMessage.includes('requested list name'))
            return createOpenAIResponse('chores-list-id');

        if (systemMessage.includes('requested task name'))
            return createOpenAIResponse('dishes-task-id');

        switch (userMessage) {
            case 'what are my task lists?':
                return createFunctionCallResponse('getAllTaskLists', {});
            case 'create a task list called school':
                return createFunctionCallResponse('createTaskList', { title: 'school' });
            case 'add dishes to my chores task list':
                return createFunctionCallResponse('addTaskToList', { taskName: 'dishes', listName: 'chores' });
            case 'what tasks do i have in my chores list?':
                return createFunctionCallResponse('getTasksFromList', { listName: 'chores' });
            case 'set my dishes task in my chores list as completed':
                return createFunctionCallResponse('completeTaskInList', { taskName: 'dishes', listName: 'chores' });
            case 'set my dishes task\'s due date to tomorrow':
                return createFunctionCallResponse('setTaskDueDate', {
                    taskName: 'dishes', 
                    listName: 'chores',
                    dueDate: { day: 20, month: 12, year: 2025 }
                });
        }
            
        // calendar category
        if (systemMessage.includes('requested calendar name'))
            return createOpenAIResponse('primary-calendar-id');
        
        if (systemMessage.includes('requested event name'))
            return createOpenAIResponse('dinner-event-id');

        if (systemMessage.includes('dinner event description')) // for getEventInformation function
            return createOpenAIResponse('Your dinner event is at 3:00 pm');
        
        switch (userMessage) {
            case 'what events do i have in my primary calendar?':
                return createFunctionCallResponse('getEventsFromCalendar', { calendarName: 'primary' });
            case 'add a lunch event to my primary calendar for tomorrow at 1pm that lasts one hour':
                return createFunctionCallResponse('addEventToCalendar', {
                    calendarName: 'primary',
                    eventName: 'lunch',
                    relativeDate: 'tomorrow',
                    relativeTime: '1pm',
                    duration: '1 hour'
                });
            case 'what time is my primary calendar\'s dinner event at':
                return createFunctionCallResponse('getEventInformation', { calendarName: 'primary', eventName: 'dinner' });
        }
        
        // weather category
        if (systemMessage.includes('"temperature":{"degrees":20}')) // for getCurrentWeather function
            return createOpenAIResponse('It is currently cloudy with a temperature of 20 degrees');
            
        if (systemMessage.includes('"maxtemperature":{"degrees":25}')) // for getFutureWeatherForecast function
            return createOpenAIResponse('Tomorrow it is sunny with a high of 25 degrees');

        switch (userMessage) {
            case 'what\'s the weather?':
                return createFunctionCallResponse('getCurrentWeather', {});
            case 'what\'s the weather tomorrow?':
                return createFunctionCallResponse('getFutureWeatherForecast', {
                    date: {
                        day: 20,
                        month: 12,
                        year: 2025
                    }
                });
        }
        
        // youtube category
        if (systemMessage.includes('requested playlist name'))
            return createOpenAIResponse('cooking-playlist-id');

        switch (userMessage) {
            case 'add the video to my cooking playlist':
                return createFunctionCallResponse('addVideoToPlaylist', {
                    youtubeLink: 'https://www.youtube.com/watch?v=video-id',
                    playlistName: 'cooking'
                });
            case 'find a video on how to fry eggs':
                return createFunctionCallResponse('findYoutubeVideo', { videoQuery: 'frying eggs tutorial' });
        }
                
        return createOpenAIResponse('');
    }),
]

function createOpenAIResponse(outputText: string) {
    return HttpResponse.json({
        id: `resp_${Math.random().toString(36).slice(2)}`,
        object: "response",
        model: "gpt-4.1-nano",
        status: "completed",
        output: [
            {
                type: "message",
                id: "item_123",
                status: "completed",
                role: "assistant",
                content: [{ type: "output_text", text: outputText }]
            }
        ],
        usage: {
            total_tokens: 15,
            input_tokens: 5,
            output_tokens: 10
        }
    });
}

function createFunctionCallResponse(functionName: string, args: Object) {
    return HttpResponse.json({
        id: `resp_${Math.random().toString(36).slice(2)}`,
        object: "response",
        model: "gpt-4.1-nano",
        status: "completed",
        output: [
            {
                type: "function_call",
                id: "item_123",
                name: functionName,
                arguments: JSON.stringify(args)
            }
        ],
        usage: {
            total_tokens: 15,
            input_tokens: 5,
            output_tokens: 10
        }
    });
}