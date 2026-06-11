import Groq from 'groq-sdk';
import envConfig from '../config/env_config.js';
import AppError from '../utils/AppError.js';

const FALLBACK_MODELS = ['llama-3.1-8b-instant', 'llama-3.3-70b-versatile'];

const MAX_RETRIES = 3;
const RETRY_DELAYS_MS = [1000, 2000, 4000];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getModelsToTry = () => {
    const preferred = envConfig.groq?.model || 'llama-3.1-8b-instant';
    return [...new Set([preferred, ...FALLBACK_MODELS])];
};

const getClient = () => {
    const apiKey = envConfig.groq?.apiKey;
    if (!apiKey) {
        throw new AppError('AI summary is not configured. Missing GROQ_API_KEY.', 503);
    }
    return new Groq({ apiKey });
};

const getErrorMessage = (error) => error?.message || '';

const isTransientError = (error) => {
    const message = getErrorMessage(error);
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

const isModelUnavailableError = (error) => {
    const message = getErrorMessage(error);
    const status = error?.status || error?.statusCode;
    return status === 404 || message.includes('404') || message.includes('does not exist');
};

const toAppError = (error) => {
    if (error instanceof AppError) return error;

    const message = getErrorMessage(error);
    const status = error?.status || error?.statusCode;

    if (isTransientError(error)) {
        return new AppError(
            'AI service is temporarily busy. Wait a few seconds and click Try again.',
            503
        );
    }

    if (status === 401 || message.includes('Invalid API Key') || message.includes('401')) {
        return new AppError('Invalid Groq API key. Check GROQ_API_KEY in server .env.', 503);
    }

    if (isModelUnavailableError(error)) {
        return new AppError(
            'The configured Groq model is unavailable. Set GROQ_MODEL=llama-3.1-8b-instant in server .env.',
            503
        );
    }

    return new AppError('Failed to generate AI summary. Please try again later.', 502);
};

const buildPrompt = (expenses, currency = 'USD') => {
    const expenseJson = JSON.stringify(expenses, null, 2);

    return `Analyze the following expenses and respond with ONLY valid JSON (no markdown fences, no extra text).

Required JSON shape:
{
  "summary": "2-3 sentence overview of overall spending",
  "totalSpent": <number>,
  "highestCategory": "<category name with highest spend>",
  "categoryBreakdown": [
    { "category": "<name>", "amount": <number>, "percentage": <number> }
  ],
  "patterns": "Notable spending patterns (timing, frequency, spikes)",
  "habits": "Observed spending habits",
  "insight": "One key insight in a single sentence",
  "suggestion": "One actionable saving suggestion with approximate amount if possible"
}

Rules:
- Currency context: ${currency}
- If there are no expenses, set totalSpent to 0, use empty arrays/strings, and suggest adding expenses in summary
- categoryBreakdown percentages should sum to ~100 when there are expenses
- Be concise, practical, and friendly
- Amounts must be numbers, not strings

Expenses:
${expenseJson}`;
};

const parseAiResponse = (text) => {
    const cleaned = text
        .trim()
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

    try {
        return JSON.parse(cleaned);
    } catch {
        return {
            summary: cleaned,
            totalSpent: null,
            highestCategory: null,
            categoryBreakdown: [],
            patterns: '',
            habits: '',
            insight: '',
            suggestion: '',
        };
    }
};

const generateWithModel = async (client, modelName, prompt) => {
    let lastError = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const completion = await client.chat.completions.create({
                model: modelName,
                messages: [
                    {
                        role: 'system',
                        content:
                            'You are a personal finance assistant for an expense tracker app. Respond with valid JSON only.',
                    },
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

const summarizeExpenses = async (expenses, currency = 'USD') => {
    const client = getClient();
    const prompt = buildPrompt(expenses, currency);
    const modelsToTry = getModelsToTry();
    let lastError = null;

    for (const modelName of modelsToTry) {
        try {
            const text = await generateWithModel(client, modelName, prompt);
            const parsed = parseAiResponse(text);

            return {
                summary: parsed.summary || text,
                totalSpent: parsed.totalSpent ?? null,
                highestCategory: parsed.highestCategory ?? null,
                categoryBreakdown: Array.isArray(parsed.categoryBreakdown)
                    ? parsed.categoryBreakdown
                    : [],
                patterns: parsed.patterns || '',
                habits: parsed.habits || '',
                insight: parsed.insight || '',
                suggestion: parsed.suggestion || '',
            };
        } catch (error) {
            lastError = error;
            if (isTransientError(error) || isModelUnavailableError(error)) {
                continue;
            }
            throw toAppError(error);
        }
    }

    throw toAppError(lastError);
};

export default {
    summarizeExpenses,
};
