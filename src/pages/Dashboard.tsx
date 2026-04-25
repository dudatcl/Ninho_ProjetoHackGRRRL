import { Link, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { AlertTriangle, Sparkles, BookOpen, ChevronRight, FastForward, RotateCcw, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Speakable } from '@/components/Speakable';
import { SpeakerToggle } from '@/components/SpeakerToggle';
import { PregnancyRing } from '@/components/PregnancyRing';
import { MedicalFooter } from '@/components/MedicalFooter';
import { SYMPTOMS, TONE_CLASS } from '@/lib/symptoms';
import { useApp } from '@/state/AppState';
import { useSpeech } from '@/hooks/useSpeech';
import { storage, todayKey } from '@/lib/storage';
import { cn } from '@/lib/utils';

// Mensagens contextuais por trimestre/semana
function smartTip(week: number) {
  if (week <= 12) {
    return {
      title: 'Dicas para enjoos',
      text: 'Coma pouco e devagar. Beba água com limão.',
      tone: 'mint' as const,
      cta: 'Ver dicas',
      to: '/triagem/dicas-enjoo',
      Icon: Sparkles,
      pulse: false,
    };
  }
  if (week <= 27) {
    return {
      title: 'Movimentos do bebê',
      text: 'Sinta o bebê. Marque quando ele mexer.',
      tone: 'primary' as const,
      cta: 'Registrar movimento',
      to: '/diario',
      Icon: BookOpen,
      pulse: false,
    };
  }
  return {
    title: 'Sinais de alerta para o parto',
    text: 'Bolsa, contrações, sangramento. Saiba o que fazer.',
    tone: 'peach' as const,
    cta: 'Sinais de parto',
    to: '/triagem/parto',
    Icon: AlertTriangle,
    pulse: true,
  };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile, currentWeek, daysToBirth, diary, toggleSymptomToday, advanceWeeks, consecutiveDaysWith, resetAll } = useApp();
  const { speak } = useSpeech();

  const tip = useMemo(() => smartTip(currentWeek), [currentWeek]);
  const todayEntry = diary.find((e) => e.date === todayKey());
  const painStreak = consecutiveDaysWith('dor');
  const headacheStreak = consecutiveDaysWith('dor_cabeca');

  if (!profile) return null;

  return (
    <div className="min-h-screen px-5 py-6">
      <header className="mx-auto flex max-w-md items-center justify-between">
        <div>
          <Speakable as="h1" text="Olá. Bem-vinda de volta." className="font-display text-2xl font-extrabold text-primary">
            Olá, mamãe 💜
          </Speakable>
          <p className="text-sm text-muted-foreground">
            {profile.age} anos · {profile.hasOtherChildren ? 'Já é mãe' : 'Primeira gestação'}
          </p>
        </div>
        <SpeakerToggle />
      </header>

      {/* Alerta amarelo: 3 dias seguidos com mesmo sintoma */}
      {(painStreak >= 3 || headacheStreak >= 3) && (
        <button
          onClick={() => {
            speak('Você marcou esse sintoma 3 dias seguidos. Toque para triagem.');
            navigate(headacheStreak >= 3 ? '/triagem/dor-cabeca' : '/triagem/sangramento');
          }}
          className="mx-auto mt-5 flex w-full max-w-md items-center gap-3 rounded-2xl bg-warning-soft p-4 text-left shadow-soft-sm"
        >
          <AlertTriangle className="shrink-0 text-warning-foreground" />
          <div className="flex-1">
            <p className="font-bold text-warning-foreground">
              {headacheStreak >= 3
                ? `Dor de cabeça há ${headacheStreak} dias`
                : `Dor há ${painStreak} dias seguidos`}
            </p>
            <p className="text-xs text-warning-foreground/80">Toque para triagem</p>
          </div>
          <ChevronRight className="text-warning-foreground" />
        </button>
      )}

      {/* Anel de progresso */}
      <section className="mx-auto mt-6 flex max-w-md flex-col items-center soft-card p-6">
        <PregnancyRing week={currentWeek} daysToBirth={daysToBirth} />
        <Speakable
          as="p"
          text={`Você está na semana ${currentWeek}. Faltam ${daysToBirth} dias.`}
          className="mt-3 text-sm text-muted-foreground"
        >
          Toque para ouvir
        </Speakable>
      </section>

      {/* Card inteligente temporal */}
      <section className="mx-auto mt-5 max-w-md">
        <button
          onClick={() => { speak(tip.title); navigate(tip.to); }}
          className={cn(
            'group flex w-full items-center gap-4 rounded-3xl p-5 text-left shadow-soft transition-soft hover:scale-[1.01]',
            tip.tone === 'peach' && 'bg-gradient-peach-cta text-peach-foreground',
            tip.tone === 'mint' && 'bg-gradient-mint text-mint-foreground',
            tip.tone === 'primary' && 'bg-gradient-belly text-white',
            tip.pulse && 'animate-pulse-glow',
          )}
        >
          <div className="rounded-2xl bg-white/40 p-3">
            <tip.Icon size={32} />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase opacity-80">Para você agora</p>
            <h3 className="font-display text-xl font-extrabold">{tip.title}</h3>
            <p className="text-sm opacity-90">{tip.text}</p>
          </div>
          <ChevronRight className="opacity-80" />
        </button>
      </section>

      {/* Diário de Sensações - carrossel */}
      <section className="mx-auto mt-6 max-w-md">
        <div className="flex items-end justify-between px-1">
          <Speakable as="h2" text="Como você se sente hoje?" className="font-display text-lg font-bold">
            Como se sente hoje?
          </Speakable>
          <Link to="/timeline" className="flex items-center gap-1 text-xs font-semibold text-primary">
            <History size={14} /> Meu caminho
          </Link>
        </div>

        <div className="mt-3 -mx-5 overflow-x-auto px-5">
          <div className="flex gap-3 pb-3">
            {SYMPTOMS.map(({ key, label, speak: txt, Icon, tone }) => {
              const active = todayEntry?.symptoms.includes(key);
              return (
                <button
                  key={key}
                  onClick={() => { speak(txt); toggleSymptomToday(key); }}
                  className={cn(
                    'flex h-28 w-24 shrink-0 flex-col items-center justify-center gap-2 rounded-3xl transition-soft',
                    active ? 'shadow-pressed scale-95' : 'shadow-soft-sm bg-card',
                    active && TONE_CLASS[tone],
                  )}
                  aria-pressed={active}
                >
                  <Icon size={32} />
                  <span className="text-xs font-bold">{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Triagens rápidas */}
      <section className="mx-auto mt-6 max-w-md">
        <Speakable as="h2" text="Triagens rápidas. Toque se sentir algo." className="font-display text-lg font-bold">
          Triagens rápidas
        </Speakable>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {[
            { to: '/triagem/sangramento', label: 'Sangramento', tone: 'danger' },
            { to: '/triagem/bolsa', label: 'Bolsa rompeu', tone: 'peach' },
            { to: '/triagem/bebe', label: 'Bebê não mexe', tone: 'primary' },
            { to: '/triagem/dor-cabeca', label: 'Dor de cabeça', tone: 'warning' },
          ].map((t) => (
            <button
              key={t.to}
              onClick={() => { speak(t.label); navigate(t.to); }}
              className={cn(
                'rounded-2xl p-4 text-left font-display text-base font-bold shadow-soft-sm transition-soft hover:scale-[1.02]',
                t.tone === 'danger' && 'bg-danger-soft text-danger',
                t.tone === 'peach' && 'bg-peach-soft text-peach-foreground',
                t.tone === 'primary' && 'bg-primary-soft text-primary',
                t.tone === 'warning' && 'bg-warning-soft text-warning-foreground',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>

      {/* Modo Demo */}
      <section className="mx-auto mt-6 max-w-md soft-card-sm p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Modo demo</p>
        <div className="mt-2 flex gap-2">
          <Button
            onClick={() => { speak('Avancei 4 semanas'); advanceWeeks(4); }}
            variant="ghost"
            className="flex-1 rounded-2xl bg-primary-soft text-primary hover:bg-primary-soft"
          >
            <FastForward className="mr-1 h-4 w-4" /> +4 semanas
          </Button>
          <Button
            onClick={() => {
              if (confirm('Apagar todos os dados e refazer setup?')) {
                speak('Resetando');
                resetAll();
              }
            }}
            variant="ghost"
            className="rounded-2xl text-muted-foreground"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </section>

      <MedicalFooter />
    </div>
  );
}
