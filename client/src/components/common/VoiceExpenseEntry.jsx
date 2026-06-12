import { useCallback, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Mic, MicOff, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import expenseApi from '@/features/expense/expenseApi';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { getApiErrorMessage } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const SPEECH_ERRORS = {
    'not-allowed': 'Microphone blocked. Allow mic access for this site in browser settings.',
    'no-speech': 'No speech heard. Speak clearly and try again.',
    network: 'Speech service needs internet. Check your connection.',
    unsupported: 'Voice input needs Chrome or Edge browser.',
    busy: 'Microphone busy. Wait a moment and try again.',
    'start-failed': 'Could not start microphone. Try Chrome or Edge.',
    'service-not-allowed': 'Speech recognition unavailable. Use Chrome/Edge on desktop.',
};

export function VoiceExpenseEntry({
    open,
    onOpenChange,
    categories,
    expenseTypes,
    onApply,
    onCreate,
}) {
    const [parsing, setParsing] = useState(false);
    const [result, setResult] = useState(null);
    const [inputText, setInputText] = useState('');

    const handleSpeechResult = useCallback((text) => {
        if (text) setInputText(text);
    }, []);

    const handleSpeechError = useCallback((error) => {
        toast.error(SPEECH_ERRORS[error] || `Speech error: ${error}`);
    }, []);

    const {
        isSupported,
        isListening,
        transcript,
        startListening,
        stopListening,
    } = useSpeechRecognition({
        onResult: handleSpeechResult,
        onError: handleSpeechError,
    });

    const reset = () => {
        setResult(null);
        setInputText('');
        stopListening();
    };

    const handleClose = (isOpen) => {
        if (!isOpen) reset();
        onOpenChange(isOpen);
    };

    useEffect(() => {
        if (!open) reset();
    }, [open]);

    const liveText = isListening ? transcript || inputText : inputText;

    const parseTranscript = async (text) => {
        const trimmed = text.trim();
        if (trimmed.length < 3) {
            toast.error('Say or type an expense, e.g. "Spent 500 rupees on petrol"');
            return;
        }

        setParsing(true);
        try {
            const { data } = await expenseApi.parseVoiceExpense(trimmed);
            setResult(data.data);
            toast.success('Expense understood');
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Failed to parse voice input'));
        } finally {
            setParsing(false);
        }
    };

    const handleParse = () => parseTranscript(liveText);

    const buildPayload = () => ({
        title: result.title || '',
        amount: result.amount ?? 0,
        date: result.date || format(new Date(), 'yyyy-MM-dd'),
        categoryId: result.categoryId || categories[0]?.categoryId || '',
        expenseTypeId: result.expenseTypeId || expenseTypes[0]?.expenseTypeId || '',
        description: result.description || result.transcript || '',
        paymentMethod: result.paymentMethod || '',
    });

    const handleApply = () => {
        if (!result) return;
        onApply(buildPayload());
        handleClose(false);
        toast.success('Expense form filled from voice');
    };

    const handleCreate = async () => {
        if (!result || !onCreate) return;
        await onCreate(buildPayload());
        handleClose(false);
    };

    const canParse = liveText.trim().length >= 3 && !isListening && !parsing;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Mic className="h-5 w-5" />
                        Voice Expense Entry
                    </DialogTitle>
                    <DialogDescription>
                        Say &quot;Spent 500 rupees on petrol&quot; — works best in{' '}
                        <strong>Chrome or Edge</strong> with microphone allowed.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {isSupported ? (
                        <div className="flex flex-col items-center gap-3 rounded-lg border bg-muted/20 p-6">
                            <button
                                type="button"
                                onClick={isListening ? stopListening : startListening}
                                disabled={parsing}
                                aria-label={isListening ? 'Stop listening' : 'Start listening'}
                                className={cn(
                                    'flex h-20 w-20 items-center justify-center rounded-full border-2 transition-all',
                                    isListening
                                        ? 'animate-pulse border-destructive bg-destructive/10 text-destructive'
                                        : 'border-primary bg-primary/10 text-primary hover:bg-primary/20'
                                )}
                            >
                                {isListening ? (
                                    <MicOff className="h-8 w-8" />
                                ) : (
                                    <Mic className="h-8 w-8" />
                                )}
                            </button>
                            <p className="text-center text-sm text-muted-foreground">
                                {isListening
                                    ? 'Listening… speak now, then wait or tap to stop'
                                    : 'Tap mic → allow microphone → speak your expense'}
                            </p>
                        </div>
                    ) : (
                        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
                            Voice is not supported in this browser. Use <strong>Chrome</strong> or{' '}
                            <strong>Edge</strong>, or type your expense below.
                        </p>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="voice-transcript">What you said</Label>
                        <Textarea
                            id="voice-transcript"
                            value={liveText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder='e.g. "Spent 500 rupees on petrol"'
                            rows={3}
                        />
                        <p className="text-xs text-muted-foreground">
                            Tip: You can also type here and click Parse expense — no mic needed.
                        </p>
                    </div>

                    {result && (
                        <div className="space-y-3 rounded-lg border bg-muted/30 p-4 text-sm">
                            <div className="flex items-center gap-2 font-medium text-primary">
                                <CheckCircle2 className="h-4 w-4" />
                                Expense preview
                            </div>
                            <div className="grid gap-2">
                                <p>
                                    <span className="text-muted-foreground">Title: </span>
                                    {result.title || '—'}
                                </p>
                                <p>
                                    <span className="text-muted-foreground">Amount: </span>
                                    <Badge variant="secondary">{result.amount ?? '—'}</Badge>
                                </p>
                                <p>
                                    <span className="text-muted-foreground">Date: </span>
                                    {result.date || '—'}
                                </p>
                                <p>
                                    <span className="text-muted-foreground">Category: </span>
                                    {result.categoryTitle || result.suggestedCategoryTitle || '—'}
                                </p>
                                <p>
                                    <span className="text-muted-foreground">Type: </span>
                                    {result.expenseTypeTitle ||
                                        result.suggestedExpenseTypeTitle ||
                                        '—'}
                                </p>
                                {result.paymentMethod && (
                                    <p>
                                        <span className="text-muted-foreground">Payment: </span>
                                        {result.paymentMethod}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex-col gap-2 sm:flex-row">
                    <Button type="button" variant="outline" onClick={() => handleClose(false)}>
                        Cancel
                    </Button>
                    {!result ? (
                        <Button type="button" onClick={handleParse} disabled={!canParse}>
                            {parsing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Parsing…
                                </>
                            ) : (
                                'Parse expense'
                            )}
                        </Button>
                    ) : (
                        <>
                            <Button type="button" variant="outline" onClick={handleApply}>
                                Edit in form
                            </Button>
                            {onCreate && (
                                <Button type="button" onClick={handleCreate}>
                                    Create expense
                                </Button>
                            )}
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
