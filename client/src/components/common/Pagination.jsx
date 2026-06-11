import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export function Pagination({
    page,
    totalPages,
    onPageChange,
    total,
    limit = DEFAULT_PAGE_SIZE,
    onPageSizeChange,
}) {
    if (total === 0) return null;

    const safeTotalPages = Math.max(1, totalPages);

    return (
        <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
                Page {page} of {safeTotalPages} ({total} total)
            </p>
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                    <Label htmlFor="page-size" className="whitespace-nowrap text-sm text-muted-foreground">
                        Rows per page
                    </Label>
                    <Select
                        value={String(limit)}
                        onValueChange={(value) => onPageSizeChange?.(Number(value))}
                    >
                        <SelectTrigger id="page-size" className="h-9 w-[72px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {PAGE_SIZE_OPTIONS.map((size) => (
                                <SelectItem key={size} value={String(size)}>
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {safeTotalPages > 1 && (
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page <= 1}
                            onClick={() => onPageChange(page - 1)}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page >= safeTotalPages}
                            onClick={() => onPageChange(page + 1)}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
