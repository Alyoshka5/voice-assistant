import { http, HttpResponse } from 'msw';

export const handlers = [
    http.post('https://api.openai.com/v1/responses', async ({ request }) => {
        const body = await request.json() as any;
        const systemMessage = body?.input?.find((message: any) => message.role === 'system')?.content.toLowerCase() || '';
        const userMessage = body?.input?.find((message: any) => message.role === 'user')?.content.toLowerCase() || '';
        if (systemMessage.includes('classify')) {
            let category = 'other';
            return createOpenAIResponse(category);
        }
        
        // other category
        if (userMessage.includes('how are you?')) {
            return createOpenAIResponse('I am doing great. How about you?')
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