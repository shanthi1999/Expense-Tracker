import apiClient from '../../lib/axios.js';

const notificationApi = {
    getNotifications: (params) => apiClient.get('/notification', { params }),
    markAsRead: (id) => apiClient.patch(`/notification/${id}/read`),
    markAllAsRead: () => apiClient.patch('/notification/read-all'),
};

export default notificationApi;
