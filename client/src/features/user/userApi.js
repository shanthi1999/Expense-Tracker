import apiClient from '../../lib/axios.js';

const userApi = {
    getMe: () => apiClient.get('/user/me'),
    getUser: (id) => apiClient.get(`/user/${id}`),
    updateUser: (id, payload) => apiClient.put(`/user/${id}`, payload),
};

export default userApi;
