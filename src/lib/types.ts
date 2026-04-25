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

export type Stage = 'pregnant' | 'postpartum';

export interface ProfileData {
  stage: Stage;             // grávida ou pós-parto
  weeks: number;            // semanas de gestação (1-42) — apenas se stage='pregnant'
  postpartumDays: number;   // dias desde o parto — apenas se stage='postpartum'
  hasOtherChildren: boolean;
  conditions: HealthCondition[];
  age: number;
  createdAt: string;
  demoOffsetWeeks: number;
}

export type HealthCondition = 'pressao_alta' | 'diabetes' | 'nenhum';

export interface DiaryEntry {
  date: string;
  symptoms: SymptomKey[];
}
