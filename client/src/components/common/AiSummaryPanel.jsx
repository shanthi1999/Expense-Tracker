import { useEffect } from 'react';
import { format, startOfMonth, subDays } from 'date-fns';
import {
    Bot,
    RefreshCw,
    Sparkles,
    TrendingUp,
    Lightbulb,
    PiggyBank,
    Calendar,
    X,
    Loader2,
    AlertCircle,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
import { fetchAiSummary, clearAiError } from '@/features/ai/aiSlice';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const SUMMARY_TEMPLATES = [
    {
        id: 'all-time',
        label: 'All-time overview',
        icon: Sparkles,
        params: {},
        description: 'Analyze all your recorded expenses',
    },
    {
        id: 'this-month',
        label: 'This month',
        icon: Calendar,
        params: () => ({
            dateFrom: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
            dateTo: format(new Date(), 'yyyy-MM-dd'),
        }),
        description: 'Spending from the start of this month',
    },
    {
        id: 'last-30',
        label: 'Last 30 days',
        icon: TrendingUp,
        params: () => ({
            dateFrom: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
            dateTo: format(new Date(), 'yyyy-MM-dd'),
        }),
        description: 'Recent spending trends',
    },
    {
        id: 'saving-tips',
        label: 'Saving tips',
        icon: PiggyBank,
        params: {},
        description: 'Get actionable saving suggestions',
    },
];

function resolveParams(template) {
    return typeof template.params === 'function' ? template.params() : template.params;
}

export function AiSummaryPanel({ open, onClose }) {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);
    const {
        summary,
        totalSpent,
        highestCategory,
        categoryBreakdown,
        patterns,
        habits,
        insight,
        suggestion,
        status,
        error,
        lastParams,
    } = useAppSelector((state) => state.ai);

    const formatCurrency = (amount) => {
        if (amount == null || Number.isNaN(Number(amount))) return '—';
        return new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: user?.currency || 'USD',
        }).format(amount);
    };

    const loadSummary = (params = {}) => {
        dispatch(fetchAiSummary(params));
    };

    useEffect(() => {
        if (open && status === 'idle' && !summary) {
            loadSummary({});
        }
    }, [open]);

    useEffect(() => {
        if (!open) {
            dispatch(clearAiError());
        }
    }, [open, dispatch]);

    const handleRefresh = () => {
        loadSummary(lastParams || {});
    };

    const activeTemplateId =
        SUMMARY_TEMPLATES.find((template) => {
            const params = resolveParams(template);
            return JSON.stringify(params) === JSON.stringify(lastParams || {});
        })?.id || null;

    if (!open) return null;

    return (
        <>
            <div
                className="fixed inset-0 z-40 bg-black/40 lg:bg-black/20"
                onClick={onClose}
                aria-hidden="true"
            />
            <aside
                className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l bg-background shadow-xl"
                role="dialog"
                aria-label="AI Expense Summary"
            >
                <div className="flex items-center justify-between border-b px-4 py-4">
                    <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                            <Bot className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="font-semibold">AI Expense Summary</h2>
                            <p className="text-xs text-muted-foreground">Powered by Groq · Llama 3.1</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleRefresh}
                            disabled={status === 'loading'}
                            title="Refresh summary"
                        >
                            <RefreshCw
                                className={cn('h-4 w-4', status === 'loading' && 'animate-spin')}
                            />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onClose} title="Close">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="border-b p-4">
                    <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Quick templates
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        {SUMMARY_TEMPLATES.map((template) => {
                            const Icon = template.icon;
                            const isActive = activeTemplateId === template.id;
                            return (
                                <button
                                    key={template.id}
                                    type="button"
                                    onClick={() => loadSummary(resolveParams(template))}
                                    disabled={status === 'loading'}
                                    className={cn(
                                        'rounded-lg border p-3 text-left transition-colors hover:bg-accent',
                                        isActive && 'border-primary bg-primary/5'
                                    )}
                                >
                                    <div className="mb-1 flex items-center gap-1.5">
                                        <Icon className="h-3.5 w-3.5 text-primary" />
                                        <span className="text-xs font-medium">{template.label}</span>
                                    </div>
                                    <p className="text-[11px] leading-snug text-muted-foreground">
                                        {template.description}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {status === 'loading' && (
                        <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm">Analyzing your expenses...</p>
                        </div>
                    )}

                    {status === 'failed' && (
                        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                            <div className="mb-2 flex items-center gap-2 text-destructive">
                                <AlertCircle className="h-4 w-4" />
                                <p className="text-sm font-medium">Could not generate summary</p>
                            </div>
                            <p className="mb-4 text-sm text-muted-foreground">{error}</p>
                            <Button size="sm" onClick={handleRefresh}>
                                Try again
                            </Button>
                        </div>
                    )}

                    {status === 'succeeded' && (
                        <div className="space-y-4">
                            <div className="rounded-xl border bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Total Spent
                                </p>
                                <p className="mt-1 text-3xl font-bold text-primary">
                                    {formatCurrency(totalSpent)}
                                </p>
                                {highestCategory && (
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Highest category:{' '}
                                        <span className="font-medium text-foreground">
                                            {highestCategory}
                                        </span>
                                    </p>
                                )}
                            </div>

                            {insight && (
                                <div className="rounded-lg border p-4">
                                    <div className="mb-2 flex items-center gap-2">
                                        <Sparkles className="h-4 w-4 text-primary" />
                                        <p className="text-sm font-medium">Insight</p>
                                    </div>
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                        &ldquo;{insight}&rdquo;
                                    </p>
                                </div>
                            )}

                            {suggestion && (
                                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
                                    <div className="mb-2 flex items-center gap-2">
                                        <Lightbulb className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                        <p className="text-sm font-medium">Suggestion</p>
                                    </div>
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                        {suggestion}
                                    </p>
                                </div>
                            )}

                            {categoryBreakdown?.length > 0 && (
                                <div className="rounded-lg border p-4">
                                    <p className="mb-3 text-sm font-medium">Category breakdown</p>
                                    <div className="space-y-2">
                                        {categoryBreakdown.map((item) => (
                                            <div
                                                key={item.category}
                                                className="flex items-center justify-between text-sm"
                                            >
                                                <span>{item.category}</span>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary">
                                                        {item.percentage != null
                                                            ? `${Math.round(item.percentage)}%`
                                                            : '—'}
                                                    </Badge>
                                                    <span className="font-medium">
                                                        {formatCurrency(item.amount)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {(patterns || habits) && (
                                <div className="space-y-3 rounded-lg border p-4">
                                    {patterns && (
                                        <div>
                                            <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">
                                                Patterns
                                            </p>
                                            <p className="text-sm leading-relaxed">{patterns}</p>
                                        </div>
                                    )}
                                    {habits && (
                                        <div>
                                            <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">
                                                Habits
                                            </p>
                                            <p className="text-sm leading-relaxed">{habits}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {summary && (
                                <div className="rounded-lg bg-muted/50 p-4">
                                    <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                                        Full summary
                                    </p>
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                        {summary}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}

export function AiSummaryTriggerCard({ onOpen }) {
    return (
        <button
            type="button"
            onClick={onOpen}
            className="group w-full rounded-xl border bg-gradient-to-br from-primary/10 via-background to-primary/5 p-4 text-left transition-all hover:border-primary/40 hover:shadow-md"
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="mb-1 flex items-center gap-2">
                        <Bot className="h-5 w-5 text-primary" />
                        <span className="font-semibold">AI Expense Summary</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Get spending insights, patterns, and saving tips powered by Llama 3.1 on Groq.
                    </p>
                </div>
                <Sparkles className="h-5 w-5 shrink-0 text-primary opacity-70 transition-opacity group-hover:opacity-100" />
            </div>
            <p className="mt-3 text-xs font-medium text-primary">Click to open →</p>
        </button>
    );
}
