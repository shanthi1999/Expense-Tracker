import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LoadingSpinner({ className, label = 'Loading...' }) {
    return (
        <div className={cn('flex flex-col items-center justify-center gap-2 py-12', className)}>
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">{label}</p>
        </div>
    );
}

export function PageLoader() {
    return (
        <div className="flex min-h-[50vh] items-center justify-center">
            <LoadingSpinner />
        </div>
    );
}
