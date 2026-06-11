import Groq from 'groq-sdk';
import envConfig from '../../config/env_config.js';
import AppError from '../../utils/AppError.js';

export const getGroqClient = () => {
    const apiKey = envConfig.groq?.apiKey;
    if (!apiKey) {
        throw new AppError('AI summary is not configured. Missing GROQ_API_KEY.', 503);
    }
    return new Groq({ apiKey });
};

export const getGroqModel = () => envConfig.groq?.model || 'llama-3.1-8b-instant';

export const GROQ_FALLBACK_MODELS = ['llama-3.1-8b-instant', 'llama-3.3-70b-versatile'];
