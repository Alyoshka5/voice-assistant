import { afterEach } from 'vitest';
import tasksFunctionController from './tasksController';
import openAIClient from '@/app/lib/openai';
import { Conversation, UserRequestDetails } from '@/app/types/types';
import getAllTaskLists from "./getAllTaskLists";
import createTaskList from "./createTaskList";
import addTaskToList from "./addTaskToList";
import getTasksFromList from "./getTasksFromList";
import completeTaskInList from "./completeTaskInList";
import setTaskDueDate from "./setTaskDueDate";

vi.mock('@/auth', () => ({
    auth: vi.fn()
}));

vi.mock('@/app/lib/openai', () => ({
    default: {
        responses: {
            create: vi.fn()
        }
    }
}));

vi.mock('./getAllTaskLists', () => ({ default: vi.fn() }));
vi.mock('./createTaskList', () => ({ default: vi.fn() }));
vi.mock('./addTaskToList', () => ({ default: vi.fn() }));
vi.mock('./getTasksFromList', () => ({ default: vi.fn() }));
vi.mock('./completeTaskInList', () => ({ default: vi.fn() }));
vi.mock('./setTaskDueDate', () => ({ default: vi.fn() }));

describe('tasksFunctionController', () => {
    const mockedConversation: Conversation = [
        {
            role: 'user',
            content: 'user message',
        },
    ]

    const mockedUserRequestDetails: UserRequestDetails = {
        coordinates: { latitude: 49.2827, longitude: -123.1207 },
        date: "Wednesday, December 19, 2025",
        time: "2:30 PM",
        isoNow: "2025-12-19T14:30:00.000Z",
        timeZone: "America/Vancouver",
    }

    afterEach(() => {
        vi.resetAllMocks();
    })

    it('calls openAI API with correct arguments', async () => {
        vi.mocked(openAIClient.responses.create).mockResolvedValue({
            output: [
                { name: 'task function name' }
            ]
        } as any)

        await tasksFunctionController(mockedConversation, mockedUserRequestDetails);

        expect(openAIClient.responses.create).toHaveBeenCalledWith(expect.objectContaining({
            input: expect.arrayContaining([
                expect.objectContaining({role: 'system'}),
                ...mockedConversation
            ]),
            tools: expect.arrayContaining([
                expect.objectContaining({ name: 'getAllTaskLists' }),
                expect.objectContaining({ name: 'createTaskList' }),
                expect.objectContaining({ name: 'addTaskToList' }),
                expect.objectContaining({ name: 'getTasksFromList' }),
                expect.objectContaining({ name: 'completeTaskInList' }),
                expect.objectContaining({ name: 'setTaskDueDate' }),
            ])
        }))
    })

    it('calls correct function with correct arguments based on openAI API response', async () => {
        vi.mocked(openAIClient.responses.create).mockResolvedValue({
            output: [
                {
                    name: 'createTaskList',
                    arguments: `{
                        "title": "list name"
                    }`
                }
            ]
        } as any)

        await tasksFunctionController(mockedConversation, mockedUserRequestDetails);

        expect(createTaskList).toHaveBeenCalledWith('list name');
        expect(getAllTaskLists).not.toHaveBeenCalled();
        expect(addTaskToList).not.toHaveBeenCalled();
        expect(getTasksFromList).not.toHaveBeenCalled();
        expect(completeTaskInList).not.toHaveBeenCalled();
        expect(setTaskDueDate).not.toHaveBeenCalled();
    })

    it('returns default response when no matching task found', async () => {
        vi.mocked(openAIClient.responses.create).mockResolvedValue({
            output: [{ name: '' }]
        } as any)

        const response = await tasksFunctionController(mockedConversation, mockedUserRequestDetails);

        expect(getAllTaskLists).not.toHaveBeenCalled();
        expect(createTaskList).not.toHaveBeenCalled();
        expect(addTaskToList).not.toHaveBeenCalled();
        expect(getTasksFromList).not.toHaveBeenCalled();
        expect(completeTaskInList).not.toHaveBeenCalled();
        expect(setTaskDueDate).not.toHaveBeenCalled();
        expect(response.outputText).toMatch(/sorry.*understand/i);
    })

    it('handles OpenAI API errors', async () => {
        vi.mocked(openAIClient.responses.create).mockRejectedValue(new Error('API Error'));

        const result = await tasksFunctionController(mockedConversation, mockedUserRequestDetails);

        expect(result.outputText).toMatch(/sorry/i);
    });
})