import { Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, CalendarDays } from 'lucide-react';
import { Speakable } from '@/components/Speakable';
import { SpeakerToggle } from '@/components/SpeakerToggle';
import { MedicalFooter } from '@/components/MedicalFooter';
import { SYMPTOMS, TONE_CLASS } from '@/lib/symptoms';
import { useApp } from '@/state/AppState';
import type { SymptomKey } from '@/lib/types';

function formatDate(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
}

export default function Timeline() {
  const { diary, consecutiveDaysWith } = useApp();
  const sorted = [...diary].sort((a, b) => (a.date < b.date ? 1 : -1));

  const alerts: { key: SymptomKey; label: string; days: number }[] = [];
  (['dor', 'dor_cabeca', 'sangramento', 'inchaco'] as SymptomKey[]).forEach((s) => {
    const days = consecutiveDaysWith(s);
    if (days >= 3) {
      const meta = SYMPTOMS.find((x) => x.key === s)!;
      alerts.push({ key: s, label: meta.label, days });
    }
  });

  return (
    <div className="min-h-screen px-5 py-6">
      <header className="mx-auto flex max-w-md items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-primary">
          <ArrowLeft /> <span className="font-bold">Voltar</span>
        </Link>
        <SpeakerToggle />
      </header>

      <Speakable as="h1" text="Meu caminho. Os dias que você marcou." className="mx-auto mt-4 max-w-md font-display text-3xl font-extrabold text-primary">
        Meu caminho
      </Speakable>
      <p className="mx-auto max-w-md text-sm text-muted-foreground">Histórico das suas sensações</p>

      {alerts.map((a) => (
        <div key={a.key} className="mx-auto mt-5 flex max-w-md items-center gap-3 rounded-2xl bg-warning-soft p-4 shadow-soft-sm">
          <AlertTriangle className="shrink-0 text-warning-foreground" />
          <div>
            <p className="font-bold text-warning-foreground">
              {a.label} há {a.days} dias seguidos
            </p>
            <p className="text-xs text-warning-foreground/80">Considere procurar atendimento</p>
          </div>
        </div>
      ))}

      <main className="mx-auto mt-6 max-w-md">
        {sorted.length === 0 ? (
          <div className="soft-card p-8 text-center">
            <CalendarDays className="mx-auto h-16 w-16 text-primary/60" />
            <p className="mt-4 font-bold">Ainda sem registros</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Toque nos ícones de sensação na tela inicial.
            </p>
          </div>
        ) : (
          <ol className="space-y-4">
            {sorted.map((entry) => (
              <li key={entry.date} className="soft-card-sm p-4">
                <div className="flex items-center gap-2 text-sm font-bold capitalize text-primary">
                  <CalendarDays size={16} /> {formatDate(entry.date)}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {entry.symptoms.map((s) => {
                    const meta = SYMPTOMS.find((x) => x.key === s);
                    if (!meta) return null;
                    const Icon = meta.Icon;
                    return (
                      <span
                        key={s}
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${TONE_CLASS[meta.tone]}`}
                      >
                        <Icon size={14} /> {meta.label}
                      </span>
                    );
                  })}
                </div>
              </li>
            ))}
          </ol>
        )}
      </main>

      <MedicalFooter />
    </div>
  );
}
