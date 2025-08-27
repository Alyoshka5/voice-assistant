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

export type AddTaskToListDetails = {
    taskName: string;
    listName: string;
}