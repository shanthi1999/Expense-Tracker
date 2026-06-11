import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import aiApi from './aiApi.js';
import { getApiErrorMessage } from '../../lib/axios.js';

export const fetchAiSummary = createAsyncThunk(
    'ai/fetchAiSummary',
    async (params = {}, { rejectWithValue }) => {
        try {
            const { data } = await aiApi.getExpenseSummary(params);
            return {
                summary: data.summary,
                ...data.data,
            };
        } catch (error) {
            return rejectWithValue(getApiErrorMessage(error, 'Failed to generate AI summary'));
        }
    }
);

const aiSlice = createSlice({
    name: 'ai',
    initialState: {
        summary: null,
        totalSpent: null,
        highestCategory: null,
        categoryBreakdown: [],
        patterns: '',
        habits: '',
        insight: '',
        suggestion: '',
        status: 'idle',
        error: null,
        lastParams: null,
    },
    reducers: {
        clearAiSummary: (state) => {
            state.summary = null;
            state.totalSpent = null;
            state.highestCategory = null;
            state.categoryBreakdown = [];
            state.patterns = '';
            state.habits = '';
            state.insight = '';
            state.suggestion = '';
            state.error = null;
            state.status = 'idle';
            state.lastParams = null;
        },
        clearAiError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAiSummary.pending, (state, action) => {
                state.status = 'loading';
                state.error = null;
                state.lastParams = action.meta.arg;
            })
            .addCase(fetchAiSummary.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.summary = action.payload.summary;
                state.totalSpent = action.payload.totalSpent;
                state.highestCategory = action.payload.highestCategory;
                state.categoryBreakdown = action.payload.categoryBreakdown || [];
                state.patterns = action.payload.patterns || '';
                state.habits = action.payload.habits || '';
                state.insight = action.payload.insight || '';
                state.suggestion = action.payload.suggestion || '';
            })
            .addCase(fetchAiSummary.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export const { clearAiSummary, clearAiError } = aiSlice.actions;
export default aiSlice.reducer;
