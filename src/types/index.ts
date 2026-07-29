export interface UserProfile {
  age: number;
  weight: number; // in kg
  height: number; // in cm
  gender: 'Hombre' | 'Mujer';
  environment: 'CASA' | 'GYM';
  level: 'Principiante' | 'Intermedio' | 'Avanzado';
  goal: 'Pérdida de Peso' | 'Ganancia Muscular';
  imc: number;
  targetCalories: number;
}

export interface PhotoProgress {
  id: string;
  uri: string;
  date: string;
  type: 'Frente' | 'Lado' | 'Espalda';
}

export interface Routine {
  id: string;
  title: string;
  reps: number | string;
  sets: number;
}

export interface DailyProgress {
  day: number;
  completed: boolean;
}
