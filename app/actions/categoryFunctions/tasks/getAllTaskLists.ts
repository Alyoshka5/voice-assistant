import { auth } from '@/auth';
import { TaskList } from '@/app/types/types';

export default async function getYouTubeVideoId() {
    const session = await auth();
    if (!session) 
        return {outputText: 'You need to be signed in to find a your lists.'}

    const accessToken = session.accessToken;
    if (!accessToken)
        return {outputText: 'You need to be signed in to find your lists.'}

    const res = await fetch(`https://tasks.googleapis.com/tasks/v1/users/@me/lists`, {
        headers: {
            Authorization: 'Bearer ' + accessToken,
            'Content-Type': 'application/json',
        }
    });

    if (!res.ok)
        return {outputText: `Sorry, I couldn't find your lists.`}

    const data = await res.json();
    const taskLists = data.items.map((list: TaskList) => list.title);
    // format the task lists into a human-readable string
    const taskListsString = [taskLists.slice(0, -1).join(', '), taskLists.slice(-1)[0]].join(taskLists.length == 2 ? ' and ' : taskLists.length < 2 ? '' : ', and ');

    return {
        outputText: `Your lists are ${taskListsString}.`,
    }
}
