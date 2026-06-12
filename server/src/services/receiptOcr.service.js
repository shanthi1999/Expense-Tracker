import envConfig from '../config/env_config.js';
import AppError from '../utils/AppError.js';
import groqClient from '../clients/groq/groq.client.js';
import { GROQ_FALLBACK_MODELS } from '../vendors/groq/groq.js';
import expenseEnums from '../enums/expense.enums.js';

const PAYMENT_METHODS = Object.values(expenseEnums.paymentMethods);

const SYSTEM_PROMPT =
    'You extract structured expense data from receipt OCR text. Respond with valid JSON only.';

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

const buildPrompt = (rawText, categories, currency) => {
    const categoryList = categories.map((c) => ({ id: c.categoryId, title: c.title }));

    return `Extract expense details from this receipt OCR text. Respond with ONLY valid JSON.

Required JSON shape:
{
  "storeName": "<merchant or store name>",
  "date": "<YYYY-MM-DD or null if unknown>",
  "items": [
    { "name": "<item name>", "quantity": <number or 1>, "price": <number or null> }
  ],
  "totalAmount": <number — final total paid>,
  "suggestedCategoryTitle": "<best matching category title from the list below>",
  "paymentMethod": "<one of ${PAYMENT_METHODS.join(', ')} or null>",
  "description": "<short summary of items purchased>"
}

User categories (pick the closest suggestedCategoryTitle):
${JSON.stringify(categoryList, null, 2)}

Currency context: ${currency}

Rules:
- totalAmount must be a number, not a string
- date must be ISO YYYY-MM-DD or null
- If total is unclear, use the largest plausible total on the receipt
- items array can be empty if line items are unreadable
- suggestedCategoryTitle must match one of the user category titles when possible

OCR text:
"""
${rawText}
"""`;
};

const normalizeDate = (value) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toISOString().slice(0, 10);
};

const matchCategory = (categories, suggestedTitle) => {
    if (!suggestedTitle || !categories.length) return null;

    const normalized = suggestedTitle.trim().toLowerCase();
    const exact = categories.find((c) => c.title.trim().toLowerCase() === normalized);
    if (exact) return exact;

    const partial = categories.find(
        (c) =>
            c.title.trim().toLowerCase().includes(normalized) ||
            normalized.includes(c.title.trim().toLowerCase())
    );
    return partial || categories[0];
};

const parseReceiptText = async (rawText, categories, currency = 'USD') => {
    if (!envConfig.groq?.apiKey) {
        throw new AppError('Groq API key is required for receipt parsing. Set GROQ_API_KEY in .env.', 503);
    }

    const prompt = buildPrompt(rawText, categories, currency);
    const modelsToTry = getModelsToTry();
    let lastError = null;

    for (const modelName of modelsToTry) {
        try {
            const text = await groqClient.generateChatCompletion(modelName, prompt, SYSTEM_PROMPT);
            const parsed = parseJsonResponse(text);

            const matchedCategory = matchCategory(categories, parsed.suggestedCategoryTitle);
            const items = Array.isArray(parsed.items) ? parsed.items : [];
            const totalAmount = Number(parsed.totalAmount);

            return {
                storeName: parsed.storeName || null,
                date: normalizeDate(parsed.date),
                items,
                totalAmount: Number.isFinite(totalAmount) ? totalAmount : null,
                suggestedCategoryTitle: parsed.suggestedCategoryTitle || null,
                categoryId: matchedCategory?.categoryId || null,
                categoryTitle: matchedCategory?.title || null,
                paymentMethod: PAYMENT_METHODS.includes(parsed.paymentMethod)
                    ? parsed.paymentMethod
                    : null,
                description:
                    parsed.description ||
                    (items.length
                        ? items.map((i) => i.name).filter(Boolean).join(', ')
                        : null),
            };
        } catch (error) {
            lastError = error;
            if (groqClient.isTransientError(error)) continue;
            break;
        }
    }

    throw new AppError(
        lastError?.message || 'Failed to parse receipt text. Try a clearer photo.',
        502
    );
};

export default { parseReceiptText };
