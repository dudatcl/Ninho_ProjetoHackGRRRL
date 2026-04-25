import { Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSpeech } from '@/hooks/useSpeech';

export function SpeakerToggle() {
  const { enabled, toggle, speak } = useSpeech();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => {
        toggle();
        if (!enabled) setTimeout(() => speak('Leitura em voz alta ativada'), 50);
      }}
      aria-label={enabled ? 'Desligar leitura em voz alta' : 'Ligar leitura em voz alta'}
      className={`rounded-full h-12 w-12 ${enabled ? 'bg-mint-soft text-mint-foreground shadow-soft-sm' : 'bg-muted text-muted-foreground'}`}
    >
      <Volume2 className={enabled ? 'opacity-100' : 'opacity-50'} />
    </Button>
  );
}
