import { Link, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { AlertTriangle, Sparkles, BookOpen, ChevronRight, FastForward, RotateCcw, History, Heart, Droplet, Brain, Baby, Thermometer, CloudRain } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Speakable } from '@/components/Speakable';
import { SpeakerToggle } from '@/components/SpeakerToggle';
import { PregnancyRing } from '@/components/PregnancyRing';
import { MedicalFooter } from '@/components/MedicalFooter';
import { SYMPTOMS, TONE_CLASS } from '@/lib/symptoms';
import { useApp } from '@/state/AppState';
import { useSpeech } from '@/hooks/useSpeech';
import { todayKey } from '@/lib/storage';
import type { Stage } from '@/lib/types';
import { cn } from '@/lib/utils';

// Mensagens contextuais para grávidas (por trimestre)
function smartTipPregnant(week: number) {
  if (week <= 12) {
    return {
      title: 'Dicas para enjoos',
      text: 'Coma pouco e devagar. Beba água com limão.',
      tone: 'mint' as const,
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
      to: '/diario',
      Icon: BookOpen,
      pulse: false,
    };
  }
  return {
    title: 'Sinais de alerta para o parto',
    text: 'Bolsa, contrações, sangramento. Saiba o que fazer.',
    tone: 'peach' as const,
    to: '/triagem/parto',
    Icon: AlertTriangle,
    pulse: true,
  };
}

// Mensagens contextuais pós-parto (por dias)
function smartTipPostpartum(days: number) {
  if (days <= 14) {
    return {
      title: 'Sangramento e descanso',
      text: 'É normal sangrar até 6 semanas. Repouse muito.',
      tone: 'peach' as const,
      to: '/triagem/sangramento-pos',
      Icon: Heart,
      pulse: true,
    };
  }
  if (days <= 60) {
    return {
      title: 'Como você está se sentindo?',
      text: 'Tristeza não é fraqueza. Tem ajuda.',
      tone: 'primary' as const,
      to: '/triagem/tristeza-pos',
      Icon: CloudRain,
      pulse: false,
    };
  }
  return {
    title: 'Cuidando de você',
    text: 'Marque a consulta de pós-parto.',
    tone: 'mint' as const,
    to: '/timeline',
    Icon: Sparkles,
    pulse: false,
  };
}

interface TriageTile {
  to: string;
  label: string;
  Icon: LucideIcon;
  tone: 'danger' | 'peach' | 'primary' | 'warning' | 'mint';
}

const TRIAGE_BY_STAGE: Record<Stage, TriageTile[]> = {
  pregnant: [
    { to: '/triagem/sangramento', label: 'Sangramento',     Icon: Droplet,        tone: 'danger' },
    { to: '/triagem/dor-cabeca',  label: 'Dor de cabeça',   Icon: Brain,          tone: 'warning' },
    { to: '/triagem/bebe',        label: 'Bebê não mexe',   Icon: Baby,           tone: 'primary' },
    { to: '/triagem/bolsa',       label: 'Bolsa rompeu',    Icon: CloudRain,      tone: 'peach' },
  ],
  postpartum: [
    { to: '/triagem/febre',            label: 'Febre',                Icon: Thermometer, tone: 'danger' },
    { to: '/triagem/sangramento-pos',  label: 'Sangra muito',         Icon: Droplet,     tone: 'danger' },
    { to: '/triagem/tristeza-pos',     label: 'Tristeza profunda',    Icon: CloudRain,   tone: 'primary' },
    { to: '/triagem/dor-cabeca',       label: 'Dor de cabeça',        Icon: Brain,       tone: 'warning' },
  ],
};

