import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authApi from './authApi.js';
import userApi from '../user/userApi.js';
import { getApiErrorMessage, getAccessToken, setAccessToken } from '../../lib/axios.js';

export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const { data } = await authApi.login(credentials);
            setAccessToken(data.data.accessToken);
            return data.data;
        } catch (error) {
            return rejectWithValue(getApiErrorMessage(error, 'Login failed'));
        }
    }
);

export const registerUser = createAsyncThunk(
    'auth/register',
    async (payload, { rejectWithValue }) => {
        try {
            const { data } = await authApi.register(payload);
            setAccessToken(data.data.accessToken);
            return data.data;
        } catch (error) {
            return rejectWithValue(getApiErrorMessage(error, 'Registration failed'));
        }
    }
);

export const fetchCurrentUser = createAsyncThunk(
    'auth/fetchCurrentUser',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await userApi.getMe();
            return data.data;
        } catch (error) {
            return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch user'));
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await authApi.logout();
            setAccessToken(null);
            return null;
        } catch (error) {
            setAccessToken(null);
            return rejectWithValue(getApiErrorMessage(error, 'Logout failed'));
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        accessToken: getAccessToken(),
        isAuthenticated: !!getAccessToken(),
        status: 'idle',
        error: null,
    },
    reducers: {
        clearAuthError: (state) => {
            state.error = null;
        },
        resetAuth: (state) => {
            state.user = null;
            state.accessToken = null;
            state.isAuthenticated = false;
            state.status = 'idle';
            state.error = null;
            setAccessToken(null);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.user = action.payload.user;
                state.accessToken = action.payload.accessToken;
                state.isAuthenticated = true;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
                state.isAuthenticated = false;
            })
            .addCase(registerUser.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.user = action.payload.user;
                state.accessToken = action.payload.accessToken;
                state.isAuthenticated = true;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(fetchCurrentUser.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(fetchCurrentUser.rejected, (state) => {
                state.status = 'failed';
                state.user = null;
                state.isAuthenticated = false;
                state.accessToken = null;
                setAccessToken(null);
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.accessToken = null;
                state.isAuthenticated = false;
                state.status = 'idle';
                state.error = null;
            });
    },
});

export const { clearAuthError, resetAuth } = authSlice.actions;
export default authSlice.reducer;
