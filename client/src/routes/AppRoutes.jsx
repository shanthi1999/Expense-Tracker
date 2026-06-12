import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute, GuestRoute } from '@/routes/ProtectedRoute';
import { useAuthInit } from '@/hooks/useAuth';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import CategoriesPage from '@/pages/categories/CategoriesPage';
import ExpenseTypesPage from '@/pages/expenseTypes/ExpenseTypesPage';
import ExpensesPage from '@/pages/expenses/ExpensesPage';
import ScheduledExpensesPage from '@/pages/scheduledExpenses/ScheduledExpensesPage';
import SavingsGoalsPage from '@/pages/savingsGoals/SavingsGoalsPage';
import ProfilePage from '@/pages/profile/ProfilePage';

function AppRoutes() {
    useAuthInit();

    return (
        <Routes>
            <Route element={<GuestRoute />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/expenses" element={<ExpensesPage />} />
                    <Route path="/scheduled-expenses" element={<ScheduledExpensesPage />} />
                    <Route path="/savings-goals" element={<SavingsGoalsPage />} />
                    <Route path="/categories" element={<CategoriesPage />} />
                    <Route path="/expense-types" element={<ExpenseTypesPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                </Route>
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}

export default function AppRoutesWrapper() {
    return (
        <ErrorBoundary>
            <BrowserRouter>
                <AppRoutes />
                <Toaster richColors position="top-right" closeButton />
            </BrowserRouter>
        </ErrorBoundary>
    );
}
