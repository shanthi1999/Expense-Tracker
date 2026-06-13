import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import expenseApi from './expenseApi.js';
import { getApiErrorMessage } from '../../lib/axios.js';

export const fetchExpenses = createAsyncThunk(
    'expense/fetchExpenses',
    async (params = {}, { rejectWithValue }) => {
        try {
            const { data } = await expenseApi.getExpenses(params);
            return {
                data: data.data.data,
                total: data.data.total,
                page: data.data.page,
                limit: data.data.limit,
            };
        } catch (error) {
            return rejectWithValue(getApiErrorMessage(error));
        }
    }
);

export const createExpense = createAsyncThunk(
    'expense/createExpense',
    async (payload, { rejectWithValue }) => {
        try {
            const { data } = await expenseApi.createExpense(payload);
            return data.data;
        } catch (error) {
            return rejectWithValue(getApiErrorMessage(error));
        }
    }
);

export const updateExpense = createAsyncThunk(
    'expense/updateExpense',
    async ({ id, payload }, { rejectWithValue }) => {
        try {
            const { data } = await expenseApi.updateExpense(id, payload);
            return data.data;
        } catch (error) {
            return rejectWithValue(getApiErrorMessage(error));
        }
    }
);

export const deleteExpense = createAsyncThunk(
    'expense/deleteExpense',
    async (id, { rejectWithValue }) => {
        try {
            await expenseApi.deleteExpense(id);
            return id;
        } catch (error) {
            return rejectWithValue(getApiErrorMessage(error));
        }
    }
);

const expenseSlice = createSlice({
    name: 'expense',
    initialState: {
        expenses: [],
        pagination: { page: 1, limit: 10, total: 0 },
        filters: {},
        status: 'idle',
        error: null,
    },
    reducers: {
        clearExpenseError: (state) => {
            state.error = null;
        },
        setExpenseFilters: (state, action) => {
            state.filters = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchExpenses.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchExpenses.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.expenses = action.payload.data;
                state.pagination = {
                    page: action.payload.page,
                    limit: action.payload.limit,
                    total: action.payload.total,
                };
            })
            .addCase(fetchExpenses.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(createExpense.fulfilled, (state, action) => {
                state.expenses.unshift(action.payload);
                state.pagination.total += 1;
            })
            .addCase(updateExpense.fulfilled, (state, action) => {
                const index = state.expenses.findIndex(
                    (e) => e.expenseId === action.payload.expenseId
                );
                if (index !== -1) state.expenses[index] = action.payload;
            })
            .addCase(deleteExpense.fulfilled, (state, action) => {
                state.expenses = state.expenses.filter((e) => e.expenseId !== action.payload);
                state.pagination.total = Math.max(0, state.pagination.total - 1);
            });
    },
});

export const { clearExpenseError, setExpenseFilters } = expenseSlice.actions;
export default expenseSlice.reducer;
