import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Phone, MapPin, RotateCcw, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Speakable } from '@/components/Speakable';
import { SpeakerToggle } from '@/components/SpeakerToggle';
import { MedicalFooter } from '@/components/MedicalFooter';
import { FLOWS, RESULT_TEXT, type TriageColor } from '@/lib/triage';
import { useApp } from '@/state/AppState';
import { useSpeech } from '@/hooks/useSpeech';
import { cn } from '@/lib/utils';

export default function Triage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { profile } = useApp();
  const { speak } = useSpeech();
  const flow = slug ? FLOWS[slug] : undefined;

  const profileBranch = useMemo<TriageColor | undefined>(() => {
    if (!flow || !profile || !flow.branchOnProfile) return undefined;
    return flow.branchOnProfile({ conditions: profile.conditions, weeks: profile.weeks });
  }, [flow, profile]);

  const [nodeId, setNodeId] = useState<string | null>(flow?.start ?? null);
  const [result, setResult] = useState<TriageColor | null>(profileBranch ?? null);

  useEffect(() => {
    if (profileBranch) {
      speak('Pelo seu perfil, isso requer atenção urgente.');
    }
  }, [profileBranch, speak]);

  if (!flow) {
    return (
      <div className="min-h-screen p-6">
        <p>Triagem não encontrada.</p>
        <Link to="/" className="text-primary underline">Voltar</Link>
      </div>
    );
  }

  const node = nodeId ? flow.nodes[nodeId] : null;

  const restart = () => {
    setResult(profileBranch ?? null);
    setNodeId(flow.start);
  };

  return (
    <div className="min-h-screen px-5 py-6">
      <header className="mx-auto flex max-w-md items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-primary">
          <ArrowLeft /> <span className="font-bold">Voltar</span>
        </Link>
        <SpeakerToggle />
      </header>

      <div className="mx-auto mt-4 max-w-md">
        <div className="text-5xl">{flow.emoji}</div>
        <Speakable as="h1" text={flow.title} className="mt-1 font-display text-3xl font-extrabold text-primary">
          {flow.title}
        </Speakable>
      </div>

      <main className="mx-auto mt-6 max-w-md">
        {!result && node && (
          <section className="soft-card p-6">
            <Speakable as="h2" text={node.speak || node.question} className="font-display text-2xl font-bold">
              {node.question}
            </Speakable>
            <div className="mt-5 space-y-3">
              {node.options.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => {
                    speak(opt.label);
                    if (opt.result) setResult(opt.result);
                    else if (opt.next) setNodeId(opt.next);
                  }}
                  className="flex w-full items-center justify-between rounded-2xl bg-primary-soft px-5 py-5 text-left font-bold text-primary shadow-soft-sm transition-soft hover:scale-[1.01]"
                >
                  <span className="text-lg">{opt.label}</span>
                  <ChevronRight />
                </button>
              ))}
            </div>
          </section>
        )}

        {result && <ResultCard color={result} onRestart={restart} />}
      </main>

      <MedicalFooter />
    </div>
  );
}

function ResultCard({ color, onRestart }: { color: TriageColor; onRestart: () => void }) {
  const r = RESULT_TEXT[color];
  const { speak } = useSpeech();

  useEffect(() => {
    speak(`${r.title}. ${r.advice}`);
  }, [r.title, r.advice, speak]);

  return (
    <section
      className={cn(
        'rounded-3xl p-6 text-center shadow-soft',
        color === 'green' && 'bg-mint-soft text-mint-foreground',
        color === 'yellow' && 'bg-warning-soft text-warning-foreground',
        color === 'red' && 'bg-danger text-danger-foreground animate-pulse-glow',
      )}
    >
      <div className="text-6xl">
        {color === 'green' ? '💚' : color === 'yellow' ? '⚠️' : '🚨'}
      </div>
      <h2 className="mt-3 font-display text-3xl font-extrabold">{r.title}</h2>
      <p className="mt-2 text-lg">{r.advice}</p>

      <div className="mt-6 space-y-3">
        {color === 'red' && (
          <a
            href="tel:192"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-5 text-lg font-extrabold text-danger shadow-soft-sm"
          >
            <Phone /> Ligar SAMU 192
          </a>
        )}
        {(color === 'red' || color === 'yellow') && (
          <a
            href="https://www.google.com/maps/search/UBS+ou+hospital+perto+de+mim"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-card py-4 text-base font-bold text-primary shadow-soft-sm"
          >
            <MapPin /> UBS mais próxima
          </a>
        )}
        <Button
          variant="ghost"
          onClick={onRestart}
          className={cn(
            'w-full rounded-2xl py-4',
            color === 'red' ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-card/60 text-foreground',
          )}
        >
          <RotateCcw className="mr-2 h-4 w-4" /> Refazer triagem
        </Button>
      </div>
    </section>
  );
}
