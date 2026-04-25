import type { HealthCondition } from './types';

export type TriageColor = 'green' | 'yellow' | 'red';

export interface TriageNode {
  id: string;
  question: string;          // até 3 palavras / curto
  speak?: string;            // texto longo opcional para TTS
  options: TriageOption[];
}

export interface TriageOption {
  label: string;
  next?: string;             // id do próximo nó
  result?: TriageColor;      // resultado final
}

export interface TriageFlow {
  slug: string;
  title: string;
  emoji: string;
  start: string;
  // Permite redirecionar o início conforme o perfil (ex: pressão alta + dor de cabeça → vermelho)
  branchOnProfile?: (profile: { conditions: HealthCondition[]; weeks: number }) => TriageColor | undefined;
  nodes: Record<string, TriageNode>;
}

export const RESULT_TEXT: Record<TriageColor, { title: string; advice: string; phone?: string }> = {
  green: {
    title: 'Tudo parece bem',
    advice: 'Descanse. Beba água. Marque consulta de rotina.',
  },
  yellow: {
    title: 'Atenção',
    advice: 'Procure sua UBS hoje. Não espere piorar.',
  },
  red: {
    title: 'Urgente',
    advice: 'Vá ao hospital agora. Ligue 192 se precisar.',
    phone: '192',
  },
};

// ----- Fluxos -----

export const FLOWS: Record<string, TriageFlow> = {
  sangramento: {
    slug: 'sangramento',
    title: 'Sangramento',
    emoji: '🩸',
    start: 'q1',
    nodes: {
      q1: {
        id: 'q1',
        question: 'O sangue é como?',
        options: [
          { label: 'Vermelho vivo', next: 'q2' },
          { label: 'Marrom escuro', next: 'q3' },
          { label: 'Só uma gotinha', result: 'yellow' },
        ],
      },
      q2: {
        id: 'q2',
        question: 'Tem dor forte?',
        options: [
          { label: 'Sim', result: 'red' },
          { label: 'Não', result: 'red' },
        ],
      },
      q3: {
        id: 'q3',
        question: 'Acompanha cólica?',
        options: [
          { label: 'Sim', result: 'yellow' },
          { label: 'Não', result: 'yellow' },
        ],
      },
    },
  },
  bolsa: {
    slug: 'bolsa',
    title: 'Bolsa rompeu',
    emoji: '💧',
    start: 'q1',
    nodes: {
      q1: {
        id: 'q1',
        question: 'Cor do líquido?',
        options: [
          { label: 'Transparente', next: 'q2' },
          { label: 'Esverdeado', result: 'red' },
          { label: 'Com sangue', result: 'red' },
        ],
      },
      q2: {
        id: 'q2',
        question: 'Está com contração?',
        options: [
          { label: 'Sim, forte', result: 'red' },
          { label: 'Pouca', result: 'yellow' },
          { label: 'Nenhuma', result: 'yellow' },
        ],
      },
    },
  },
  bebe: {
    slug: 'bebe',
    title: 'Bebê não mexe',
    emoji: '👶',
    start: 'q1',
    nodes: {
      q1: {
        id: 'q1',
        question: 'Há quanto tempo?',
        options: [
          { label: 'Algumas horas', next: 'q2' },
          { label: 'Mais de 12h', result: 'red' },
          { label: 'Hoje todo', result: 'red' },
        ],
      },
      q2: {
        id: 'q2',
        question: 'Já comeu algo doce?',
        speak: 'Coma algo doce e deite de lado',
        options: [
          { label: 'Vou tentar agora', result: 'yellow' },
          { label: 'Já tentei, nada', result: 'red' },
        ],
      },
    },
  },
  'dor-cabeca': {
    slug: 'dor-cabeca',
    title: 'Dor de cabeça',
    emoji: '🤕',
    start: 'q1',
    // Se a usuária tem pressão alta, vai direto para vermelho
    branchOnProfile: ({ conditions }) =>
      conditions.includes('pressao_alta') ? 'red' : undefined,
    nodes: {
      q1: {
        id: 'q1',
        question: 'A dor é forte?',
        options: [
          { label: 'Muito forte', next: 'q2' },
          { label: 'Mais ou menos', next: 'q3' },
          { label: 'Fraca', result: 'green' },
        ],
      },
      q2: {
        id: 'q2',
        question: 'Vê pontinhos de luz?',
        options: [
          { label: 'Sim', result: 'red' },
          { label: 'Não', result: 'yellow' },
        ],
      },
      q3: {
        id: 'q3',
        question: 'Está inchada?',
        options: [
          { label: 'Sim', result: 'yellow' },
          { label: 'Não', result: 'green' },
        ],
      },
    },
  },
  parto: {
    slug: 'parto',
    title: 'Sinais de parto',
    emoji: '🌸',
    start: 'q1',
    nodes: {
      q1: {
        id: 'q1',
        question: 'Como estão as contrações?',
        options: [
          { label: 'Sem contração', result: 'green' },
          { label: 'A cada 10 min', next: 'q2' },
          { label: 'A cada 5 min', result: 'red' },
        ],
      },
      q2: {
        id: 'q2',
        question: 'A bolsa rompeu?',
        options: [
          { label: 'Sim', result: 'red' },
          { label: 'Não', result: 'yellow' },
        ],
      },
    },
  },
  'dicas-enjoo': {
    slug: 'dicas-enjoo',
    title: 'Dicas para enjoos',
    emoji: '🍋',
    start: 'q1',
    nodes: {
      q1: {
        id: 'q1',
        question: 'Como é o enjoo?',
        options: [
          { label: 'Só de manhã', result: 'green' },
          { label: 'O dia todo', next: 'q2' },
          { label: 'Vomito tudo', result: 'yellow' },
        ],
      },
      q2: {
        id: 'q2',
        question: 'Consegue beber água?',
        options: [
          { label: 'Sim', result: 'green' },
          { label: 'Não', result: 'yellow' },
        ],
      },
    },
  },
};
