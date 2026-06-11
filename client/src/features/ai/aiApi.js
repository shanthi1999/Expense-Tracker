import apiClient from '../../lib/axios.js';

const aiApi = {
    getExpenseSummary: (params) => apiClient.get('/expense/ai-summary', { params }),
};

export default aiApi;
