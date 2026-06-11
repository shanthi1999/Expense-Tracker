import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import expenseTypeApi from './expenseTypeApi.js';
import { getApiErrorMessage } from '../../lib/axios.js';

export const fetchExpenseTypes = createAsyncThunk(
    'expenseType/fetchExpenseTypes',
    async (params = {}, { rejectWithValue }) => {
        try {
            const { data } = await expenseTypeApi.getExpenseTypes(params);
            return data.data;
        } catch (error) {
            return rejectWithValue(getApiErrorMessage(error));
        }
    }
);

export const createExpenseType = createAsyncThunk(
    'expenseType/createExpenseType',
    async (payload, { rejectWithValue }) => {
        try {
            const { data } = await expenseTypeApi.createExpenseType(payload);
            return data.data;
        } catch (error) {
            return rejectWithValue(getApiErrorMessage(error));
        }
    }
);

export const updateExpenseType = createAsyncThunk(
    'expenseType/updateExpenseType',
    async ({ id, payload }, { rejectWithValue }) => {
        try {
            const { data } = await expenseTypeApi.updateExpenseType(id, payload);
            return data.data;
        } catch (error) {
            return rejectWithValue(getApiErrorMessage(error));
        }
    }
);

export const deleteExpenseType = createAsyncThunk(
    'expenseType/deleteExpenseType',
    async (id, { rejectWithValue }) => {
        try {
            await expenseTypeApi.deleteExpenseType(id);
            return id;
        } catch (error) {
            return rejectWithValue(getApiErrorMessage(error));
        }
    }
);

const expenseTypeSlice = createSlice({
    name: 'expenseType',
    initialState: {
        expenseTypes: [],
        pagination: { page: 1, limit: 10, total: 0 },
        status: 'idle',
        error: null,
    },
    reducers: {
        clearExpenseTypeError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchExpenseTypes.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchExpenseTypes.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.expenseTypes = action.payload.data;
                state.pagination = {
                    page: action.payload.page,
                    limit: action.payload.limit,
                    total: action.payload.total,
                };
            })
            .addCase(fetchExpenseTypes.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(createExpenseType.fulfilled, (state, action) => {
                state.expenseTypes.unshift(action.payload);
                state.pagination.total += 1;
            })
            .addCase(updateExpenseType.fulfilled, (state, action) => {
                const index = state.expenseTypes.findIndex(
                    (e) => e.expenseTypeId === action.payload.expenseTypeId
                );
                if (index !== -1) state.expenseTypes[index] = action.payload;
            })
            .addCase(deleteExpenseType.fulfilled, (state, action) => {
                state.expenseTypes = state.expenseTypes.filter(
                    (e) => e.expenseTypeId !== action.payload
                );
                state.pagination.total = Math.max(0, state.pagination.total - 1);
            });
    },
});

export const { clearExpenseTypeError } = expenseTypeSlice.actions;
export default expenseTypeSlice.reducer;
