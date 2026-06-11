import { cn } from '@/lib/utils';

export function ColorDot({ color, className }) {
    return (
        <span
            className={cn('inline-block h-3 w-3 shrink-0 rounded-full border', className)}
            style={{ backgroundColor: color || '#e5e5e5' }}
        />
    );
}

export function ColorInput({ value, onChange, id, className }) {
    return (
        <div className={cn('flex items-center gap-3', className)}>
            <input
                type="color"
                id={id}
                value={value || '#e5e5e5'}
                onChange={(e) => onChange(e.target.value)}
                className="h-10 w-14 cursor-pointer rounded border border-input bg-background p-1"
            />
            <span className="text-sm text-muted-foreground">{value || '#e5e5e5'}</span>
        </div>
    );
}
