import express from 'express';
import authRoutes from './user/auth.route.js';
import userRoutes from './user/user.route.js';
import expenseRoutes from './expense/expense.route.js';
import categoryRoutes from './expense/category.route.js';
import expenseTypeRoutes from './expense/expenseType.route.js';
import scheduledExpenseRoutes from './expense/scheduledExpense.route.js';
import notificationRoutes from './notification/notification.route.js';
import authenticate from '../middlewares/authenticate.js';

const routes = express.Router();

routes.use('/auth', authRoutes);
routes.use('/user', authenticate, userRoutes);
routes.use('/expense', authenticate, expenseRoutes);
routes.use('/category', authenticate, categoryRoutes);
routes.use('/expenseType', authenticate, expenseTypeRoutes);
routes.use('/scheduledExpense', authenticate, scheduledExpenseRoutes);
routes.use('/notification', authenticate, notificationRoutes);

export default routes;
