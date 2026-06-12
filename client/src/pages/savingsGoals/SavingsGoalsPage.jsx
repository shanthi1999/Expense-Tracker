import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Plus, Pencil, Trash2, PiggyBank, Coins } from 'lucide-react';
import { toast } from 'sonner';
import { savingsGoalSchema, contributeSchema } from '@/schemas/savingsGoal.schema';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
import {
    fetchSavingsGoals,
    createSavingsGoal,
    updateSavingsGoal,
    contributeToGoal,
    deleteSavingsGoal,
} from '@/features/savingsGoal/savingsGoalSlice';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Pagination } from '@/components/common/Pagination';
import { getTotalPages } from '@/lib/pagination';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { SavingsGoalCard } from '@/components/common/SavingsGoalCard';
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

export default function SavingsGoalsPage() {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);
    const { goals, pagination, status } = useAppSelector((state) => state.savingsGoal);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [contributeOpen, setContributeOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [contributeGoal, setContributeGoal] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const form = useForm({
        resolver: zodResolver(savingsGoalSchema),
        defaultValues: {
            title: '',
            targetAmount: 0,
            savedAmount: 0,
            deadline: '',
            description: '',
        },
    });

    const contributeForm = useForm({
        resolver: zodResolver(contributeSchema),
        defaultValues: { amount: 0 },
    });

    const formatCurrency = (amount) =>
        new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: user?.currency || 'USD',
        }).format(amount ?? 0);

    const loadGoals = (page = pagination.page, limit = pagination.limit) => {
        dispatch(fetchSavingsGoals({ page, limit, sortBy: 'deadline', order: 'ASC' }));
    };

    useEffect(() => {
        loadGoals(1);
    }, [dispatch]);

    const openCreate = () => {
        setEditing(null);
        form.reset({
            title: '',
            targetAmount: 0,
            savedAmount: 0,
            deadline: '',
            description: '',
        });
        setDialogOpen(true);
    };

    const openEdit = (goal) => {
        setEditing(goal);
        form.reset({
            title: goal.title,
            targetAmount: goal.targetAmount,
            savedAmount: goal.savedAmount,
            deadline: format(new Date(goal.deadline), 'yyyy-MM-dd'),
            description: goal.description || '',
        });
        setDialogOpen(true);
    };

    const openContribute = (goal) => {
        setContributeGoal(goal);
        contributeForm.reset({ amount: 0 });
        setContributeOpen(true);
    };

    const onSubmit = async (data) => {
        const payload = {
            ...data,
            targetAmount: Number(data.targetAmount),
            savedAmount: Number(data.savedAmount) || 0,
            description: data.description || undefined,
        };

        const result = editing
            ? await dispatch(updateSavingsGoal({ id: editing.savingsGoalId, payload }))
            : await dispatch(createSavingsGoal(payload));

        if (result.meta.requestStatus === 'fulfilled') {
            toast.success(editing ? 'Goal updated' : 'Goal created');
            setDialogOpen(false);
            loadGoals();
        } else {
            toast.error(result.payload || 'Operation failed');
        }
    };

    const onContribute = async (data) => {
        const result = await dispatch(
            contributeToGoal({
                id: contributeGoal.savingsGoalId,
                amount: Number(data.amount),
            })
        );

        if (result.meta.requestStatus === 'fulfilled') {
            toast.success('Savings added');
            setContributeOpen(false);
            loadGoals();
        } else {
            toast.error(result.payload || 'Failed to add savings');
        }
    };

    const handleDelete = async () => {
        setDeleteLoading(true);
        const result = await dispatch(deleteSavingsGoal(deleteId));
        setDeleteLoading(false);
        if (result.meta.requestStatus === 'fulfilled') {
            toast.success('Goal deleted');
            setDeleteId(null);
            loadGoals();
        } else {
            toast.error(result.payload || 'Delete failed');
        }
    };

    const totalPages = getTotalPages(pagination.total, pagination.limit);

    return (
        <div>
            <PageHeader
                title="Savings Goals"
                description="Set targets, track progress, and see how much to save each month"
                action={
                    <Button onClick={openCreate}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Goal
                    </Button>
                }
            />

            {status === 'loading' && goals.length === 0 ? (
                <LoadingSpinner />
            ) : goals.length === 0 ? (
                <div className="rounded-xl border py-16 text-center">
                    <PiggyBank className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">No savings goals yet.</p>
                    <Button className="mt-4" onClick={openCreate}>
                        Create your first goal
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {goals.map((goal) => (
                        <div key={goal.savingsGoalId} className="space-y-2">
                            <SavingsGoalCard goal={goal} formatCurrency={formatCurrency} />
                            <div className="flex justify-end gap-1">
                                {!goal.isComplete && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openContribute(goal)}
                                    >
                                        <Coins className="mr-1 h-3.5 w-3.5" />
                                        Add savings
                                    </Button>
                                )}
                                <Button variant="ghost" size="sm" onClick={() => openEdit(goal)}>
                                    <Pencil className="mr-1 h-3.5 w-3.5" />
                                    Edit
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive"
                                    onClick={() => setDeleteId(goal.savingsGoalId)}
                                >
                                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                                    Delete
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <Pagination
                    page={pagination.page}
                    totalPages={totalPages}
                    onPageChange={(page) => loadGoals(page)}
                />
            )}

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit goal' : 'New savings goal'}</DialogTitle>
                        <DialogDescription>
                            Example: Buy Laptop — ₹80,000 by Dec 2026
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Goal</Label>
                            <Input id="title" placeholder="Buy Laptop" {...form.register('title')} />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="targetAmount">Target amount</Label>
                                <Input
                                    id="targetAmount"
                                    type="number"
                                    min="1"
                                    step="0.01"
                                    {...form.register('targetAmount')}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="savedAmount">Already saved</Label>
                                <Input
                                    id="savedAmount"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    {...form.register('savedAmount')}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="deadline">Deadline</Label>
                            <Input id="deadline" type="date" {...form.register('deadline')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Notes (optional)</Label>
                            <Textarea id="description" {...form.register('description')} />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">{editing ? 'Save' : 'Create goal'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={contributeOpen} onOpenChange={setContributeOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add savings</DialogTitle>
                        <DialogDescription>
                            Add to &quot;{contributeGoal?.title}&quot; —{' '}
                            {formatCurrency(contributeGoal?.remaining)} remaining
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={contributeForm.handleSubmit(onContribute)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount to add</Label>
                            <Input
                                id="amount"
                                type="number"
                                min="0.01"
                                step="0.01"
                                {...contributeForm.register('amount')}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setContributeOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Add savings</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={() => setDeleteId(null)}
                title="Delete goal?"
                description="This savings goal will be permanently removed."
                onConfirm={handleDelete}
                loading={deleteLoading}
            />
        </div>
    );
}
