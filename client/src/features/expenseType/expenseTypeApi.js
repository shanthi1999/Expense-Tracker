import apiClient from '../../lib/axios.js';

const expenseTypeApi = {
    getExpenseTypes: (params) => apiClient.get('/expenseType', { params }),
    getExpenseType: (id) => apiClient.get(`/expenseType/${id}`),
    createExpenseType: (payload) => apiClient.post('/expenseType', payload),
    updateExpenseType: (id, payload) => apiClient.put(`/expenseType/${id}`, payload),
    deleteExpenseType: (id) => apiClient.delete(`/expenseType/${id}`),
};

export default expenseTypeApi;
