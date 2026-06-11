import { cn } from '@/lib/utils';

/** Expand #abc shorthand to #aabbcc */
const expandHex = (hex) => {
    if (!hex || !hex.startsWith('#')) return '#e5e5e5';
    if (hex.length === 4) {
        return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
    }
    return hex;
};

const getContrastText = (hex) => {
    const color = expandHex(hex).slice(1);
    const r = parseInt(color.slice(0, 2), 16);
    const g = parseInt(color.slice(2, 4), 16);
    const b = parseInt(color.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.55 ? '#1f2937' : '#ffffff';
};

/** Pill chip styled with the entity's chosen color. */
export function ColorChip({ label, color, className }) {
    const bg = expandHex(color || '#e5e5e5');

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                className
            )}
            style={{
                backgroundColor: bg,
                color: getContrastText(bg),
            }}
        >
            {label}
        </span>
    );
}
