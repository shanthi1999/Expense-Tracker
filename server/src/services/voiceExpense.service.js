import envConfig from '../config/env_config.js';
import AppError from '../utils/AppError.js';
import groqClient from '../clients/groq/groq.client.js';
import { GROQ_FALLBACK_MODELS } from '../vendors/groq/groq.js';
import expenseEnums from '../enums/expense.enums.js';

const PAYMENT_METHODS = Object.values(expenseEnums.paymentMethods);

const SYSTEM_PROMPT =
    'You parse spoken expense descriptions into structured data. Respond with valid JSON only.';

const getModelsToTry = () => {
    const preferred = envConfig.groq?.model || 'llama-3.1-8b-instant';
    return [...new Set([preferred, ...GROQ_FALLBACK_MODELS])];
};

const parseJsonResponse = (text) => {
    const cleaned = text
        .trim()
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

    return JSON.parse(cleaned);
};

const normalizeDate = (value) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toISOString().slice(0, 10);
};

const matchByTitle = (items, suggestedTitle) => {
    if (!suggestedTitle || !items.length) return null;

    const normalized = suggestedTitle.trim().toLowerCase();
    const exact = items.find((item) => item.title.trim().toLowerCase() === normalized);
    if (exact) return exact;

    const partial = items.find(
        (item) =>
            item.title.trim().toLowerCase().includes(normalized) ||
            normalized.includes(item.title.trim().toLowerCase())
    );
    return partial || items[0];
};

const buildPrompt = (transcript, categories, expenseTypes, currency) => {
    const categoryList = categories.map((c) => ({ id: c.categoryId, title: c.title }));
    const typeList = expenseTypes.map((t) => ({ id: t.expenseTypeId, title: t.title }));

    return `Parse this spoken expense into structured data. Respond with ONLY valid JSON.

Required JSON shape:
{
  "title": "<short expense title, e.g. Petrol, Groceries, Netflix>",
  "amount": <number only, no currency symbols>,
  "date": "<YYYY-MM-DD or null — use today if not mentioned>",
  "suggestedCategoryTitle": "<best match from user categories>",
  "suggestedExpenseTypeTitle": "<best match from user expense types>",
  "paymentMethod": "<one of ${PAYMENT_METHODS.join(', ')} or null>",
  "description": "<optional extra detail from speech>"
}

User categories:
${JSON.stringify(categoryList, null, 2)}

User expense types:
${JSON.stringify(typeList, null, 2)}

User currency: ${currency}

Rules:
- Understand phrases like "spent 500 rupees on petrol", "paid 1200 for groceries yesterday", "2000 UPI at amazon"
- amount must be a number
- title should be concise (1-4 words)
- date: use today's date (${new Date().toISOString().slice(0, 10)}) when not specified
- Infer payment method only if explicitly mentioned (cash, UPI, card, etc.)
- Map petrol/fuel to Travel if available; food/groceries to Food; etc.

Spoken text:
"""
${transcript}
"""`;
};

const parseVoiceTranscript = async (
    transcript,
    categories,
    expenseTypes,
    currency = 'USD'
) => {
    if (!envConfig.groq?.apiKey) {
        throw new AppError('Groq API key is required for voice parsing. Set GROQ_API_KEY in .env.', 503);
    }

    const prompt = buildPrompt(transcript, categories, expenseTypes, currency);
    const modelsToTry = getModelsToTry();
    let lastError = null;

    for (const modelName of modelsToTry) {
        try {
            const text = await groqClient.generateChatCompletion(modelName, prompt, SYSTEM_PROMPT);
            const parsed = parseJsonResponse(text);

            const matchedCategory = matchByTitle(categories, parsed.suggestedCategoryTitle);
            const matchedType = matchByTitle(expenseTypes, parsed.suggestedExpenseTypeTitle);
            const amount = Number(parsed.amount);

            return {
                title: parsed.title || null,
                amount: Number.isFinite(amount) ? amount : null,
                date: normalizeDate(parsed.date) || new Date().toISOString().slice(0, 10),
                suggestedCategoryTitle: parsed.suggestedCategoryTitle || null,
                categoryId: matchedCategory?.categoryId || null,
                categoryTitle: matchedCategory?.title || null,
                suggestedExpenseTypeTitle: parsed.suggestedExpenseTypeTitle || null,
                expenseTypeId: matchedType?.expenseTypeId || null,
                expenseTypeTitle: matchedType?.title || null,
                paymentMethod: PAYMENT_METHODS.includes(parsed.paymentMethod)
                    ? parsed.paymentMethod
                    : null,
                description: parsed.description || null,
                transcript,
            };
        } catch (error) {
            lastError = error;
            if (groqClient.isTransientError(error)) continue;
            break;
        }
    }

    throw new AppError(
        lastError?.message || 'Could not understand the expense. Try speaking more clearly.',
        502
    );
};

export default { parseVoiceTranscript };
