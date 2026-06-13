import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Pencil, Trash2, CalendarClock, Play } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { scheduledExpenseSchema } from '@/schemas/scheduledExpense.schema';
import { PAYMENT_METHODS } from '@/schemas/expense.schema';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
import {
    fetchScheduledExpenses,
    createScheduledExpense,
    updateScheduledExpense,
    deleteScheduledExpense,
} from '@/features/scheduledExpense/scheduledExpenseSlice';
import { fetchNotifications } from '@/features/notification/notificationSlice';
import scheduledExpenseApi from '@/features/scheduledExpense/scheduledExpenseApi';
import { getApiErrorMessage } from '@/lib/axios';
import { fetchCategories } from '@/features/category/categorySlice';
import { fetchExpenseTypes } from '@/features/expenseType/expenseTypeSlice';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Pagination } from '@/components/common/Pagination';
import { getTotalPages } from '@/lib/pagination';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export default function ScheduledExpensesPage() {
    const dispatch = useAppDispatch();
    const { schedules, pagination, status } = useAppSelector((state) => state.scheduledExpense);
    const { categories } = useAppSelector((state) => state.category);
    const { expenseTypes } = useAppSelector((state) => state.expenseType);
    const user = useAppSelector((state) => state.auth.user);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [processLoading, setProcessLoading] = useState(false);

    const form = useForm({
        resolver: zodResolver(scheduledExpenseSchema),
        defaultValues: {
            title: '',
            amount: 0,
            categoryId: '',
            expenseTypeId: '',
            description: '',
            paymentMethod: '',
            frequency: 'MONTHLY',
            dayOfMonth: 1,
            startDate: format(new Date(), 'yyyy-MM-dd'),
            endDate: '',
        },
    });

    const loadSchedules = (page = pagination.page, limit = pagination.limit) => {
        dispatch(fetchScheduledExpenses({ page, limit, sortBy: 'nextRunAt', order: 'ASC' }));
    };

    useEffect(() => {
        dispatch(fetchCategories({ limit: 100 }));
        dispatch(fetchExpenseTypes({ limit: 100 }));
        loadSchedules(1);
    }, [dispatch]);

    const formatCurrency = (amount) =>
        new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: user?.currency || 'USD',
        }).format(amount);

    const getCategory = (id) => categories.find((c) => c.categoryId === id);
    const getExpenseType = (id) => expenseTypes.find((e) => e.expenseTypeId === id);

    const openCreate = () => {
        setEditing(null);
        form.reset({
            title: '',
            amount: 0,
            categoryId: '',
            expenseTypeId: '',
            description: '',
            paymentMethod: '',
            frequency: 'MONTHLY',
            dayOfMonth: 1,
            startDate: format(new Date(), 'yyyy-MM-dd'),
            endDate: '',
        });
        setDialogOpen(true);
    };

    const openEdit = (schedule) => {
        setEditing(schedule);
        form.reset({
            title: schedule.title,
            amount: schedule.amount,
            categoryId: schedule.categoryId,
            expenseTypeId: schedule.expenseTypeId,
            description: schedule.description || '',
            paymentMethod: schedule.paymentMethod || '',
            frequency: schedule.frequency || 'MONTHLY',
            dayOfMonth: schedule.dayOfMonth,
            startDate: format(new Date(schedule.startDate), 'yyyy-MM-dd'),
            endDate: schedule.endDate ? format(new Date(schedule.endDate), 'yyyy-MM-dd') : '',
        });
        setDialogOpen(true);
    };

    const onSubmit = async (data) => {
        const payload = {
            ...data,
            description: data.description || undefined,
            paymentMethod: data.paymentMethod || undefined,
            endDate: data.endDate || undefined,
        };

        const result = editing
            ? await dispatch(
                  updateScheduledExpense({
                      id: editing.scheduledExpenseId,
                      payload,
                  })
              )
            : await dispatch(createScheduledExpense(payload));

        if (result.meta.requestStatus === 'fulfilled') {
            toast.success(editing ? 'Schedule updated' : 'Schedule created');
            setDialogOpen(false);
            loadSchedules();
            dispatch(fetchNotifications({ page: 1, limit: 20 }));
        } else {
            toast.error(result.payload || 'Operation failed');
        }
    };

    const toggleActive = async (schedule) => {
        const result = await dispatch(
            updateScheduledExpense({
                id: schedule.scheduledExpenseId,
                payload: { isActive: !schedule.isActive },
            })
        );

        if (result.meta.requestStatus === 'fulfilled') {
            toast.success(schedule.isActive ? 'Schedule paused' : 'Schedule activated');
            loadSchedules();
        } else {
            toast.error(result.payload || 'Update failed');
        }
    };

    const handleProcessNow = async () => {
        setProcessLoading(true);
        try {
            await scheduledExpenseApi.processSchedules();
            toast.success('Due schedules processed. Check notifications and expenses.');
            loadSchedules();
            dispatch(fetchNotifications({ page: 1, limit: 20 }));
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Processing failed'));
        } finally {
            setProcessLoading(false);
        }
    };

    const handleDelete = async () => {
        setDeleteLoading(true);
        const result = await dispatch(deleteScheduledExpense(deleteId));
        setDeleteLoading(false);
        if (result.meta.requestStatus === 'fulfilled') {
            toast.success('Schedule deleted');
            setDeleteId(null);
            loadSchedules();
        } else {
            toast.error(result.payload || 'Delete failed');
        }
    };

    const totalPages = getTotalPages(pagination.total, pagination.limit);

    return (
        <div>
            <PageHeader
                title="Scheduled Expenses"
                description="Set up monthly recurring expenses and receive reminders"
                action={
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={handleProcessNow}
                            disabled={processLoading}
                        >
                            <Play className="mr-2 h-4 w-4" />
                            {processLoading ? 'Processing…' : 'Run due now'}
                        </Button>
                        <Button onClick={openCreate}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Schedule
                        </Button>
                    </div>
                }
            />

            {status === 'loading' && schedules.length === 0 ? (
                <LoadingSpinner />
            ) : schedules.length === 0 ? (
                <div className="rounded-lg border py-16 text-center">
                    <CalendarClock className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">No scheduled expenses yet.</p>
                    <Button className="mt-4" onClick={openCreate}>
                        Create your first schedule
                    </Button>
                </div>
            ) : (
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead className="hidden md:table-cell">Category</TableHead>
                                <TableHead>Day</TableHead>
                                <TableHead className="hidden lg:table-cell">Next run</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {schedules.map((schedule) => (
                                <TableRow key={schedule.scheduledExpenseId}>
                                    <TableCell className="font-medium">{schedule.title}</TableCell>
                                    <TableCell>{formatCurrency(schedule.amount)}</TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        {getCategory(schedule.categoryId)?.title || '—'}
                                    </TableCell>
                                    <TableCell>{schedule.dayOfMonth}</TableCell>
                                    <TableCell className="hidden lg:table-cell">
                                        {format(new Date(schedule.nextRunAt), 'MMM d, yyyy')}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={schedule.isActive ? 'default' : 'secondary'}
                                            className="cursor-pointer"
                                            onClick={() => toggleActive(schedule)}
                                        >
                                            {schedule.isActive ? 'Active' : 'Paused'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openEdit(schedule)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    setDeleteId(schedule.scheduledExpenseId)
                                                }
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {totalPages > 1 && (
                <Pagination
                    page={pagination.page}
                    totalPages={totalPages}
                    onPageChange={(page) => loadSchedules(page)}
                />
            )}

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {editing ? 'Edit scheduled expense' : 'New scheduled expense'}
                        </DialogTitle>
                        <DialogDescription>
                            Expenses will be created automatically each month on the selected day.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" {...form.register('title')} />
                            {form.formState.errors.title && (
                                <p className="text-sm text-destructive">
                                    {form.formState.errors.title.message}
                                </p>
                            )}
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="amount">Amount</Label>
                                <Input id="amount" type="number" step="0.01" {...form.register('amount')} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dayOfMonth">Day of month</Label>
                                <Input
                                    id="dayOfMonth"
                                    type="number"
                                    min={1}
                                    max={31}
                                    {...form.register('dayOfMonth')}
                                />
                            </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select
                                    value={form.watch('categoryId')}
                                    onValueChange={(v) => form.setValue('categoryId', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((c) => (
                                            <SelectItem key={c.categoryId} value={c.categoryId}>
                                                {c.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Expense type</Label>
                                <Select
                                    value={form.watch('expenseTypeId')}
                                    onValueChange={(v) => form.setValue('expenseTypeId', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {expenseTypes.map((t) => (
                                            <SelectItem key={t.expenseTypeId} value={t.expenseTypeId}>
                                                {t.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="startDate">Start date</Label>
                                <Input id="startDate" type="date" {...form.register('startDate')} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endDate">End date (optional)</Label>
                                <Input id="endDate" type="date" {...form.register('endDate')} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Payment method</Label>
                            <Select
                                value={form.watch('paymentMethod') || ''}
                                onValueChange={(v) => form.setValue('paymentMethod', v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Optional" />
                                </SelectTrigger>
                                <SelectContent>
                                    {PAYMENT_METHODS.map((m) => (
                                        <SelectItem key={m} value={m}>
                                            {m}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" {...form.register('description')} />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">{editing ? 'Save changes' : 'Create schedule'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={() => setDeleteId(null)}
                title="Delete schedule?"
                description="This will stop future automatic expense creation for this schedule."
                onConfirm={handleDelete}
                loading={deleteLoading}
            />
        </div>
    );
}
