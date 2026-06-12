import apiClient from '../../lib/axios.js';

const scheduledExpenseApi = {
    getScheduledExpenses: (params) => apiClient.get('/scheduledExpense', { params }),
    createScheduledExpense: (payload) => apiClient.post('/scheduledExpense', payload),
    updateScheduledExpense: (id, payload) => apiClient.put(`/scheduledExpense/${id}`, payload),
    deleteScheduledExpense: (id) => apiClient.delete(`/scheduledExpense/${id}`),
    processSchedules: () => apiClient.post('/scheduledExpense/process'),
};

export default scheduledExpenseApi;
