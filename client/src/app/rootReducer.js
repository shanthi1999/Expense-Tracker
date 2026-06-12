import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice.js';
import userReducer from '../features/user/userSlice.js';
import categoryReducer from '../features/category/categorySlice.js';
import expenseTypeReducer from '../features/expenseType/expenseTypeSlice.js';
import expenseReducer from '../features/expense/expenseSlice.js';
import aiReducer from '../features/ai/aiSlice.js';
import scheduledExpenseReducer from '../features/scheduledExpense/scheduledExpenseSlice.js';
import notificationReducer from '../features/notification/notificationSlice.js';
import savingsGoalReducer from '../features/savingsGoal/savingsGoalSlice.js';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        user: userReducer,
        category: categoryReducer,
        expenseType: expenseTypeReducer,
        expense: expenseReducer,
        ai: aiReducer,
        scheduledExpense: scheduledExpenseReducer,
        notification: notificationReducer,
        savingsGoal: savingsGoalReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export default store;
