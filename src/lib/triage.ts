import type { HealthCondition, Stage } from './types';

export type TriageColor = 'green' | 'yellow' | 'red';

export interface TriageNode {
  id: string;
  question: string;
  speak?: string;
  options: TriageOption[];
}

export interface TriageOption {
  label: string;
  next?: string;
  result?: TriageColor;
}

export interface TriageFlow {
  slug: string;
  title: string;
  emoji: string;
  start: string;
  stages?: Stage[]; // perfis para os quais essa triagem aparece (default: ambos)
  branchOnProfile?: (profile: { conditions: HealthCondition[]; weeks: number; stage: Stage }) => TriageColor | undefined;
  nodes: Record<string, TriageNode>;
  // Orientações de "Cuidados em Casa" personalizadas por cor (sobrescreve o default)
  homeCare?: Partial<Record<TriageColor, HomeCare>>;
}

export interface HomeCare {
  why: string;          // por que está acontecendo / contexto
  tips: string[];       // 3-5 dicas curtas
}

export interface ResultContent {
  title: string;
  advice: string;
  phone?: string;
  homeCareTitle: string;
}

export const RESULT_TEXT: Record<TriageColor, ResultContent> = {
  green: {
    title: 'Tudo parece bem',
    advice: 'Descanse. Beba água. Marque consulta de rotina.',
    homeCareTitle: 'Cuidados em casa',
  },
  yellow: {
    title: 'Atenção',
    advice: 'Procure sua UBS hoje. Não espere piorar.',
    homeCareTitle: 'Enquanto vai ao posto',
  },
  red: {
    title: 'Urgente',
    advice: 'Vá ao hospital agora. Ligue 192 se precisar.',
    phone: '192',
    homeCareTitle: 'Faça agora',
  },
};

// ---------------- Cuidados padrão ----------------
const DEFAULT_HOME_CARE: Record<TriageColor, HomeCare> = {
  green: {
    why: 'Pode ser comum nessa fase. Seu corpo está mudando.',
    tips: [
      'Beba bastante água',
      'Descanse com as pernas elevadas',
      'Evite ficar em pé muito tempo',
      'Coma pequenas porções',
    ],
  },
  yellow: {
    why: 'Precisa de olhar profissional. Não é emergência ainda.',
    tips: [
      'Anote o horário do sintoma',
      'Meça temperatura se tiver',
      'Beba água, evite remédio por conta',
      'Vá à UBS hoje mesmo',
    ],
  },
  red: {
    why: 'É emergência. Cada minuto conta.',
    tips: [
      'Deite do lado esquerdo',
      'Não coma nem beba nada',
      'Chame alguém para te levar',
      'Leve seu cartão de pré-natal',
      'Ligue 192 se estiver sozinha',
    ],
  },
};

export function getHomeCare(flow: TriageFlow, color: TriageColor): HomeCare {
  return flow.homeCare?.[color] ?? DEFAULT_HOME_CARE[color];
}

// ---------------- Fluxos ----------------

