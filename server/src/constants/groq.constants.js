export const CHAT_ROLE = {
    SYSTEM: 'system',
    USER: 'user',
};

export const COMPLETION_CONFIG = {
    TEMPERATURE: 0.4,
    MAX_TOKENS: 1024,
};

export const RETRY_CONFIG = {
    MAX_RETRIES: 3,
    DELAYS_MS: [1000, 2000, 4000],
    DEFAULT_DELAY_MS: 4000,
};

export const TRANSIENT_STATUS_CODES = [429, 503];

export const TRANSIENT_ERROR_KEYWORDS = ['429', '503', 'rate limit', 'overloaded'];
