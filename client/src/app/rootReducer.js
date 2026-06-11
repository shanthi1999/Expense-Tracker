import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice.js';
import userReducer from '../features/user/userSlice.js';
import categoryReducer from '../features/category/categorySlice.js';
import expenseTypeReducer from '../features/expenseType/expenseTypeSlice.js';
import expenseReducer from '../features/expense/expenseSlice.js';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        user: userReducer,
        category: categoryReducer,
        expenseType: expenseTypeReducer,
        expense: expenseReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export default store;
