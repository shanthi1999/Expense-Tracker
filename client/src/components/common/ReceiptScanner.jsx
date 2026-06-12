import { useRef, useState } from 'react';
import { format } from 'date-fns';
import { Camera, Loader2, ScanLine, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import expenseApi from '@/features/expense/expenseApi';
import { getApiErrorMessage } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export function ReceiptScanner({ open, onOpenChange, categories, expenseTypes, onApply }) {
    const inputRef = useRef(null);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState(null);

    const reset = () => {
        setFile(null);
        setPreview(null);
        setResult(null);
        if (inputRef.current) inputRef.current.value = '';
    };

    const handleClose = (isOpen) => {
        if (!isOpen) reset();
        onOpenChange(isOpen);
    };

    const handleFileChange = (event) => {
        const selected = event.target.files?.[0];
        if (!selected) return;

        if (!selected.type.startsWith('image/')) {
            toast.error('Please select an image file (JPG, PNG, etc.)');
            return;
        }

        if (selected.size > 5 * 1024 * 1024) {
            toast.error('Image must be smaller than 5 MB');
            return;
        }

        setFile(selected);
        setResult(null);
        setPreview(URL.createObjectURL(selected));
    };

    const handleScan = async () => {
        if (!file) return;

        setScanning(true);
        try {
            const { data } = await expenseApi.scanReceipt(file);
            setResult(data.data);
            toast.success('Receipt scanned successfully');
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Failed to scan receipt'));
        } finally {
            setScanning(false);
        }
    };

    const handleApply = () => {
        if (!result) return;

        onApply({
            title: result.title || result.storeName || '',
            amount: result.amount ?? result.totalAmount ?? 0,
            date: result.date || format(new Date(), 'yyyy-MM-dd'),
            categoryId: result.categoryId || categories[0]?.categoryId || '',
            expenseTypeId: expenseTypes[0]?.expenseTypeId || '',
            description: result.description || '',
            paymentMethod: result.paymentMethod || '',
            receiptUrl: result.receiptUrl || undefined,
        });

        handleClose(false);
        toast.success('Expense form filled from receipt');
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ScanLine className="h-5 w-5" />
                        Scan Receipt
                    </DialogTitle>
                    <DialogDescription>
                        Upload a receipt photo. OCR extracts the store, date, items, total, and
                        suggests a category.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Receipt image</Label>
                        <input
                            ref={inputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => inputRef.current?.click()}
                            disabled={scanning}
                        >
                            <Camera className="mr-2 h-4 w-4" />
                            {file ? file.name : 'Choose receipt.jpg'}
                        </Button>
                    </div>

                    {preview && (
                        <img
                            src={preview}
                            alt="Receipt preview"
                            className="max-h-48 w-full rounded-lg border object-contain"
                        />
                    )}

                    {result && (
                        <div className="space-y-3 rounded-lg border bg-muted/30 p-4 text-sm">
                            <div className="flex items-center gap-2 font-medium text-primary">
                                <CheckCircle2 className="h-4 w-4" />
                                Extracted details
                            </div>
                            <div className="grid gap-2">
                                <p>
                                    <span className="text-muted-foreground">Store: </span>
                                    {result.storeName || result.title || '—'}
                                </p>
                                <p>
                                    <span className="text-muted-foreground">Date: </span>
                                    {result.date || '—'}
                                </p>
                                <p>
                                    <span className="text-muted-foreground">Total: </span>
                                    {result.totalAmount ?? result.amount ?? '—'}
                                </p>
                                <p>
                                    <span className="text-muted-foreground">Category: </span>
                                    {result.categoryTitle || result.suggestedCategoryTitle || '—'}
                                </p>
                                {result.paymentMethod && (
                                    <p>
                                        <span className="text-muted-foreground">Payment: </span>
                                        {result.paymentMethod}
                                    </p>
                                )}
                            </div>
                            {result.items?.length > 0 && (
                                <div>
                                    <p className="mb-1 text-muted-foreground">Items:</p>
                                    <ul className="space-y-1">
                                        {result.items.slice(0, 8).map((item, index) => (
                                            <li key={index} className="flex justify-between gap-2">
                                                <span>{item.name}</span>
                                                {item.price != null && (
                                                    <Badge variant="secondary">{item.price}</Badge>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button type="button" variant="outline" onClick={() => handleClose(false)}>
                        Cancel
                    </Button>
                    {!result ? (
                        <Button type="button" onClick={handleScan} disabled={!file || scanning}>
                            {scanning ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Scanning…
                                </>
                            ) : (
                                <>
                                    <ScanLine className="mr-2 h-4 w-4" />
                                    Scan receipt
                                </>
                            )}
                        </Button>
                    ) : (
                        <Button type="button" onClick={handleApply}>
                            Apply to expense form
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
