// Tipos centrais do app
export type SymptomKey =
  | 'feliz'
  | 'cansada'
  | 'enjoo'
  | 'dor'
  | 'sangramento'
  | 'inchaco'
  | 'dor_cabeca'
  | 'bebe_mexeu';

export interface ProfileData {
  weeks: number;          // semana de gestação (1-42)
  hasOtherChildren: boolean;
  conditions: HealthCondition[];
  age: number;
  createdAt: string;      // ISO da data do setup
  demoOffsetWeeks: number; // soma das semanas avançadas no modo demo
}

export type HealthCondition = 'pressao_alta' | 'diabetes' | 'nenhum';

export interface DiaryEntry {
  date: string;     // YYYY-MM-DD
  symptoms: SymptomKey[];
}
