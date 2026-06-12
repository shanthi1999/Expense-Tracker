import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import scheduledExpenseApi from './scheduledExpenseApi.js';
import { getApiErrorMessage } from '../../lib/axios.js';

export const fetchScheduledExpenses = createAsyncThunk(
    'scheduledExpense/fetchScheduledExpenses',
    async (params = {}, { rejectWithValue }) => {
        try {
            const { data } = await scheduledExpenseApi.getScheduledExpenses(params);
            return {
                data: data.data,
                total: data.total,
                page: data.page,
                limit: data.limit,
            };
        } catch (error) {
            return rejectWithValue(getApiErrorMessage(error));
        }
    }
);

export const createScheduledExpense = createAsyncThunk(
    'scheduledExpense/createScheduledExpense',
    async (payload, { rejectWithValue }) => {
        try {
            const { data } = await scheduledExpenseApi.createScheduledExpense(payload);
            return data.data;
        } catch (error) {
            return rejectWithValue(getApiErrorMessage(error));
        }
    }
);

export const updateScheduledExpense = createAsyncThunk(
    'scheduledExpense/updateScheduledExpense',
    async ({ id, payload }, { rejectWithValue }) => {
        try {
            const { data } = await scheduledExpenseApi.updateScheduledExpense(id, payload);
            return data.data;
        } catch (error) {
            return rejectWithValue(getApiErrorMessage(error));
        }
    }
);

export const deleteScheduledExpense = createAsyncThunk(
    'scheduledExpense/deleteScheduledExpense',
    async (id, { rejectWithValue }) => {
        try {
            await scheduledExpenseApi.deleteScheduledExpense(id);
            return id;
        } catch (error) {
            return rejectWithValue(getApiErrorMessage(error));
        }
    }
);

const scheduledExpenseSlice = createSlice({
    name: 'scheduledExpense',
    initialState: {
        schedules: [],
        pagination: { page: 1, limit: 10, total: 0 },
        status: 'idle',
        error: null,
    },
    reducers: {
        clearScheduledExpenseError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchScheduledExpenses.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchScheduledExpenses.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.schedules = action.payload.data;
                state.pagination = {
                    page: action.payload.page,
                    limit: action.payload.limit,
                    total: action.payload.total,
                };
            })
            .addCase(fetchScheduledExpenses.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(createScheduledExpense.fulfilled, (state, action) => {
                state.schedules.unshift(action.payload);
                state.pagination.total += 1;
            })
            .addCase(updateScheduledExpense.fulfilled, (state, action) => {
                const index = state.schedules.findIndex(
                    (s) => s.scheduledExpenseId === action.payload.scheduledExpenseId
                );
                if (index !== -1) state.schedules[index] = action.payload;
            })
            .addCase(deleteScheduledExpense.fulfilled, (state, action) => {
                state.schedules = state.schedules.filter(
                    (s) => s.scheduledExpenseId !== action.payload
                );
                state.pagination.total = Math.max(0, state.pagination.total - 1);
            });
    },
});

export const { clearScheduledExpenseError } = scheduledExpenseSlice.actions;
export default scheduledExpenseSlice.reducer;
