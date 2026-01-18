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
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD'
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
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  progress: string;
  icon: string;
  color: string;
}