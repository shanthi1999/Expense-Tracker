import apiClient from '../../lib/axios.js';

const savingsGoalApi = {
    getSavingsGoals: (params) => apiClient.get('/savingsGoal', { params }),
    createSavingsGoal: (payload) => apiClient.post('/savingsGoal', payload),
    updateSavingsGoal: (id, payload) => apiClient.put(`/savingsGoal/${id}`, payload),
    contributeToGoal: (id, amount) => apiClient.patch(`/savingsGoal/${id}/contribute`, { amount }),
    deleteSavingsGoal: (id) => apiClient.delete(`/savingsGoal/${id}`),
};

export default savingsGoalApi;
