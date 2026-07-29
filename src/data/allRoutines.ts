import { DailyRoutine, Exercise } from '../types';
import manualData from './manualMaster.json';

const parseExerciseString = (exStr: string, index: number, day: number, env: string): Exercise => {
  // If there's a dash, split by the last dash to extract reps. Otherwise use the whole string as title.
  let title = exStr;
  let reps = 'Revisar manual';

  const lastDashIndex = exStr.lastIndexOf('-');
  if (lastDashIndex !== -1) {
    title = exStr.substring(0, lastDashIndex).trim();
    reps = exStr.substring(lastDashIndex + 1).trim();
  }

  return {
    id: `${env}_d${day}_e${index}`,
    title,
    reps,
    description: 'Realiza el ejercicio según el Manual del Toro 2.0',
    videoUrl: title.toLowerCase().includes('ruge la bestia') ? 'https://www.youtube.com/results?search_query=CHUY+ALMADA+RUGE+LA+BESTIA' : undefined
  };
};

const getBlockKeyForDay = (day: number) => {
  if (day <= 14) return 'bloque_I_semana_1_y_2';
  if (day <= 28) return 'bloque_II_semana_3_y_4';
  return 'bloque_III_semana_5_y_6';
};

const getBlockTitle = (day: number) => {
  if (day <= 14) return 'Bloque I: Despertar a la Bestia';
  if (day <= 28) return 'Bloque II: Forjando el Acero';
  if (day <= 42) return 'Bloque III: Modo Guerra';
  return 'La Prueba Final (Últimos Días)';
};

const generateRoutines = (): DailyRoutine[] => {
  const routines: DailyRoutine[] = [];

  for (let day = 1; day <= 45; day++) {
    const blockKey = getBlockKeyForDay(day) as keyof typeof manualData.casa;
    const blockTitle = getBlockTitle(day);

    // In the manual, a block has 7 unique days. We repeat them for the 2 weeks of the block.
    // E.g. Day 8 uses Day 1's routine, Day 9 uses Day 2, etc. (except for the final days 43-45 which just loop the last block)
    let moduloDay = day % 7;
    if (moduloDay === 0) moduloDay = 7;

    // Build CASA Routine
    const casaBlock = manualData.casa[blockKey];
    // Find the key in the JSON object that contains the string "dia_X"
    const casaDayKey = Object.keys(casaBlock).find(k => k.startsWith(`dia_${moduloDay}`)) as keyof typeof casaBlock;
    const casaExercisesRaw = casaDayKey ? casaBlock[casaDayKey] as string[] : ["Descanso activo o repetir día anterior - Libre"];

    routines.push({
      dayNumber: day,
      environment: 'CASA',
      title: `Día ${day} - ${blockTitle}`,
      exercises: casaExercisesRaw.map((exStr, idx) => parseExerciseString(exStr, idx, day, 'casa'))
    });

    // Build GYM Routine
    const gymBlock = manualData.gym[blockKey];
    const gymDayKey = Object.keys(gymBlock).find(k => k.startsWith(`dia_${moduloDay}`)) as keyof typeof gymBlock;
    const gymExercisesRaw = gymDayKey ? gymBlock[gymDayKey] as string[] : ["Descanso activo o repetir día anterior - Libre"];

    routines.push({
      dayNumber: day,
      environment: 'GYM',
      title: `Día ${day} - ${blockTitle}`,
      exercises: gymExercisesRaw.map((exStr, idx) => parseExerciseString(exStr, idx, day, 'gym'))
    });
  }

  return routines;
};

export const allRoutines = generateRoutines();