const TILE_TONE: Record<TriageTile['tone'], string> = {
  danger:  'bg-danger-soft text-danger',
  peach:   'bg-peach-soft text-peach-foreground',
  primary: 'bg-primary-soft text-primary',
  warning: 'bg-warning-soft text-warning-foreground',
  mint:    'bg-mint-soft text-mint-foreground',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile, currentWeek, daysToBirth, diary, toggleSymptomToday, advanceWeeks, consecutiveDaysWith, resetAll } = useApp();
  const { speak } = useSpeech();

  if (!profile) return null;
  const isPostpartum = profile.stage === 'postpartum';

  const totalPostpartumDays = isPostpartum
    ? profile.postpartumDays + profile.demoOffsetWeeks * 7
    : 0;

  const tip = useMemo(
    () => (isPostpartum ? smartTipPostpartum(totalPostpartumDays) : smartTipPregnant(currentWeek)),
    [isPostpartum, totalPostpartumDays, currentWeek],
  );

  const triageTiles = TRIAGE_BY_STAGE[profile.stage];

  const todayEntry = diary.find((e) => e.date === todayKey());
  const painStreak = consecutiveDaysWith('dor');
  const headacheStreak = consecutiveDaysWith('dor_cabeca');

  return (
    <div className="min-h-screen px-5 py-6">
      <header className="mx-auto flex max-w-md items-center justify-between">
        <div>
          <Speakable as="h1" text="Olá. Bem-vinda de volta." className="font-display text-2xl font-extrabold text-primary">
            Olá, {isPostpartum ? 'mamãe 💖' : 'mamãe 💜'}
          </Speakable>
          <p className="text-sm text-muted-foreground">
            {profile.age} anos · {isPostpartum ? 'Pós-parto' : 'Gravidez'} ·{' '}
            {profile.hasOtherChildren ? 'Já é mãe' : 'Primeira vez'}
          </p>
        </div>
        <SpeakerToggle />
      </header>

      {/* Alerta amarelo: 3 dias seguidos */}
      {(painStreak >= 3 || headacheStreak >= 3) && (
        <button
          onClick={() => {
            speak('Você marcou esse sintoma 3 dias seguidos. Toque para triagem.');
            navigate(headacheStreak >= 3 ? '/triagem/dor-cabeca' : (isPostpartum ? '/triagem/sangramento-pos' : '/triagem/sangramento'));
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

      {/* Anel / Cabeçalho contextual */}
      <section className="mx-auto mt-6 flex max-w-md flex-col items-center soft-card p-6">
        {isPostpartum ? (
          <PostpartumHeader days={totalPostpartumDays} />
        ) : (
          <>
            <PregnancyRing week={currentWeek} daysToBirth={daysToBirth} />
            <Speakable
              as="p"
              text={`Você está na semana ${currentWeek}. Faltam ${daysToBirth} dias.`}
              className="mt-3 text-sm text-muted-foreground"
            >
              Toque para ouvir
            </Speakable>
          </>
        )}
      </section>

      {/* TRIAGENS RÁPIDAS — destaque máximo */}
      <section className="mx-auto mt-6 max-w-md">
        <Speakable as="h2" text="Triagens rápidas. Toque se sentir algo." className="px-1 font-display text-lg font-bold">
          Triagens rápidas
        </Speakable>
        <p className="px-1 text-xs text-muted-foreground">Toque no que está sentindo agora</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {triageTiles.map((t) => (
            <button
              key={t.to}
              onClick={() => { speak(t.label); navigate(t.to); }}
              className={cn(
                'group flex aspect-square flex-col items-start justify-between rounded-3xl p-5 text-left shadow-soft transition-soft hover:scale-[1.03] active:scale-95',
                TILE_TONE[t.tone],
              )}
            >
              <div className={cn(
                'rounded-2xl p-2.5',
                t.tone === 'danger' && 'bg-danger/15',
                t.tone === 'peach' && 'bg-white/50',
                t.tone === 'primary' && 'bg-white/60',
                t.tone === 'warning' && 'bg-white/50',
                t.tone === 'mint' && 'bg-white/50',
              )}>
                <t.Icon size={32} strokeWidth={2.2} />
              </div>
              <div>
                <p className="font-display text-lg font-extrabold leading-tight">{t.label}</p>
                <ChevronRight className="mt-1 opacity-70" size={18} />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Card inteligente temporal */}
      <section className="mx-auto mt-6 max-w-md">
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

      {/* Diário de Sensações */}
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

function PostpartumHeader({ days }: { days: number }) {
  const weeks = Math.floor(days / 7);
  const phase =
    days <= 14 ? 'Resguardo'
    : days <= 45 ? 'Quarentena'
    : days <= 180 ? 'Puerpério tardio'
    : 'Pós-parto longo';

  return (
    <div className="flex w-full flex-col items-center text-center">
      <div className="rounded-full bg-gradient-peach-cta p-6 shadow-peach-glow">
        <Heart size={64} className="text-peach-foreground" />
      </div>
      <Speakable
        as="div"
        text={`Você está há ${days} dias do parto. Fase: ${phase}.`}
        className="mt-4"
      >
        <p className="font-display text-5xl font-extrabold text-peach-foreground">{days}</p>
        <p className="text-sm uppercase tracking-widest text-muted-foreground">
          {days === 1 ? 'dia' : 'dias'} do parto
        </p>
        <p className="mt-2 text-xs font-bold text-primary">
          {weeks} {weeks === 1 ? 'semana' : 'semanas'} · {phase}
        </p>
      </Speakable>
    </div>
  );
}
