import { Calendar, Loader2, SlidersHorizontal, X } from 'lucide-react';
import { ColorDot } from '@/components/common/ColorInput';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

function FilterSelect({ value, onValueChange, allLabel, placeholder, options }) {
    return (
        <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger className="h-10 w-full bg-background">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="min-w-[var(--radix-select-trigger-width)]">
                <SelectItem value="all" className="py-2.5">
                    <span className="flex items-center gap-2.5">
                        <span className="flex h-3 w-3 shrink-0 items-center justify-center rounded-full border border-dashed border-muted-foreground/50" />
                        <span className="text-muted-foreground">{allLabel}</span>
                    </span>
                </SelectItem>
                {options.map((option) => (
                    <SelectItem key={option.id} value={option.id} className="py-2.5">
                        <span className="flex items-center gap-2.5">
                            <ColorDot color={option.color} />
                            <span>{option.label}</span>
                        </span>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

export function ExpenseFilters({
    filters,
    onFiltersChange,
    categories,
    expenseTypes,
    onApply,
    onClear,
    loading,
    hasActiveFilters,
}) {
    const activeCount = [
        filters.categoryId,
        filters.expenseTypeId,
        filters.dateFrom,
        filters.dateTo,
    ].filter(Boolean).length;

    const categoryOptions = categories.map((c) => ({
        id: c.categoryId,
        label: c.title,
        color: c.categoryColorCode,
    }));

    const typeOptions = expenseTypes.map((e) => ({
        id: e.expenseTypeId,
        label: e.title,
        color: e.categoryColorCode,
    }));

    return (
        <div className="mb-6 overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
                <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Filters</span>
                    {activeCount > 0 && (
                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                            {activeCount} active
                        </Badge>
                    )}
                </div>
                {hasActiveFilters && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 text-muted-foreground"
                        onClick={onClear}
                        disabled={loading}
                    >
                        <X className="mr-1 h-3.5 w-3.5" />
                        Clear all
                    </Button>
                )}
            </div>

            <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-12 lg:items-end">
                <div className="space-y-1.5 lg:col-span-3">
                    <Label className="text-xs font-medium text-muted-foreground">Category</Label>
                    <FilterSelect
                        value={filters.categoryId || 'all'}
                        onValueChange={(v) =>
                            onFiltersChange((prev) => ({
                                ...prev,
                                categoryId: v === 'all' ? '' : v,
                            }))
                        }
                        allLabel="All categories"
                        placeholder="All categories"
                        options={categoryOptions}
                    />
                </div>

                <div className="space-y-1.5 lg:col-span-3">
                    <Label className="text-xs font-medium text-muted-foreground">Type</Label>
                    <FilterSelect
                        value={filters.expenseTypeId || 'all'}
                        onValueChange={(v) =>
                            onFiltersChange((prev) => ({
                                ...prev,
                                expenseTypeId: v === 'all' ? '' : v,
                            }))
                        }
                        allLabel="All types"
                        placeholder="All types"
                        options={typeOptions}
                    />
                </div>

                <div className="space-y-1.5 sm:col-span-2 lg:col-span-4">
                    <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        Date range
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                        <Input
                            id="dateFrom"
                            type="date"
                            value={filters.dateFrom}
                            onChange={(e) =>
                                onFiltersChange((prev) => ({ ...prev, dateFrom: e.target.value }))
                            }
                            className="h-10 bg-background"
                            aria-label="From date"
                        />
                        <Input
                            id="dateTo"
                            type="date"
                            value={filters.dateTo}
                            min={filters.dateFrom || undefined}
                            onChange={(e) =>
                                onFiltersChange((prev) => ({ ...prev, dateTo: e.target.value }))
                            }
                            className="h-10 bg-background"
                            aria-label="To date"
                        />
                    </div>
                </div>

                <div className="sm:col-span-2 lg:col-span-2">
                    <Button
                        type="button"
                        className={cn('h-10 w-full', loading && 'pointer-events-none')}
                        onClick={onApply}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Applying…
                            </>
                        ) : (
                            'Apply filters'
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
