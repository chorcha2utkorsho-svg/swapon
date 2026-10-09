import { useState, useEffect, useCallback } from 'react';

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
    }
  }, []);

  const speak = useCallback((text: string, messageId: string) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    if (speakingId === messageId && isSpeaking) {
      setIsSpeaking(false);
      setSpeakingId(null);
      return;
    }

    // Strip markdown tags for clean voice reading
    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'Code snippet omitted for speech.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[*_#>[\]]/g, '')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setSpeakingId(messageId);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingId(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingId(null);
    };

    window.speechSynthesis.speak(utterance);
  }, [isSpeaking, speakingId]);

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeakingId(null);
    }
  }, []);

  return {
    isSpeaking,
    speakingId,
    isSupported,
    speak,
    stop,
  };
}
