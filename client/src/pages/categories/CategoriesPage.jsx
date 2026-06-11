import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { categorySchema } from '@/schemas/category.schema';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
import {
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} from '@/features/category/categorySlice';
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

export default function CategoriesPage() {
    const dispatch = useAppDispatch();
    const { categories, pagination, status } = useAppSelector((state) => state.category);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [search, setSearch] = useState('');

    const form = useForm({
        resolver: zodResolver(categorySchema),
        defaultValues: { title: '', description: '', categoryColorCode: '#6366f1' },
    });

    const loadCategories = (page = pagination.page, limit = pagination.limit) => {
        dispatch(fetchCategories({ page, limit, title: search || undefined }));
    };

    useEffect(() => {
        loadCategories(1);
    }, []);

    const openCreate = () => {
        setEditing(null);
        form.reset({ title: '', description: '', categoryColorCode: '#6366f1' });
        setDialogOpen(true);
    };

    const openEdit = (category) => {
        setEditing(category);
        form.reset({
            title: category.title,
            description: category.description || '',
            categoryColorCode: category.categoryColorCode || '#6366f1',
        });
        setDialogOpen(true);
    };

    const onSubmit = async (data) => {
        const payload = {
            ...data,
            description: data.description || undefined,
            categoryColorCode: data.categoryColorCode || undefined,
        };

        const result = editing
            ? await dispatch(updateCategory({ id: editing.categoryId, payload }))
            : await dispatch(createCategory(payload));

        if (result.meta.requestStatus === 'fulfilled') {
            toast.success(editing ? 'Category updated' : 'Category created');
            setDialogOpen(false);
            loadCategories();
        } else {
            toast.error(result.payload || 'Operation failed');
        }
    };

    const handleDelete = async () => {
        setDeleteLoading(true);
        const result = await dispatch(deleteCategory(deleteId));
        setDeleteLoading(false);
        if (result.meta.requestStatus === 'fulfilled') {
            toast.success('Category deleted');
            setDeleteId(null);
            loadCategories();
        } else {
            toast.error(result.payload || 'Delete failed');
        }
    };

    const totalPages = getTotalPages(pagination.total, pagination.limit);

    return (
        <div>
            <PageHeader
                title="Categories"
                description="Organize your expenses with custom categories"
                action={
                    <Button onClick={openCreate}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Category
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
                <Button variant="secondary" onClick={() => loadCategories(1)}>
                    Search
                </Button>
            </div>

            {status === 'loading' && categories.length === 0 ? (
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
                            {categories.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                                        No categories found. Create your first category.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                categories.map((cat) => (
                                    <TableRow key={cat.categoryId}>
                                        <TableCell>
                                            <ColorDot color={cat.categoryColorCode} />
                                        </TableCell>
                                        <TableCell className="font-medium">{cat.title}</TableCell>
                                        <TableCell className="hidden max-w-xs truncate md:table-cell">
                                            {cat.description || '—'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" onClick={() => openEdit(cat)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => setDeleteId(cat.categoryId)}>
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
                onPageChange={(p) => loadCategories(p)}
                onPageSizeChange={(limit) => loadCategories(1, limit)}
            />

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit Category' : 'New Category'}</DialogTitle>
                        <DialogDescription>
                            {editing ? 'Update category details' : 'Create a new expense category'}
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
                        </div>
                        <div className="space-y-2">
                            <Label>Color</Label>
                            <ColorInput
                                id="categoryColorCode"
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
                title="Delete category?"
                description="This action cannot be undone. Categories with mapped expenses cannot be deleted."
                onConfirm={handleDelete}
                loading={deleteLoading}
            />
        </div>
    );
}
