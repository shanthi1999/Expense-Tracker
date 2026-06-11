import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import categoryApi from './categoryApi.js';
import { getApiErrorMessage } from '../../lib/axios.js';

export const fetchCategories = createAsyncThunk(
    'category/fetchCategories',
    async (params = {}, { rejectWithValue }) => {
        try {
            const { data } = await categoryApi.getCategories(params);
            return data.data;
        } catch (error) {
            return rejectWithValue(getApiErrorMessage(error));
        }
    }
);

export const createCategory = createAsyncThunk(
    'category/createCategory',
    async (payload, { rejectWithValue }) => {
        try {
            const { data } = await categoryApi.createCategory(payload);
            return data.data;
        } catch (error) {
            return rejectWithValue(getApiErrorMessage(error));
        }
    }
);

export const updateCategory = createAsyncThunk(
    'category/updateCategory',
    async ({ id, payload }, { rejectWithValue }) => {
        try {
            const { data } = await categoryApi.updateCategory(id, payload);
            return data.data;
        } catch (error) {
            return rejectWithValue(getApiErrorMessage(error));
        }
    }
);

export const deleteCategory = createAsyncThunk(
    'category/deleteCategory',
    async (id, { rejectWithValue }) => {
        try {
            await categoryApi.deleteCategory(id);
            return id;
        } catch (error) {
            return rejectWithValue(getApiErrorMessage(error));
        }
    }
);

const categorySlice = createSlice({
    name: 'category',
    initialState: {
        categories: [],
        pagination: { page: 1, limit: 10, total: 0 },
        sort: { sortBy: null, order: 'DESC' },
        status: 'idle',
        error: null,
    },
    reducers: {
        clearCategoryError: (state) => {
            state.error = null;
        },
        setCategoryFilters: (state, action) => {
            state.pagination = { ...state.pagination, ...action.payload };
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCategories.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.categories = action.payload.data;
                state.pagination = {
                    page: action.payload.page,
                    limit: action.payload.limit,
                    total: action.payload.total,
                };
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(createCategory.fulfilled, (state, action) => {
                state.categories.unshift(action.payload);
                state.pagination.total += 1;
            })
            .addCase(updateCategory.fulfilled, (state, action) => {
                const index = state.categories.findIndex(
                    (c) => c.categoryId === action.payload.categoryId
                );
                if (index !== -1) state.categories[index] = action.payload;
            })
            .addCase(deleteCategory.fulfilled, (state, action) => {
                state.categories = state.categories.filter((c) => c.categoryId !== action.payload);
                state.pagination.total = Math.max(0, state.pagination.total - 1);
            });
    },
});

export const { clearCategoryError, setCategoryFilters } = categorySlice.actions;
export default categorySlice.reducer;
