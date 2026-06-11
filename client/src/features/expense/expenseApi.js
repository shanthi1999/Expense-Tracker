import apiClient from '../../lib/axios.js';

const expenseApi = {
    getExpenses: (params) => apiClient.get('/expense', { params }),
    exportExpenses: (params) =>
        apiClient.get('/expense/export', { params, responseType: 'blob' }),
    createExpense: (payload) => apiClient.post('/expense', payload),
    updateExpense: (id, payload) => apiClient.put(`/expense/${id}`, payload),
    deleteExpense: (id) => apiClient.delete(`/expense/${id}`),
};

export default expenseApi;
