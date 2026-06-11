import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { expenseTypeSchema } from '@/schemas/expenseType.schema';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
import {
    fetchExpenseTypes,
    createExpenseType,
    updateExpenseType,
    deleteExpenseType,
} from '@/features/expenseType/expenseTypeSlice';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Pagination } from '@/components/common/Pagination';
import { getTotalPages } from '@/lib/pagination';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ColorDot, ColorInput } from '@/components/common/ColorInput';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export default function ExpenseTypesPage() {
    const dispatch = useAppDispatch();
    const { expenseTypes, pagination, status } = useAppSelector((state) => state.expenseType);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [search, setSearch] = useState('');

    const form = useForm({
        resolver: zodResolver(expenseTypeSchema),
        defaultValues: { title: '', description: '', categoryColorCode: '#10b981' },
    });

    const loadExpenseTypes = (page = pagination.page, limit = pagination.limit) => {
        dispatch(fetchExpenseTypes({ page, limit, title: search || undefined }));
    };

    useEffect(() => {
        loadExpenseTypes(1);
    }, []);

    const openCreate = () => {
        setEditing(null);
        form.reset({ title: '', description: '', categoryColorCode: '#10b981' });
        setDialogOpen(true);
    };

    const openEdit = (item) => {
        setEditing(item);
        form.reset({
            title: item.title,
            description: item.description,
            categoryColorCode: item.categoryColorCode || '#10b981',
        });
        setDialogOpen(true);
    };

    const onSubmit = async (data) => {
        const payload = {
            ...data,
            categoryColorCode: data.categoryColorCode || undefined,
        };

        const result = editing
            ? await dispatch(updateExpenseType({ id: editing.expenseTypeId, payload }))
            : await dispatch(createExpenseType(payload));

        if (result.meta.requestStatus === 'fulfilled') {
            toast.success(editing ? 'Expense type updated' : 'Expense type created');
            setDialogOpen(false);
            loadExpenseTypes();
        } else {
            toast.error(result.payload || 'Operation failed');
        }
    };

    const handleDelete = async () => {
        setDeleteLoading(true);
        const result = await dispatch(deleteExpenseType(deleteId));
        setDeleteLoading(false);
        if (result.meta.requestStatus === 'fulfilled') {
            toast.success('Expense type deleted');
            setDeleteId(null);
            loadExpenseTypes();
        } else {
            toast.error(result.payload || 'Delete failed');
        }
    };

    const totalPages = getTotalPages(pagination.total, pagination.limit);

    return (
        <div>
            <PageHeader
                title="Expense Types"
                description="Define types for categorizing your spending"
                action={
                    <Button onClick={openCreate}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Expense Type
                    </Button>
                }
            />

            <div className="mb-4 flex gap-2">
                <Input
                    placeholder="Search by title..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm"
                />
                <Button variant="secondary" onClick={() => loadExpenseTypes(1)}>
                    Search
                </Button>
            </div>

            {status === 'loading' && expenseTypes.length === 0 ? (
                <LoadingSpinner />
            ) : (
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Color</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead className="hidden md:table-cell">Description</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {expenseTypes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                                        No expense types found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                expenseTypes.map((item) => (
                                    <TableRow key={item.expenseTypeId}>
                                        <TableCell>
                                            <ColorDot color={item.categoryColorCode} />
                                        </TableCell>
                                        <TableCell className="font-medium">{item.title}</TableCell>
                                        <TableCell className="hidden max-w-xs truncate md:table-cell">
                                            {item.description}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => setDeleteId(item.expenseTypeId)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
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
                onPageChange={(p) => loadExpenseTypes(p)}
                onPageSizeChange={(limit) => loadExpenseTypes(1, limit)}
            />

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit Expense Type' : 'New Expense Type'}</DialogTitle>
                        <DialogDescription>
                            {editing ? 'Update expense type details' : 'Create a new expense type'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" {...form.register('title')} />
                            {form.formState.errors.title && (
                                <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" {...form.register('description')} />
                            {form.formState.errors.description && (
                                <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>Color</Label>
                            <ColorInput
                                value={form.watch('categoryColorCode')}
                                onChange={(v) => form.setValue('categoryColorCode', v)}
                            />
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
                title="Delete expense type?"
                description="Types with mapped expenses cannot be deleted."
                onConfirm={handleDelete}
                loading={deleteLoading}
            />
        </div>
    );
}
