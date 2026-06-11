import apiClient from '../../lib/axios.js';

const authApi = {
    register: (payload) => apiClient.post('/auth/register', payload),
    login: (payload) => apiClient.post('/auth/login', payload),
    refreshToken: () => apiClient.post('/auth/refresh-token'),
    logout: () => apiClient.post('/auth/logout'),
};

export default authApi;
