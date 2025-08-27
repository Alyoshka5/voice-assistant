import { auth } from '@/auth';

export default async function createTaskList(title: string) {
    const session = await auth();
    if (!session) 
        return {outputText: 'You need to be signed in to create a list.'}

    const accessToken = session.accessToken;
    if (!accessToken)
        return {outputText: 'You need to be signed in to create a list.'}

    const res = await fetch(`https://tasks.googleapis.com/tasks/v1/users/@me/lists`, {
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + accessToken,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            title: title
        })
    });

    if (!res.ok)
        return {outputText: `Sorry, I couldn't add the list.`}

    return {
        outputText: `I added ${title} to your lists.`,
    }
}
