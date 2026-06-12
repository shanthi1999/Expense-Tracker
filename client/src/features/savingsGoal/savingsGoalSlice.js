import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import savingsGoalApi from './savingsGoalApi.js';
import { getApiErrorMessage } from '../../lib/axios.js';

export const fetchSavingsGoals = createAsyncThunk(
    'savingsGoal/fetchSavingsGoals',
    async (params = {}, { rejectWithValue }) => {
        try {
            const { data } = await savingsGoalApi.getSavingsGoals(params);
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

export const createSavingsGoal = createAsyncThunk(
    'savingsGoal/createSavingsGoal',
    async (payload, { rejectWithValue }) => {
        try {
            const { data } = await savingsGoalApi.createSavingsGoal(payload);
            return data.data;
        } catch (error) {
            return rejectWithValue(getApiErrorMessage(error));
        }
    }
);

export const updateSavingsGoal = createAsyncThunk(
    'savingsGoal/updateSavingsGoal',
    async ({ id, payload }, { rejectWithValue }) => {
        try {
            const { data } = await savingsGoalApi.updateSavingsGoal(id, payload);
            return data.data;
        } catch (error) {
            return rejectWithValue(getApiErrorMessage(error));
        }
    }
);

export const contributeToGoal = createAsyncThunk(
    'savingsGoal/contributeToGoal',
    async ({ id, amount }, { rejectWithValue }) => {
        try {
            const { data } = await savingsGoalApi.contributeToGoal(id, amount);
            return data.data;
        } catch (error) {
            return rejectWithValue(getApiErrorMessage(error));
        }
    }
);

export const deleteSavingsGoal = createAsyncThunk(
    'savingsGoal/deleteSavingsGoal',
    async (id, { rejectWithValue }) => {
        try {
            await savingsGoalApi.deleteSavingsGoal(id);
            return id;
        } catch (error) {
            return rejectWithValue(getApiErrorMessage(error));
        }
    }
);

const savingsGoalSlice = createSlice({
    name: 'savingsGoal',
    initialState: {
        goals: [],
        pagination: { page: 1, limit: 10, total: 0 },
        status: 'idle',
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchSavingsGoals.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchSavingsGoals.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.goals = action.payload.data;
                state.pagination = {
                    page: action.payload.page,
                    limit: action.payload.limit,
                    total: action.payload.total,
                };
            })
            .addCase(fetchSavingsGoals.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(createSavingsGoal.fulfilled, (state, action) => {
                state.goals.unshift(action.payload);
                state.pagination.total += 1;
            })
            .addCase(updateSavingsGoal.fulfilled, (state, action) => {
                const index = state.goals.findIndex(
                    (g) => g.savingsGoalId === action.payload.savingsGoalId
                );
                if (index !== -1) state.goals[index] = action.payload;
            })
            .addCase(contributeToGoal.fulfilled, (state, action) => {
                const index = state.goals.findIndex(
                    (g) => g.savingsGoalId === action.payload.savingsGoalId
                );
                if (index !== -1) state.goals[index] = action.payload;
            })
            .addCase(deleteSavingsGoal.fulfilled, (state, action) => {
                state.goals = state.goals.filter((g) => g.savingsGoalId !== action.payload);
                state.pagination.total = Math.max(0, state.pagination.total - 1);
            });
    },
});

export default savingsGoalSlice.reducer;
