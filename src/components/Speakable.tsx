import type { ReactNode } from 'react';
import { useSpeech } from '@/hooks/useSpeech';
import { cn } from '@/lib/utils';

interface SpeakableProps {
  children: ReactNode;
  text: string;
  as?: 'div' | 'button' | 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'li';
  className?: string;
  onClick?: () => void;
}

// Envolve qualquer elemento e dispara TTS no clique (acessibilidade total)
export function Speakable({ children, text, as: Tag = 'div', className, onClick }: SpeakableProps) {
  const { speak } = useSpeech();
  return (
    <Tag
      className={cn('cursor-pointer select-none', className)}
      onClick={() => {
        speak(text);
        onClick?.();
      }}
    >
      {children}
    </Tag>
  );
}
