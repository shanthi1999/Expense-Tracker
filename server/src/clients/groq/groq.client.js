import { getGroqClient } from '../../vendors/groq/groq.js';

const MAX_RETRIES = 3;
const RETRY_DELAYS_MS = [1000, 2000, 4000];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isTransientError = (error) => {
    const message = error?.message || '';
    const status = error?.status || error?.statusCode;
    return (
        status === 429 ||
        status === 503 ||
        message.includes('429') ||
        message.includes('503') ||
        message.includes('rate limit') ||
        message.includes('Rate limit') ||
        message.includes('overloaded')
    );
};

const generateChatCompletion = async (modelName, prompt, systemPrompt) => {
    const client = getGroqClient();
    let lastError = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const completion = await client.chat.completions.create({
                model: modelName,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt },
                ],
                temperature: 0.4,
                max_tokens: 1024,
            });

            return completion.choices[0]?.message?.content || '';
        } catch (error) {
            lastError = error;
            const canRetry = isTransientError(error) && attempt < MAX_RETRIES - 1;
            if (canRetry) {
                await sleep(RETRY_DELAYS_MS[attempt] ?? 4000);
                continue;
            }
            throw error;
        }
    }

    throw lastError;
};

export default {
    generateChatCompletion,
    isTransientError,
};
