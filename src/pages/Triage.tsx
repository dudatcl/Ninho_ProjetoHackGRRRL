import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Phone, MapPin, RotateCcw, ChevronRight, Home, Info, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Speakable } from '@/components/Speakable';
import { SpeakerToggle } from '@/components/SpeakerToggle';
import { MedicalFooter } from '@/components/MedicalFooter';
import { FLOWS, RESULT_TEXT, getHomeCare, type TriageColor, type TriageFlow } from '@/lib/triage';
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
    return flow.branchOnProfile({
      conditions: profile.conditions,
      weeks: profile.weeks,
      stage: profile.stage,
    });
  }, [flow, profile]);

  const [nodeId, setNodeId] = useState<string | null>(flow?.start ?? null);
  const [result, setResult] = useState<TriageColor | null>(profileBranch ?? null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Auto-leitura: lê o título ao abrir a triagem
  useEffect(() => {
    if (flow && !profileBranch) {
      speak(flow.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flow?.slug]);

  // Auto-leitura: lê a pergunta sempre que o nó muda
  useEffect(() => {
    if (!result && nodeId && flow?.nodes[nodeId]) {
      const n = flow.nodes[nodeId];
      // pequeno delay para não cortar a fala anterior
      const t = setTimeout(() => speak(n.speak || n.question), 350);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeId, result]);

  // Reset seleção ao trocar de nó
  useEffect(() => {
    setSelectedOption(null);
  }, [nodeId]);

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

        {result && <ResultCard color={result} flow={flow} onRestart={restart} />}
      </main>

      <MedicalFooter />
    </div>
  );
}

function ResultCard({ color, flow, onRestart }: { color: TriageColor; flow: TriageFlow; onRestart: () => void }) {
  const r = RESULT_TEXT[color];
  const home = getHomeCare(flow, color);
  const { speak } = useSpeech();

  useEffect(() => {
    speak(`${r.title}. ${r.advice}`);
  }, [r.title, r.advice, speak]);

  return (
    <div className="space-y-4">
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
        <Speakable as="h2" text={r.title} className="mt-3 font-display text-3xl font-extrabold">
          {r.title}
        </Speakable>
        <Speakable as="p" text={r.advice} className="mt-2 text-lg">
          {r.advice}
        </Speakable>

        <div className="mt-6 space-y-3">
          {color === 'red' && (
            <a
              href="tel:192"
              onClick={() => speak('Ligando SAMU 192')}
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
              onClick={() => speak('Abrindo mapa')}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-card py-4 text-base font-bold text-primary shadow-soft-sm"
            >
              <MapPin /> UBS mais próxima
            </a>
          )}
        </div>
      </section>

      {/* Cuidados em casa */}
      <section
        className={cn(
          'rounded-3xl p-6 shadow-soft-sm',
          color === 'green' && 'bg-mint-soft/60',
          color === 'yellow' && 'bg-warning-soft/60',
          color === 'red' && 'bg-peach-soft',
        )}
      >
        <div className="flex items-center gap-2">
          <Home className="text-primary" />
          <Speakable as="h3" text={r.homeCareTitle} className="font-display text-xl font-extrabold text-primary">
            {r.homeCareTitle}
          </Speakable>
        </div>

        <Speakable
          as="div"
          text={home.why}
          className="mt-3 flex items-start gap-2 rounded-2xl bg-white/70 p-3 text-sm text-foreground"
        >
          <Info size={18} className="mt-0.5 shrink-0 text-primary" />
          <span>{home.why}</span>
        </Speakable>

        <ul className="mt-4 space-y-2">
          {home.tips.map((tip) => (
            <li key={tip}>
              <Speakable
                as="div"
                text={tip}
                className="flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 text-base font-semibold text-foreground shadow-soft-sm"
              >
                <CheckCircle2 size={20} className="shrink-0 text-mint-foreground" />
                <span>{tip}</span>
              </Speakable>
            </li>
          ))}
        </ul>
      </section>

      <Button
        variant="ghost"
        onClick={onRestart}
        className="w-full rounded-2xl bg-card/60 py-4 text-foreground"
      >
        <RotateCcw className="mr-2 h-4 w-4" /> Refazer triagem
      </Button>
    </div>
  );
}
