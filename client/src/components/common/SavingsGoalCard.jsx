import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function SavingsGoalCard({ goal, formatCurrency, compact = false }) {
    const progress = goal.progressPercent ?? 0;

    return (
        <div className={cn('rounded-lg border bg-card p-4', goal.isComplete && 'border-primary/30')}>
            <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                    <p className="font-semibold">{goal.title}</p>
                    <p className="text-xs text-muted-foreground">
                        Target by {format(new Date(goal.deadline), 'MMM yyyy')}
                    </p>
                </div>
                {goal.isComplete ? (
                    <Badge className="shrink-0">Complete</Badge>
                ) : goal.isOverdue ? (
                    <Badge variant="destructive" className="shrink-0">
                        Overdue
                    </Badge>
                ) : (
                    <Badge variant="secondary" className="shrink-0">
                        {progress}%
                    </Badge>
                )}
            </div>

            <div className="mb-3 h-2 overflow-hidden rounded-full bg-muted">
                <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.min(100, progress)}%` }}
                />
            </div>

            <div className={cn('grid gap-2 text-sm', compact ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4')}>
                <div>
                    <p className="text-xs text-muted-foreground">Saved</p>
                    <p className="font-medium tabular-nums">{formatCurrency(goal.savedAmount)}</p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">Remaining</p>
                    <p className="font-medium tabular-nums">{formatCurrency(goal.remaining)}</p>
                </div>
                {!compact && (
                    <>
                        <div>
                            <p className="text-xs text-muted-foreground">Target</p>
                            <p className="font-medium tabular-nums">{formatCurrency(goal.targetAmount)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Monthly needed</p>
                            <p className="font-medium tabular-nums">
                                {goal.isComplete ? '—' : formatCurrency(goal.monthlyNeeded)}
                            </p>
                        </div>
                    </>
                )}
            </div>

            {compact && !goal.isComplete && (
                <p className="mt-2 text-xs text-muted-foreground">
                    {formatCurrency(goal.monthlyNeeded)}/month · {goal.monthsRemaining} months left
                </p>
            )}
        </div>
    );
}
