import apiClient from '../../lib/axios.js';

const userApi = {
    getMe: () => apiClient.get('/user/me'),
    getUser: (id) => apiClient.get(`/user/${id}`),
    updateUser: (id, payload) => apiClient.put(`/user/${id}`, payload),
    uploadProfileImage: (file) => {
        const formData = new FormData();
        formData.append('image', file);
        return apiClient.post('/user/me/profile-image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
};

export default userApi;
