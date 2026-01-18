export enum AppScreen {
  INITIALIZE = 'INITIALIZE',
  DASHBOARD = 'DASHBOARD',
  START_ACTIVITY = 'START_ACTIVITY',
  LIVE_ACTIVITY = 'LIVE_ACTIVITY',
  POST_WORKOUT = 'POST_WORKOUT',
  HISTORY = 'HISTORY',
  PROFILE = 'PROFILE',
  MUSIC = 'MUSIC',
  STATS = 'STATS',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  TRAINING_PROGRAMS = 'TRAINING_PROGRAMS' // Novo: Tela de Programas de Treino
}

export interface Lap {
  km: number;
  time: string;
  pace: string;
}

export interface Activity {
  id: string;
  uid: string;
  type: 'Corrida' | 'Caminhada' | 'Intervalado' | 'Ciclismo';
  title: string;
  date: string;
  location: string;
  distance: number;
  time: string;
  pace: string;
  calories: number;
  mapImage: string;
  activityImage?: string;
  aspectRatio?: '9:16' | '16:9';
  template?: 'Vortex' | 'Minimal' | 'Datastream';
  targetDistance?: number;
  targetTime?: number;
  routeCoords?: [number, number][];
  laps?: Lap[];
  terrain?: 'Asfalto' | 'Trilha' | 'Esteira';
  voiceCues?: boolean;
  heartRate?: number; // Novo campo para frequência cardíaca média
  programId?: string; // Novo: ID do programa de treino ao qual a atividade pertence
  programActivityId?: string; // Novo: ID da atividade dentro do programa
}

export interface UserProfile {
  uid: string;
  name: string;
  email?: string;
  level: number;
  status: string;
  avatar: string;
  height: number;
  weight: number;
  age: number;
  gender: 'M' | 'F' | 'O';
  goal: string;
  weeklyGoal: number;
  monthlyGoal: number;
  coachPersonality?: 'Motivador' | 'Técnico' | 'Zen';
  voiceCues?: boolean;
  activeTrainingProgramId?: string; // Novo: ID do programa de treino ativo do usuário
  completedProgramActivities?: { [programId: string]: string[] }; // Novo: Atividades concluídas por programa
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  progress: string;
  icon: string;
  color: string;
}

// Novo: Interface para uma atividade dentro de um programa de treino
export interface ProgramActivity {
  id: string;
  day: number; // Dia do programa (ex: Dia 1, Dia 2)
  title: string;
  description: string;
  type: 'Corrida' | 'Caminhada' | 'Intervalado' | 'Ciclismo';
  targetDistance?: number; // Meta de distância para esta atividade
  targetTime?: number; // Meta de tempo para esta atividade
  isCompleted: boolean; // Se o usuário já completou esta atividade
}

// Novo: Interface para um programa de treino completo
export interface TrainingProgram {
  id: string;
  name: string;
  description: string;
  durationWeeks: number;
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  focus: 'Resistência' | 'Velocidade' | 'Força';
  image: string; // URL da imagem do programa
  activities: ProgramActivity[]; // Lista de atividades do programa
}