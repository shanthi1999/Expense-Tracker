import axios from 'axios';

const ACCESS_TOKEN_KEY = 'accessToken';

/** Base API client — credentials enabled for refresh-token cookie. */
export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api/v1',
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve(token);
    });
    failedQueue = [];
};

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);

export const setAccessToken = (token) => {
    if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token);
    else localStorage.removeItem(ACCESS_TOKEN_KEY);
};

apiClient.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;
        const url = originalRequest?.url ?? '';

        const isAuthRoute =
            url.includes('/auth/login') ||
            url.includes('/auth/register') ||
            url.includes('/auth/refresh-token') ||
            url.includes('/auth/logout');

        if (status !== 401 || isAuthRoute || originalRequest._retry) {
            return Promise.reject(error);
        }

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return apiClient(originalRequest);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const { data } = await apiClient.post('/auth/refresh-token');
            const newToken = data.data.accessToken;
            setAccessToken(newToken);
            processQueue(null, newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError, null);
            setAccessToken(null);
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

/** Normalize API errors into a consistent shape for UI handling. */
export const getApiErrorMessage = (error, fallback = 'Something went wrong') => {
    const data = error?.response?.data;

    if (data?.errors?.length) return data.errors.join(', ');
    if (data?.message) return data.message;
    if (error?.message) return error.message;

    return fallback;
};

export default apiClient;
