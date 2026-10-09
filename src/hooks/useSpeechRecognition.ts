import { useState, useEffect, useRef, useCallback } from 'react';

// SpeechRecognition type declarations for browsers
interface SpeechRecognitionEventLike extends Event {
  results: {
    length: number;
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal: boolean;
    };
  };
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

export function useSpeechRecognition({ onTranscript }: { onTranscript: (text: string) => void }) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    const SpeechRecognitionAPI =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).webkitSpeechRecognition;

    if (SpeechRecognitionAPI) {
      setIsSupported(true);
      try {
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          setError(null);
        };

        recognition.onresult = (event: SpeechRecognitionEventLike) => {
          let finalTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            const res = event.results[i];
            if (res && res[0]) {
              finalTranscript += res[0].transcript;
            }
          }
          if (finalTranscript) {
            onTranscript(finalTranscript);
          }
        };

        recognition.onerror = (event: { error: string }) => {
          console.warn('Speech recognition error:', event.error);
          setIsListening(false);
          if (event.error !== 'no-speech') {
            setError(`Microphone error: ${event.error}`);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } catch (e) {
        console.warn('SpeechRecognition initialization error:', e);
      }
    } else {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, [onTranscript]);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      setError('Voice input is not supported in this browser.');
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
    } else {
      try {
        setError(null);
        recognitionRef.current.start();
      } catch (err) {
        console.error('Error starting speech recognition:', err);
        setError('Could not access microphone.');
      }
    }
  }, [isListening]);

  return {
    isListening,
    isSupported,
    error,
    toggleListening,
  };
}
