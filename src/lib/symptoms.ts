import { Smile, BatteryLow, AlertCircle, Droplet, Activity, Brain, Baby, Frown } from 'lucide-react';
import type { SymptomKey } from '@/lib/types';

interface SymptomMeta {
  key: SymptomKey;
  label: string;        // até 3 palavras
  speak: string;        // texto falado
  Icon: typeof Smile;
  tone: 'mint' | 'peach' | 'warning' | 'danger' | 'primary';
}

export const SYMPTOMS: SymptomMeta[] = [
  { key: 'feliz',       label: 'Feliz',         speak: 'Eu me sinto feliz hoje', Icon: Smile,       tone: 'mint' },
  { key: 'cansada',     label: 'Cansada',       speak: 'Eu estou cansada hoje',  Icon: BatteryLow,  tone: 'primary' },
  { key: 'enjoo',       label: 'Enjoo',         speak: 'Estou com enjoo',        Icon: Frown,       tone: 'peach' },
  { key: 'dor',         label: 'Dor',           speak: 'Estou sentindo dor',     Icon: AlertCircle, tone: 'warning' },
  { key: 'sangramento', label: 'Sangramento',   speak: 'Tive sangramento',       Icon: Droplet,    tone: 'danger' },
  { key: 'inchaco',     label: 'Inchaço',       speak: 'Estou inchada',          Icon: Activity,    tone: 'warning' },
  { key: 'dor_cabeca',  label: 'Dor de cabeça', speak: 'Estou com dor de cabeça',Icon: Brain,       tone: 'warning' },
  { key: 'bebe_mexeu',  label: 'Bebê mexeu',    speak: 'O bebê mexeu hoje',      Icon: Baby,        tone: 'mint' },
];

export const TONE_CLASS: Record<SymptomMeta['tone'], string> = {
  mint:    'bg-mint-soft text-mint-foreground',
  peach:   'bg-peach-soft text-peach-foreground',
  warning: 'bg-warning-soft text-warning-foreground',
  danger:  'bg-danger-soft text-danger',
  primary: 'bg-primary-soft text-primary',
};
