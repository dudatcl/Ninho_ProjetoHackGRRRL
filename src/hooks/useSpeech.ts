// Hook simples para Text-to-Speech em pt-BR
import { useCallback, useEffect, useRef, useState } from 'react';

export function useSpeech() {
  const [enabled, setEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('gmi:tts') !== 'off';
  });
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      voiceRef.current =
        voices.find((v) => v.lang?.toLowerCase().startsWith('pt-br')) ||
        voices.find((v) => v.lang?.toLowerCase().startsWith('pt')) ||
        null;
    };
    pickVoice();
    window.speechSynthesis.onvoiceschanged = pickVoice;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'pt-BR';
        u.rate = 0.95;
        u.pitch = 1.05;
        if (voiceRef.current) u.voice = voiceRef.current;
        window.speechSynthesis.speak(u);
      } catch {
        // silencioso
      }
    },
    [enabled],
  );

  const toggle = useCallback(() => {
    setEnabled((v) => {
      const next = !v;
      localStorage.setItem('gmi:tts', next ? 'on' : 'off');
      if (!next && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      return next;
    });
  }, []);

  return { speak, enabled, toggle };
}
