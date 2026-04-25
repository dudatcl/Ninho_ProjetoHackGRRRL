import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Baby, Heart, Activity, User, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Speakable } from '@/components/Speakable';
import { SpeakerToggle } from '@/components/SpeakerToggle';
import { MedicalFooter } from '@/components/MedicalFooter';
import { useApp } from '@/state/AppState';
import { useSpeech } from '@/hooks/useSpeech';
import type { HealthCondition } from '@/lib/types';
import { cn } from '@/lib/utils';

const STEPS = ['Semanas', 'Filhos', 'Saúde', 'Idade'] as const;

export default function Onboarding() {
  const navigate = useNavigate();
  const { saveProfile } = useApp();
  const { speak } = useSpeech();
  const [step, setStep] = useState(0);

  const [weeks, setWeeks] = useState(20);
  const [hasChildren, setHasChildren] = useState<boolean | null>(null);
  const [conditions, setConditions] = useState<HealthCondition[]>([]);
  const [age, setAge] = useState(28);

  const next = () => setStep((s) => s + 1);

  const finish = () => {
    saveProfile({
      weeks,
      hasOtherChildren: hasChildren ?? false,
      conditions: conditions.length ? conditions : ['nenhum'],
      age,
    });
    navigate('/');
  };

  const toggleCond = (c: HealthCondition) => {
    setConditions((prev) => {
      if (c === 'nenhum') return ['nenhum'];
      const without = prev.filter((x) => x !== 'nenhum');
      return without.includes(c) ? without.filter((x) => x !== c) : [...without, c];
    });
  };

  return (
    <div className="min-h-screen px-5 py-8">
      <header className="mx-auto flex max-w-md items-center justify-between">
        <Speakable as="h1" text="Bem-vinda. Vamos começar." className="font-display text-2xl font-extrabold text-primary">
          Olá 💜
        </Speakable>
        <SpeakerToggle />
      </header>

      {/* Progresso */}
      <div className="mx-auto mt-6 flex max-w-md items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 flex-col items-center gap-1">
            <div
              className={cn(
                'h-2 w-full rounded-full transition-soft',
                i <= step ? 'bg-gradient-belly' : 'bg-muted',
              )}
            />
            <span className={cn('text-xs', i === step ? 'font-bold text-primary' : 'text-muted-foreground')}>
              {label}
            </span>
          </div>
        ))}
      </div>

      <main className="mx-auto mt-8 max-w-md">
        {step === 0 && (
          <section className="soft-card p-6 text-center">
            <Baby className="mx-auto h-20 w-20 text-primary animate-float" />
            <Speakable as="h2" text="Quantas semanas de gravidez você tem?" className="mt-4 font-display text-2xl">
              Quantas semanas?
            </Speakable>
            <p className="mt-2 text-sm text-muted-foreground">Arraste para escolher</p>

            <div className="mt-6 soft-pressed rounded-3xl px-6 py-8">
              <div className="font-display text-7xl font-extrabold text-primary">{weeks}</div>
              <div className="text-sm text-muted-foreground">semanas</div>
              <input
                type="range"
                min={1}
                max={42}
                value={weeks}
                onChange={(e) => setWeeks(Number(e.target.value))}
                onMouseUp={() => speak(`${weeks} semanas`)}
                onTouchEnd={() => speak(`${weeks} semanas`)}
                className="mt-4 w-full accent-[hsl(var(--primary))]"
                aria-label="Semanas de gestação"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1</span><span>20</span><span>42</span>
              </div>
            </div>

            <Button
              onClick={() => { speak('Próximo'); next(); }}
              className="mt-6 h-16 w-full rounded-2xl bg-gradient-peach-cta text-lg font-bold text-peach-foreground shadow-peach-glow"
            >
              Próximo <ChevronRight className="ml-1" />
            </Button>
          </section>
        )}

        {step === 1 && (
          <section className="soft-card p-6 text-center">
            <Heart className="mx-auto h-20 w-20 text-peach animate-float" />
            <Speakable as="h2" text="Você já teve outros filhos?" className="mt-4 font-display text-2xl">
              Já teve filhos?
            </Speakable>
            <div className="mt-6 grid grid-cols-2 gap-4">
              {[
                { v: true, label: 'Sim' },
                { v: false, label: 'Não' },
              ].map((o) => (
                <button
                  key={o.label}
                  onClick={() => { speak(o.label); setHasChildren(o.v); }}
                  className={cn(
                    'rounded-3xl py-10 font-display text-3xl font-bold transition-soft',
                    hasChildren === o.v
                      ? 'bg-gradient-belly text-white shadow-glow'
                      : 'soft-card-sm text-foreground',
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <Button
              disabled={hasChildren === null}
              onClick={() => { speak('Próximo'); next(); }}
              className="mt-6 h-16 w-full rounded-2xl bg-gradient-peach-cta text-lg font-bold text-peach-foreground shadow-peach-glow disabled:opacity-50"
            >
              Próximo <ChevronRight className="ml-1" />
            </Button>
          </section>
        )}

        {step === 2 && (
          <section className="soft-card p-6 text-center">
            <Activity className="mx-auto h-20 w-20 text-warning animate-float" />
            <Speakable as="h2" text="Você tem algum problema de saúde?" className="mt-4 font-display text-2xl">
              Tem algum problema?
            </Speakable>
            <div className="mt-6 space-y-3">
              {([
                { k: 'pressao_alta', label: 'Pressão alta' },
                { k: 'diabetes', label: 'Diabetes' },
                { k: 'nenhum', label: 'Nenhum' },
              ] as { k: HealthCondition; label: string }[]).map((c) => {
                const active = conditions.includes(c.k);
                return (
                  <button
                    key={c.k}
                    onClick={() => { speak(c.label); toggleCond(c.k); }}
                    className={cn(
                      'flex w-full items-center justify-between rounded-2xl px-6 py-5 text-left text-xl font-bold transition-soft',
                      active ? 'bg-warning-soft text-warning-foreground shadow-soft-sm' : 'soft-card-sm',
                    )}
                  >
                    {c.label}
                    {active && <Check className="text-mint-foreground" />}
                  </button>
                );
              })}
            </div>
            <Button
              disabled={conditions.length === 0}
              onClick={() => { speak('Próximo'); next(); }}
              className="mt-6 h-16 w-full rounded-2xl bg-gradient-peach-cta text-lg font-bold text-peach-foreground shadow-peach-glow disabled:opacity-50"
            >
              Próximo <ChevronRight className="ml-1" />
            </Button>
          </section>
        )}

        {step === 3 && (
          <section className="soft-card p-6 text-center">
            <User className="mx-auto h-20 w-20 text-mint-foreground animate-float" />
            <Speakable as="h2" text="Qual é a sua idade?" className="mt-4 font-display text-2xl">
              Sua idade?
            </Speakable>
            <div className="mt-6 soft-pressed rounded-3xl px-6 py-8">
              <div className="font-display text-7xl font-extrabold text-primary">{age}</div>
              <div className="text-sm text-muted-foreground">anos</div>
              <input
                type="range"
                min={12}
                max={55}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                onMouseUp={() => speak(`${age} anos`)}
                onTouchEnd={() => speak(`${age} anos`)}
                className="mt-4 w-full accent-[hsl(var(--primary))]"
                aria-label="Sua idade"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>12</span><span>30</span><span>55</span>
              </div>
            </div>
            <Button
              onClick={() => { speak('Pronto. Vamos começar.'); finish(); }}
              className="mt-6 h-16 w-full rounded-2xl bg-gradient-peach-cta text-lg font-bold text-peach-foreground shadow-peach-glow"
            >
              Começar 💖
            </Button>
          </section>
        )}
      </main>

      <MedicalFooter />
    </div>
  );
}
