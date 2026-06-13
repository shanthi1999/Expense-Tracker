import { getGroqClient } from '../../vendors/groq/groq.js';
import {
    CHAT_ROLE,
    COMPLETION_CONFIG,
    RETRY_CONFIG,
    TRANSIENT_STATUS_CODES,
    TRANSIENT_ERROR_KEYWORDS,
} from '../../constants/groq.constants.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isTransientError = (error) => {
    const message = (error?.message || '').toLowerCase();
    const status = error?.status || error?.statusCode;

    return (
        TRANSIENT_STATUS_CODES.includes(status) ||
        TRANSIENT_ERROR_KEYWORDS.some((keyword) => message.includes(keyword.toLowerCase()))
    );
};

const generateChatCompletion = async (modelName, prompt, systemPrompt) => {
    const client = getGroqClient();
    let lastError = null;

    for (let attempt = 0; attempt < RETRY_CONFIG.MAX_RETRIES; attempt++) {
        try {
            const completion = await client.chat.completions.create({
                model: modelName,
                messages: [
                    { role: CHAT_ROLE.SYSTEM, content: systemPrompt },
                    { role: CHAT_ROLE.USER, content: prompt },
                ],
                temperature: COMPLETION_CONFIG.TEMPERATURE,
                max_tokens: COMPLETION_CONFIG.MAX_TOKENS,
            });

            return completion.choices[0]?.message?.content || '';
        } catch (error) {
            lastError = error;
            const canRetry = isTransientError(error) && attempt < RETRY_CONFIG.MAX_RETRIES - 1;
            if (canRetry) {
                await sleep(RETRY_CONFIG.DELAYS_MS[attempt] ?? RETRY_CONFIG.DEFAULT_DELAY_MS);
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
