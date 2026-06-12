import { useCallback, useRef, useState } from 'react';

const getSpeechRecognition = () => {
    if (typeof window === 'undefined') return null;
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
};

export function useSpeechRecognition({ onResult, onError, lang = 'en-IN' } = {}) {
    const recognitionRef = useRef(null);
    const onResultRef = useRef(onResult);
    const onErrorRef = useRef(onError);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isSupported] = useState(() => Boolean(getSpeechRecognition()));

    onResultRef.current = onResult;
    onErrorRef.current = onError;

    const stopListening = useCallback(() => {
        try {
            recognitionRef.current?.stop();
        } catch {
            // ignore if already stopped
        }
        setIsListening(false);
    }, []);

    const startListening = useCallback(async () => {
        const SpeechRecognition = getSpeechRecognition();
        if (!SpeechRecognition) {
            onErrorRef.current?.('unsupported');
            return;
        }

        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch {
            onErrorRef.current?.('not-allowed');
            return;
        }

        stopListening();

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = lang;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event) => {
            const text = Array.from(event.results)
                .map((result) => result[0]?.transcript ?? '')
                .join('')
                .trim();

            setTranscript(text);

            const lastResult = event.results[event.results.length - 1];
            if (lastResult?.isFinal && text) {
                onResultRef.current?.(text);
            }
        };

        recognition.onerror = (event) => {
            setIsListening(false);
            if (event.error !== 'aborted') {
                onErrorRef.current?.(event.error);
            }
        };

        recognition.onend = () => {
            setIsListening(false);
            setTranscript((current) => {
                if (current) {
                    onResultRef.current?.(current);
                }
                return current;
            });
        };

        recognitionRef.current = recognition;

        try {
            setTranscript('');
            setIsListening(true);
            recognition.start();
        } catch (error) {
            setIsListening(false);
            if (error?.name === 'InvalidStateError') {
                onErrorRef.current?.('busy');
            } else {
                onErrorRef.current?.('start-failed');
            }
        }
    }, [lang, stopListening]);

    return {
        isSupported,
        isListening,
        transcript,
        setTranscript,
        startListening,
        stopListening,
    };
}
