import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { expenseSchema, PAYMENT_METHODS } from '@/schemas/expense.schema';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
import {
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
} from '@/features/expense/expenseSlice';
import { fetchCategories } from '@/features/category/categorySlice';
import { fetchExpenseTypes } from '@/features/expenseType/expenseTypeSlice';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Pagination } from '@/components/common/Pagination';
import { getTotalPages } from '@/lib/pagination';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ExportReportsMenu } from '@/components/common/ExportReportsMenu';
import { ColorChip } from '@/components/common/ColorChip';
import { SortableTableHead } from '@/components/common/SortableTableHead';
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

export default function ExpensesPage() {
    const dispatch = useAppDispatch();
    const { expenses, pagination, status } = useAppSelector((state) => state.expense);
    const { categories } = useAppSelector((state) => state.category);
    const { expenseTypes } = useAppSelector((state) => state.expenseType);
    const user = useAppSelector((state) => state.auth.user);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [filters, setFilters] = useState({
        categoryId: '',
        expenseTypeId: '',
        dateFrom: '',
        dateTo: '',
    });
    const [sort, setSort] = useState({ sortBy: 'date', order: 'DESC' });
    const [isApplyingFilters, setIsApplyingFilters] = useState(false);

    const form = useForm({
        resolver: zodResolver(expenseSchema),
        defaultValues: {
            title: '',
            amount: 0,
            categoryId: '',
            expenseTypeId: '',
            date: format(new Date(), 'yyyy-MM-dd'),
            description: '',
            paymentMethod: '',
        },
    });

    const loadExpenses = useCallback(
        (page = pagination.page, sortState = sort, filterState = filters, limit = pagination.limit) => {
            dispatch(
                fetchExpenses({
                    page,
                    limit,
                    categoryId: filterState.categoryId || undefined,
                    expenseTypeId: filterState.expenseTypeId || undefined,
                    dateFrom: filterState.dateFrom || undefined,
                    dateTo: filterState.dateTo || undefined,
                    sortBy: sortState.sortBy,
                    order: sortState.order,
                })
            );
        },
        [dispatch, pagination.limit, pagination.page, sort, filters]
    );

    useEffect(() => {
        dispatch(fetchCategories({ limit: 100 }));
        dispatch(fetchExpenseTypes({ limit: 100 }));
        loadExpenses(1);
    }, [dispatch]);

    useEffect(() => {
        if (status !== 'loading') {
            setIsApplyingFilters(false);
        }
    }, [status]);

    const getCategory = (id) => categories.find((c) => c.categoryId === id);
    const getExpenseType = (id) => expenseTypes.find((e) => e.expenseTypeId === id);

    const handleSort = (column) => {
        const nextSort =
            sort.sortBy !== column
                ? { sortBy: column, order: 'DESC' }
                : { sortBy: column, order: sort.order === 'DESC' ? 'ASC' : 'DESC' };
        setSort(nextSort);
        loadExpenses(1, nextSort, filters);
    };

    const applyFilters = () => {
        setIsApplyingFilters(true);
        loadExpenses(1, sort, filters);
    };

    const clearFilters = () => {
        const cleared = { categoryId: '', expenseTypeId: '', dateFrom: '', dateTo: '' };
        setFilters(cleared);
        setIsApplyingFilters(true);
        loadExpenses(1, sort, cleared);
    };

    const filterLoading = isApplyingFilters && status === 'loading';

    const hasActiveFilters =
        filters.categoryId || filters.expenseTypeId || filters.dateFrom || filters.dateTo;

    const formatCurrency = (amount) =>
        new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: user?.currency || 'USD',
        }).format(amount);

    const openCreate = () => {
        setEditing(null);
        form.reset({
            title: '',
            amount: 0,
            categoryId: categories[0]?.categoryId || '',
            expenseTypeId: expenseTypes[0]?.expenseTypeId || '',
            date: format(new Date(), 'yyyy-MM-dd'),
            description: '',
            paymentMethod: '',
        });
        setDialogOpen(true);
    };

    const openEdit = (expense) => {
        setEditing(expense);
        form.reset({
            title: expense.title,
            amount: expense.amount,
            categoryId: expense.categoryId,
            expenseTypeId: expense.expenseTypeId,
            date: format(new Date(expense.date), 'yyyy-MM-dd'),
            description: expense.description || '',
            paymentMethod: expense.paymentMethod || '',
        });
        setDialogOpen(true);
    };

    const onSubmit = async (data) => {
        const payload = {
            ...data,
            amount: Number(data.amount),
            description: data.description || undefined,
            paymentMethod: data.paymentMethod || undefined,
        };

        const result = editing
            ? await dispatch(updateExpense({ id: editing.expenseId, payload }))
            : await dispatch(createExpense(payload));

        if (result.meta.requestStatus === 'fulfilled') {
            toast.success(editing ? 'Expense updated' : 'Expense created');
            setDialogOpen(false);
            loadExpenses();
        } else {
            toast.error(result.payload || 'Operation failed');
        }
    };

    const handleDelete = async () => {
        setDeleteLoading(true);
        const result = await dispatch(deleteExpense(deleteId));
        setDeleteLoading(false);
        if (result.meta.requestStatus === 'fulfilled') {
            toast.success('Expense deleted');
            setDeleteId(null);
            loadExpenses();
        } else {
            toast.error(result.payload || 'Delete failed');
        }
    };

    const totalPages = getTotalPages(pagination.total, pagination.limit);

    return (
        <div>
            <PageHeader
                title="Expenses"
                description="Track and manage your spending"
                action={
                    <div className="flex flex-wrap items-center gap-2">
                        <ExportReportsMenu filters={filters} sort={sort} />
                        <Button onClick={openCreate} disabled={!categories.length || !expenseTypes.length}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Expense
                        </Button>
                    </div>
                }
            />

            {(!categories.length || !expenseTypes.length) && (
                <p className="mb-4 text-sm text-muted-foreground">
                    Create at least one category and expense type before adding expenses.
                </p>
            )}

            <div className="mb-4 rounded-lg border bg-card p-4">
                <p className="mb-3 text-sm font-medium">Filters</p>
                <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-xs text-muted-foreground">Category</Label>
                        <Select
                            value={filters.categoryId || 'all'}
                            onValueChange={(v) =>
                                setFilters((f) => ({ ...f, categoryId: v === 'all' ? '' : v }))
                            }
                        >
                            <SelectTrigger className="h-10 w-full">
                                <SelectValue placeholder="All categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All categories</SelectItem>
                                {categories.map((c) => (
                                    <SelectItem key={c.categoryId} value={c.categoryId}>
                                        <span className="flex items-center gap-2">
                                            <ColorChip label={c.title} color={c.categoryColorCode} />
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-xs text-muted-foreground">Type</Label>
                        <Select
                            value={filters.expenseTypeId || 'all'}
                            onValueChange={(v) =>
                                setFilters((f) => ({ ...f, expenseTypeId: v === 'all' ? '' : v }))
                            }
                        >
                            <SelectTrigger className="h-10 w-full">
                                <SelectValue placeholder="All types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All types</SelectItem>
                                {expenseTypes.map((e) => (
                                    <SelectItem key={e.expenseTypeId} value={e.expenseTypeId}>
                                        <span className="flex items-center gap-2">
                                            <ColorChip label={e.title} color={e.categoryColorCode} />
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="dateFrom" className="text-xs text-muted-foreground">
                            From
                        </Label>
                        <Input
                            id="dateFrom"
                            type="date"
                            value={filters.dateFrom}
                            onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
                            className="h-10 w-full"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="dateTo" className="text-xs text-muted-foreground">
                            To
                        </Label>
                        <Input
                            id="dateTo"
                            type="date"
                            value={filters.dateTo}
                            min={filters.dateFrom || undefined}
                            onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
                            className="h-10 w-full"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-1">
                        <Label className="text-xs text-muted-foreground">Apply</Label>
                        <div className="flex gap-2">
                            <Button
                                variant="default"
                                className="h-10 flex-1 disabled:opacity-100 lg:flex-none"
                                onClick={applyFilters}
                                disabled={filterLoading}
                            >
                                {filterLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Applying...
                                    </>
                                ) : (
                                    'Apply Filters'
                                )}
                            </Button>
                            {hasActiveFilters && (
                                <Button
                                    variant="outline"
                                    className="h-10 flex-1 lg:flex-none"
                                    onClick={clearFilters}
                                    disabled={filterLoading}
                                >
                                    <X className="mr-1 h-4 w-4" />
                                    Clear
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {status === 'loading' && expenses.length === 0 ? (
                <LoadingSpinner />
            ) : (
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <SortableTableHead
                                    label="Amount"
                                    sortKey="amount"
                                    activeSort={sort.sortBy}
                                    activeOrder={sort.order}
                                    onSort={handleSort}
                                />
                                <SortableTableHead
                                    label="Date"
                                    sortKey="date"
                                    activeSort={sort.sortBy}
                                    activeOrder={sort.order}
                                    onSort={handleSort}
                                    className="hidden sm:table-cell"
                                />
                                <TableHead className="hidden md:table-cell">Category</TableHead>
                                <TableHead className="hidden lg:table-cell">Type</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {expenses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                                        No expenses found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                expenses.map((exp) => {
                                    const category = getCategory(exp.categoryId);
                                    const expenseType = getExpenseType(exp.expenseTypeId);

                                    return (
                                    <TableRow key={exp.expenseId}>
                                        <TableCell>
                                            <div className="space-y-1.5">
                                                <p className="font-medium">{exp.title}</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {exp.paymentMethod && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            {exp.paymentMethod}
                                                        </Badge>
                                                    )}
                                                    <span className="md:hidden">
                                                        {category && (
                                                            <ColorChip
                                                                label={category.title}
                                                                color={category.categoryColorCode}
                                                            />
                                                        )}
                                                    </span>
                                                    <span className="lg:hidden">
                                                        {expenseType && (
                                                            <ColorChip
                                                                label={expenseType.title}
                                                                color={expenseType.categoryColorCode}
                                                            />
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-semibold">{formatCurrency(exp.amount)}</TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            {format(new Date(exp.date), 'MMM d, yyyy')}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            {category ? (
                                                <ColorChip
                                                    label={category.title}
                                                    color={category.categoryColorCode}
                                                />
                                            ) : (
                                                '—'
                                            )}
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell">
                                            {expenseType ? (
                                                <ColorChip
                                                    label={expenseType.title}
                                                    color={expenseType.categoryColorCode}
                                                />
                                            ) : (
                                                '—'
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" onClick={() => openEdit(exp)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => setDeleteId(exp.expenseId)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}

            <Pagination
                page={pagination.page}
                totalPages={totalPages}
                total={pagination.total}
                limit={pagination.limit}
                onPageChange={(p) => loadExpenses(p)}
                onPageSizeChange={(limit) => loadExpenses(1, sort, filters, limit)}
            />

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit Expense' : 'New Expense'}</DialogTitle>
                        <DialogDescription>Record a new expense transaction</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" {...form.register('title')} />
                            {form.formState.errors.title && (
                                <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
                            )}
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="amount">Amount</Label>
                                <Input id="amount" type="number" min="0" step="0.01" {...form.register('amount')} />
                                {form.formState.errors.amount && (
                                    <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date">Date</Label>
                                <Input id="date" type="date" {...form.register('date')} />
                                {form.formState.errors.date && (
                                    <p className="text-sm text-destructive">{form.formState.errors.date.message}</p>
                                )}
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
                                {form.formState.errors.categoryId && (
                                    <p className="text-sm text-destructive">{form.formState.errors.categoryId.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>Expense Type</Label>
                                <Select
                                    value={form.watch('expenseTypeId')}
                                    onValueChange={(v) => form.setValue('expenseTypeId', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {expenseTypes.map((e) => (
                                            <SelectItem key={e.expenseTypeId} value={e.expenseTypeId}>
                                                {e.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {form.formState.errors.expenseTypeId && (
                                    <p className="text-sm text-destructive">{form.formState.errors.expenseTypeId.message}</p>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Payment Method</Label>
                            <Select
                                value={form.watch('paymentMethod') || 'none'}
                                onValueChange={(v) => form.setValue('paymentMethod', v === 'none' ? '' : v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Optional" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
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
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {editing ? 'Update' : 'Create'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={() => setDeleteId(null)}
                title="Delete expense?"
                description="This action cannot be undone."
                onConfirm={handleDelete}
                loading={deleteLoading}
            />
        </div>
    );
}
