export type TaskList = {
    kind: string;
    id: string;
    title: string;
    updated: string;
    selfLink: string;
    etag: string;
}

export type TaskListsList = {
    items: TaskList[];
}

export type TaskDetails = {
    taskName: string;
    listName: string;
}

export type TaskItem = {
    kind: string,
    id: string,
    etag: string,
    title: string,
    updated: string,
    selfLink: string,
    position: string,
    status: string,
    links: string[],
    webViewLink: string
}