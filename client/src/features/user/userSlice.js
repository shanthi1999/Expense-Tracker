import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userApi from './userApi.js';
import { getApiErrorMessage } from '../../lib/axios.js';

export const fetchProfile = createAsyncThunk(
    'user/fetchProfile',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await userApi.getMe();
            return data.data;
        } catch (error) {
            return rejectWithValue(getApiErrorMessage(error));
        }
    }
);

export const updateProfile = createAsyncThunk(
    'user/updateProfile',
    async ({ id, payload }, { rejectWithValue }) => {
        try {
            const { data } = await userApi.updateUser(id, payload);
            return data.data;
        } catch (error) {
            return rejectWithValue(getApiErrorMessage(error));
        }
    }
);

const userSlice = createSlice({
    name: 'user',
    initialState: {
        profile: null,
        status: 'idle',
        error: null,
    },
    reducers: {
        clearUserError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProfile.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchProfile.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.profile = action.payload;
            })
            .addCase(fetchProfile.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(updateProfile.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.profile = action.payload;
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export const { clearUserError } = userSlice.actions;
export default userSlice.reducer;
