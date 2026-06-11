import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TableHead } from '@/components/ui/table';

export function SortableTableHead({ label, sortKey, activeSort, activeOrder, onSort, className }) {
    const isActive = activeSort === sortKey;

    return (
        <TableHead className={className}>
            <button
                type="button"
                onClick={() => onSort(sortKey)}
                className={cn(
                    'inline-flex items-center gap-1 font-medium transition-colors hover:text-foreground',
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                )}
            >
                {label}
                {isActive ? (
                    activeOrder === 'ASC' ? (
                        <ArrowUp className="h-3.5 w-3.5" />
                    ) : (
                        <ArrowDown className="h-3.5 w-3.5" />
                    )
                ) : (
                    <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
                )}
            </button>
        </TableHead>
    );
}
