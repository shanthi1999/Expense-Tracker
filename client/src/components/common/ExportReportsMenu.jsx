import { useState } from 'react';
import { FileSpreadsheet, FileText, FileType, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import expenseApi from '@/features/expense/expenseApi';
import { getApiErrorMessage } from '@/lib/axios';
import { downloadBlob, getFilenameFromDisposition } from '@/lib/download';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const EXPORT_OPTIONS = [
    { format: 'pdf', label: 'PDF', icon: FileText },
    { format: 'xlsx', label: 'Excel', icon: FileSpreadsheet },
    { format: 'csv', label: 'CSV', icon: FileType },
];

export function ExportReportsMenu({ filters, sort, disabled = false }) {
    const [exportingFormat, setExportingFormat] = useState(null);

    const handleExport = async (format) => {
        setExportingFormat(format);
        try {
            const response = await expenseApi.exportExpenses({
                format,
                categoryId: filters.categoryId || undefined,
                expenseTypeId: filters.expenseTypeId || undefined,
                dateFrom: filters.dateFrom || undefined,
                dateTo: filters.dateTo || undefined,
                sortBy: sort.sortBy,
                order: sort.order,
            });

            const filename = getFilenameFromDisposition(
                response.headers['content-disposition'],
                `expense-report.${format === 'xlsx' ? 'xlsx' : format}`
            );

            downloadBlob(response.data, filename);
            toast.success(`${format.toUpperCase()} report downloaded`);
        } catch (error) {
            if (error?.response?.data instanceof Blob) {
                try {
                    const text = await error.response.data.text();
                    const parsed = JSON.parse(text);
                    toast.error(parsed.message || 'Export failed');
                } catch {
                    toast.error(getApiErrorMessage(error, 'Export failed'));
                }
            } else {
                toast.error(getApiErrorMessage(error, 'Export failed'));
            }
        } finally {
            setExportingFormat(null);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={disabled || Boolean(exportingFormat)}>
                    {exportingFormat ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Download className="mr-2 h-4 w-4" />
                    )}
                    Export Reports
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Export</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {EXPORT_OPTIONS.map(({ format, label, icon: Icon }) => (
                    <DropdownMenuItem
                        key={format}
                        onClick={() => handleExport(format)}
                        disabled={Boolean(exportingFormat)}
                    >
                        <Icon className="mr-2 h-4 w-4" />
                        {exportingFormat === format ? `Exporting ${label}...` : label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