export const FLOWS: Record<string, TriageFlow> = {
  sangramento: {
    slug: 'sangramento',
    title: 'Sangramento',
    emoji: '🩸',
    start: 'q1',
    stages: ['pregnant'],
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
    homeCare: {
      red: {
        why: 'Sangramento vivo na gravidez exige avaliação imediata.',
        tips: [
          'Deite do lado esquerdo',
          'Use absorvente, NÃO use tampão',
          'Não coma nem beba',
          'Vá ao hospital agora',
          'Leve o cartão de pré-natal',
        ],
      },
      yellow: {
        why: 'Pequenos sangramentos podem ocorrer, mas precisam ser vistos.',
        tips: [
          'Repouse, evite esforço',
          'Use absorvente para ver a quantidade',
          'Sem relação sexual hoje',
          'Vá à UBS no mesmo dia',
        ],
      },
    },
  },
  bolsa: {
    slug: 'bolsa',
    title: 'Bolsa rompeu',
    emoji: '💧',
    start: 'q1',
    stages: ['pregnant'],
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
    homeCare: {
      red: {
        why: 'A bolsa rompida exige hospital. O bebê pode estar a caminho.',
        tips: [
          'Anote a hora que rompeu',
          'Use absorvente grande',
          'Não tome banho de banheira',
          'Vá ao hospital agora',
          'Leve a bolsa da maternidade',
        ],
      },
    },
  },
  bebe: {
    slug: 'bebe',
    title: 'Bebê não mexe',
    emoji: '👶',
    start: 'q1',
    stages: ['pregnant'],
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
    homeCare: {
      yellow: {
        why: 'Bebês descansam, mas precisam mexer várias vezes ao dia.',
        tips: [
          'Coma algo doce (suco, fruta)',
          'Deite do lado esquerdo',
          'Conte os movimentos por 1h',
          'Se não mexer 6 vezes, vá à UBS',
        ],
      },
      red: {
        why: 'A diminuição de movimento pode indicar sofrimento fetal.',
        tips: [
          'Vá ao hospital agora',
          'Não espere mais nenhum minuto',
          'Leve cartão de pré-natal',
          'Peça para alguém te levar',
        ],
      },
    },
  },
  'dor-cabeca': {
    slug: 'dor-cabeca',
    title: 'Dor de cabeça',
    emoji: '🤕',
    start: 'q1',
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
    homeCare: {
      green: {
        why: 'Dor de cabeça leve é comum por cansaço, jejum ou pouca água.',
        tips: [
          'Beba 2 copos de água',
          'Coma uma fruta',
          'Descanse no escuro 20 min',
          'Compressa fria na testa',
        ],
      },
      yellow: {
        why: 'Pode ser sinal de pressão subindo. Não ignore.',
        tips: [
          'Meça a pressão se puder',
          'Evite barulho e luz forte',
          'Não tome remédio sem orientação',
          'Vá à UBS hoje',
        ],
      },
      red: {
        why: 'Dor forte com visão alterada pode ser pré-eclâmpsia.',
        tips: [
          'Vá ao hospital AGORA',
          'Deite do lado esquerdo',
          'Não coma nem beba',
          'Ligue 192 se estiver sozinha',
          'Leve cartão de pré-natal',
        ],
      },
    },
  },
  parto: {
    slug: 'parto',
    title: 'Sinais de parto',
    emoji: '🌸',
    start: 'q1',
    stages: ['pregnant'],
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
    stages: ['pregnant'],
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
    homeCare: {
      green: {
        why: 'Enjoo é comum, principalmente nas primeiras semanas.',
        tips: [
          'Coma biscoito antes de levantar',
          'Faça refeições pequenas',
          'Chá de gengibre ou hortelã',
          'Evite cheiros fortes',
        ],
      },
    },
  },

  // ---------------- Pós-parto ----------------
  febre: {
    slug: 'febre',
    title: 'Febre',
    emoji: '🌡️',
    start: 'q1',
    stages: ['postpartum'],
    nodes: {
      q1: {
        id: 'q1',
        question: 'Qual a temperatura?',
        options: [
          { label: 'Menos de 37,8', result: 'green' },
          { label: 'Entre 37,8 e 38,5', next: 'q2' },
          { label: 'Mais de 38,5', result: 'red' },
        ],
      },
      q2: {
        id: 'q2',
        question: 'Tem dor no peito ou seio?',
        options: [
          { label: 'Sim', result: 'red' },
          { label: 'Não', result: 'yellow' },
        ],
      },
    },
    homeCare: {
      yellow: {
        why: 'Febre no pós-parto pode ser infecção (mama, útero ou urina).',
        tips: [
          'Beba bastante água',
          'Compressa morna no corpo',
          'Continue amamentando',
          'Vá à UBS hoje',
        ],
      },
      red: {
        why: 'Febre alta pós-parto é sinal de infecção grave.',
        tips: [
          'Vá ao hospital agora',
          'Leve o bebê com você',
          'Continue amamentando se puder',
          'Anote quando começou',
        ],
      },
    },
  },
  'sangramento-pos': {
    slug: 'sangramento-pos',
    title: 'Sangramento muito forte',
    emoji: '🩸',
    start: 'q1',
    stages: ['postpartum'],
    nodes: {
      q1: {
        id: 'q1',
        question: 'Quanto sangra?',
        options: [
          { label: 'Encharca 1 absorvente/hora', result: 'red' },
          { label: 'Coágulos grandes', result: 'red' },
          { label: 'Diminuindo aos poucos', result: 'green' },
        ],
      },
    },
    homeCare: {
      green: {
        why: 'O sangramento pós-parto (lóquios) dura até 6 semanas.',
        tips: [
          'Use absorvente, NÃO tampão',
          'Troque a cada 4 horas',
          'Repouse quando puder',
          'Avise se ficar com cheiro forte',
        ],
      },
      red: {
        why: 'Sangramento muito intenso é hemorragia. Risco grave.',
        tips: [
          'Vá ao hospital AGORA',
          'Deite com pernas elevadas',
          'Não fique sozinha',
          'Ligue 192',
        ],
      },
    },
  },
  'tristeza-pos': {
    slug: 'tristeza-pos',
    title: 'Tristeza profunda',
    emoji: '💙',
    start: 'q1',
    stages: ['postpartum'],
    nodes: {
      q1: {
        id: 'q1',
        question: 'Como está se sentindo?',
        options: [
          { label: 'Choro fácil, mas amo o bebê', result: 'green' },
          { label: 'Sem vontade de nada há semanas', result: 'yellow' },
          { label: 'Pensei em me machucar', result: 'red' },
        ],
      },
    },
    homeCare: {
      green: {
        why: 'O "baby blues" é comum nas primeiras 2 semanas.',
        tips: [
          'Descanse quando o bebê dorme',
          'Aceite ajuda da família',
          'Tome sol pela manhã',
          'Fale do que sente',
        ],
      },
      yellow: {
        why: 'Pode ser depressão pós-parto. Tem tratamento.',
        tips: [
          'Procure a UBS hoje',
          'Não fique sozinha',
          'Peça ajuda com o bebê',
          'Você não está falhando',
        ],
      },
      red: {
        why: 'Pensamentos de se machucar exigem ajuda agora.',
        tips: [
          'Ligue CVV: 188 (24h, grátis)',
          'Não fique sozinha',
          'Peça alguém para ficar com você',
          'Vá ao pronto-socorro',
        ],
      },
    },
  },
};

// Lista filtrada para o stage do perfil
export function flowsForStage(stage: Stage): TriageFlow[] {
  return Object.values(FLOWS).filter((f) => !f.stages || f.stages.includes(stage));
}
