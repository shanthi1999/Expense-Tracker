import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Receipt, FolderOpen, Tags, TrendingDown, Wallet, ArrowRight, Bot } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
import { fetchExpenses } from '@/features/expense/expenseSlice';
import { fetchCategories } from '@/features/category/categorySlice';
import { fetchExpenseTypes } from '@/features/expenseType/expenseTypeSlice';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { AiSummaryPanel, AiSummaryTriggerCard } from '@/components/common/AiSummaryPanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatBudgetUsageLabel, getOverBudgetExpenseIds } from '@/lib/budget';

export default function DashboardPage() {
    const dispatch = useAppDispatch();
    const [aiPanelOpen, setAiPanelOpen] = useState(false);
    const user = useAppSelector((state) => state.auth.user);
    const { expenses, pagination, status } = useAppSelector((state) => state.expense);
    const { pagination: catPagination } = useAppSelector((state) => state.category);
    const { pagination: typePagination } = useAppSelector((state) => state.expenseType);

    useEffect(() => {
        dispatch(fetchExpenses({ page: 1, limit: 5, sortBy: 'date', order: 'DESC' }));
        dispatch(fetchCategories({ page: 1, limit: 1 }));
        dispatch(fetchExpenseTypes({ page: 1, limit: 1 }));
    }, [dispatch]);

    const formatCurrency = (amount) =>
        new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: user?.currency || 'USD',
        }).format(amount);

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const budget = user?.budget;
    const budgetUsageLabel = formatBudgetUsageLabel(totalSpent, budget);
    const overBudgetExpenseIds = getOverBudgetExpenseIds(expenses, budget);
    const isOverBudget = budget != null && budget > 0 && totalSpent > budget;

    const stats = [
        {
            title: 'Recent Expenses',
            value: pagination.total,
            icon: Receipt,
            description: 'Total recorded',
            link: '/expenses',
        },
        {
            title: 'Categories',
            value: catPagination.total,
            icon: FolderOpen,
            description: 'Active categories',
            link: '/categories',
        },
        {
            title: 'Expense Types',
            value: typePagination.total,
            icon: Tags,
            description: 'Defined types',
            link: '/expense-types',
        },
        {
            title: 'Monthly Budget',
            value: budget != null ? formatCurrency(budget) : '—',
            icon: Wallet,
            description: budgetUsageLabel,
            link: '/profile',
            isWarning: isOverBudget,
        },
    ];

    return (
        <div>
            <PageHeader
                title={`Welcome, ${user?.firstName || 'User'}`}
                description="Here's an overview of your expense tracking"
                action={
                    <Button variant="outline" size="sm" onClick={() => setAiPanelOpen(true)}>
                        <Bot className="mr-2 h-4 w-4" />
                        AI Summary
                    </Button>
                }
            />

            <div className="mb-8 grid gap-6 lg:grid-cols-3">
                <div className="space-y-8 lg:col-span-2">
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title} className="transition-shadow hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p
                                className={cn(
                                    'text-xs text-muted-foreground',
                                    stat.isWarning && 'font-medium text-destructive'
                                )}
                            >
                                {stat.description}
                            </p>
                            <Link to={stat.link}>
                                <Button variant="link" className="mt-2 h-auto p-0 text-xs">
                                    View <ArrowRight className="ml-1 h-3 w-3" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ))}
                    </div>

                    <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingDown className="h-5 w-5" />
                                Recent Expenses
                            </CardTitle>
                            <CardDescription>Your latest transactions</CardDescription>
                        </div>
                        <Link to="/expenses">
                            <Button variant="outline" size="sm">
                                View all
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    {status === 'loading' ? (
                        <LoadingSpinner label="Loading expenses..." />
                    ) : expenses.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground">
                            <p>No expenses yet.</p>
                            <Link to="/expenses">
                                <Button className="mt-4">Add your first expense</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {expenses.map((exp) => {
                                const exceedsBudget = overBudgetExpenseIds.has(exp.expenseId);

                                return (
                                <div
                                    key={exp.expenseId}
                                    className={cn(
                                        'flex items-center justify-between rounded-lg border p-4 transition-shadow',
                                        exceedsBudget
                                            ? 'border-destructive/30 bg-destructive/5 shadow-md ring-1 ring-destructive/15'
                                            : 'bg-card'
                                    )}
                                >
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium">{exp.title}</p>
                                            {exceedsBudget && (
                                                <Badge variant="destructive" className="text-[10px]">
                                                    Over budget
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {format(new Date(exp.date), 'MMM d, yyyy')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p
                                            className={cn(
                                                'font-semibold',
                                                exceedsBudget && 'text-destructive'
                                            )}
                                        >
                                            {formatCurrency(exp.amount)}
                                        </p>
                                        {exp.paymentMethod && (
                                            <Badge variant="secondary" className="mt-1">
                                                {exp.paymentMethod}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1">
                    <div className="lg:sticky lg:top-6">
                        <AiSummaryTriggerCard onOpen={() => setAiPanelOpen(true)} />
                    </div>
                </div>
            </div>

            <AiSummaryPanel open={aiPanelOpen} onClose={() => setAiPanelOpen(false)} />
        </div>
    );
}
