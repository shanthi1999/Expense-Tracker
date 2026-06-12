import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import notificationApi from './notificationApi.js';
import { getApiErrorMessage } from '../../lib/axios.js';

export const fetchNotifications = createAsyncThunk(
    'notification/fetchNotifications',
    async (params = {}, { rejectWithValue }) => {
        try {
            const { data } = await notificationApi.getNotifications(params);
            return {
                data: data.data,
                total: data.total,
                unreadCount: data.unreadCount,
                page: data.page,
                limit: data.limit,
            };
        } catch (error) {
            return rejectWithValue(getApiErrorMessage(error));
        }
    }
);

export const markNotificationRead = createAsyncThunk(
    'notification/markNotificationRead',
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await notificationApi.markAsRead(id);
            return data.data;
        } catch (error) {
            return rejectWithValue(getApiErrorMessage(error));
        }
    }
);

export const markAllNotificationsRead = createAsyncThunk(
    'notification/markAllNotificationsRead',
    async (_, { rejectWithValue }) => {
        try {
            await notificationApi.markAllAsRead();
            return true;
        } catch (error) {
            return rejectWithValue(getApiErrorMessage(error));
        }
    }
);

const notificationSlice = createSlice({
    name: 'notification',
    initialState: {
        notifications: [],
        unreadCount: 0,
        pagination: { page: 1, limit: 20, total: 0 },
        status: 'idle',
        error: null,
        pushPermission: 'default',
    },
    reducers: {
        setPushPermission: (state, action) => {
            state.pushPermission = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.notifications = action.payload.data;
                state.unreadCount = action.payload.unreadCount;
                state.pagination = {
                    page: action.payload.page,
                    limit: action.payload.limit,
                    total: action.payload.total,
                };
            })
            .addCase(markNotificationRead.fulfilled, (state, action) => {
                const index = state.notifications.findIndex(
                    (n) => n.notificationId === action.payload.notificationId
                );
                if (index !== -1) {
                    state.notifications[index] = action.payload;
                }
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            })
            .addCase(markAllNotificationsRead.fulfilled, (state) => {
                state.notifications = state.notifications.map((n) => ({ ...n, isRead: true }));
                state.unreadCount = 0;
            });
    },
});

export const { setPushPermission } = notificationSlice.actions;
export default notificationSlice.reducer;
