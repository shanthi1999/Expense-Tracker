import apiClient from '../../lib/axios.js';

const categoryApi = {
    getCategories: (params) => apiClient.get('/category', { params }),
    getCategory: (id) => apiClient.get(`/category/${id}`),
    createCategory: (payload) => apiClient.post('/category', payload),
    updateCategory: (id, payload) => apiClient.put(`/category/${id}`, payload),
    deleteCategory: (id) => apiClient.delete(`/category/${id}`),
};

export default categoryApi;
