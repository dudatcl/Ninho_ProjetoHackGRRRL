interface Props {
  week: number;          // 1 a 42
  daysToBirth: number;
}

// Círculo de progresso da gestação (40 semanas)
export function PregnancyRing({ week, daysToBirth }: Props) {
  const total = 40;
  const pct = Math.min(1, week / total);
  const size = 220;
  const stroke = 18;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(265 60% 75%)" />
            <stop offset="100%" stopColor="hsl(18 90% 75%)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="hsl(var(--primary-soft))"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#ringGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm uppercase tracking-widest text-muted-foreground">Semana</span>
        <span className="font-display text-6xl font-extrabold text-primary leading-none">
          {week}
        </span>
        <span className="mt-2 text-sm text-foreground/70">
          {daysToBirth > 0 ? `${daysToBirth} dias para o bebê` : 'Bebê já pode chegar 💖'}
        </span>
      </div>
    </div>
  );
}
