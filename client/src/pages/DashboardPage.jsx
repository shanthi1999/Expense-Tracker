import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
    Receipt,
    FolderOpen,
    Tags,
    TrendingDown,
    Wallet,
    ArrowRight,
    Bot,
    CalendarClock,
    PiggyBank,
} from 'lucide-react';
import { fetchSavingsGoals } from '@/features/savingsGoal/savingsGoalSlice';
import { SavingsGoalCard } from '@/components/common/SavingsGoalCard';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
import { fetchExpenses } from '@/features/expense/expenseSlice';
import { fetchScheduledExpenses } from '@/features/scheduledExpense/scheduledExpenseSlice';
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

function StatCard({ title, value, icon: Icon, description, link, isWarning }) {
    return (
        <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
                <div className="text-2xl font-bold leading-none">{value}</div>
                <p
                    className={cn(
                        'mt-2 line-clamp-2 min-h-[2.5rem] text-xs leading-relaxed text-muted-foreground',
                        isWarning && 'font-medium text-destructive'
                    )}
                >
                    {description}
                </p>
                <Link to={link} className="mt-auto pt-3">
                    <Button variant="link" className="h-auto p-0 text-xs">
                        View <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}

function ListRow({ left, right, className }) {
    return (
        <div
            className={cn(
                'flex items-center justify-between gap-4 rounded-lg border p-4 transition-shadow',
                className
            )}
        >
            <div className="min-w-0 flex-1">{left}</div>
            <div className="flex shrink-0 flex-col items-end gap-1 text-right">{right}</div>
        </div>
    );
}

export default function DashboardPage() {
    const dispatch = useAppDispatch();
    const [aiPanelOpen, setAiPanelOpen] = useState(false);
    const user = useAppSelector((state) => state.auth.user);
    const { expenses, pagination, status } = useAppSelector((state) => state.expense);
    const { schedules, pagination: schedulePagination } = useAppSelector(
        (state) => state.scheduledExpense
    );
    const { pagination: catPagination } = useAppSelector((state) => state.category);
    const { pagination: typePagination } = useAppSelector((state) => state.expenseType);
    const { goals: savingsGoals, pagination: savingsPagination } = useAppSelector(
        (state) => state.savingsGoal
    );

    useEffect(() => {
        dispatch(fetchExpenses({ page: 1, limit: 5, sortBy: 'date', order: 'DESC' }));
        dispatch(
            fetchScheduledExpenses({
                page: 1,
                limit: 5,
                isActive: true,
                sortBy: 'nextRunAt',
                order: 'ASC',
            })
        );
        dispatch(fetchCategories({ page: 1, limit: 1 }));
        dispatch(fetchExpenseTypes({ page: 1, limit: 1 }));
        dispatch(fetchSavingsGoals({ page: 1, limit: 3, activeOnly: true }));
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
            title: 'Scheduled',
            value: schedulePagination.total,
            icon: CalendarClock,
            description: 'Monthly schedules',
            link: '/scheduled-expenses',
        },
        {
            title: 'Savings Goals',
            value: savingsPagination.total,
            icon: PiggyBank,
            description: 'Active goals',
            link: '/savings-goals',
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

            <div className="mb-8 grid auto-rows-fr grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
                {stats.map((stat) => (
                    <StatCard key={stat.title} {...stat} />
                ))}
            </div>

            <div className="grid items-start gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between gap-4">
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
                                            <ListRow
                                                key={exp.expenseId}
                                                className={
                                                    exceedsBudget
                                                        ? 'border-destructive/30 bg-destructive/5 shadow-md ring-1 ring-destructive/15'
                                                        : 'bg-card'
                                                }
                                                left={
                                                    <>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <p className="truncate font-medium">
                                                                {exp.title}
                                                            </p>
                                                            {exceedsBudget && (
                                                                <Badge
                                                                    variant="destructive"
                                                                    className="text-[10px]"
                                                                >
                                                                    Over budget
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="mt-1 text-sm text-muted-foreground">
                                                            {format(new Date(exp.date), 'MMM d, yyyy')}
                                                        </p>
                                                    </>
                                                }
                                                right={
                                                    <>
                                                        <p
                                                            className={cn(
                                                                'font-semibold tabular-nums',
                                                                exceedsBudget && 'text-destructive'
                                                            )}
                                                        >
                                                            {formatCurrency(exp.amount)}
                                                        </p>
                                                        {exp.paymentMethod && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                {exp.paymentMethod}
                                                            </Badge>
                                                        )}
                                                    </>
                                                }
                                            />
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <CalendarClock className="h-5 w-5" />
                                        Upcoming Scheduled Expenses
                                    </CardTitle>
                                    <CardDescription>
                                        Monthly recurring expenses due soon
                                    </CardDescription>
                                </div>
                                <Link to="/scheduled-expenses">
                                    <Button variant="outline" size="sm">
                                        Manage
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {schedules.length === 0 ? (
                                <div className="py-6 text-center text-muted-foreground">
                                    <p>No active schedules.</p>
                                    <Link to="/scheduled-expenses">
                                        <Button className="mt-3" variant="outline" size="sm">
                                            Create a schedule
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {schedules.map((schedule) => (
                                        <ListRow
                                            key={schedule.scheduledExpenseId}
                                            className="bg-card"
                                            left={
                                                <>
                                                    <p className="truncate font-medium">
                                                        {schedule.title}
                                                    </p>
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        Day {schedule.dayOfMonth} · Next:{' '}
                                                        {format(
                                                            new Date(schedule.nextRunAt),
                                                            'MMM d, yyyy'
                                                        )}
                                                    </p>
                                                </>
                                            }
                                            right={
                                                <p className="font-semibold tabular-nums">
                                                    {formatCurrency(schedule.amount)}
                                                </p>
                                            }
                                        />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <PiggyBank className="h-5 w-5" />
                                        Savings Goals
                                    </CardTitle>
                                    <CardDescription>Track progress toward your targets</CardDescription>
                                </div>
                                <Link to="/savings-goals">
                                    <Button variant="outline" size="sm">
                                        Manage
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {savingsGoals.length === 0 ? (
                                <div className="py-6 text-center text-muted-foreground">
                                    <p>No active savings goals.</p>
                                    <Link to="/savings-goals">
                                        <Button className="mt-3" variant="outline" size="sm">
                                            Create a goal
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {savingsGoals.map((goal) => (
                                        <SavingsGoalCard
                                            key={goal.savingsGoalId}
                                            goal={goal}
                                            formatCurrency={formatCurrency}
                                            compact
                                        />
                                    ))}
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
