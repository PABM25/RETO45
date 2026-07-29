import { DailyRoutine, Exercise } from '../types';

// Mocked exercise library for Casa
const casaExercises: Exercise[] = [
  { id: 'c1', title: 'Flexiones (Push-ups)', reps: '15-20', description: 'Mantén el cuerpo recto y baja hasta que el pecho toque el suelo.' },
  { id: 'c2', title: 'Sentadillas', reps: '20-25', description: 'Baja las caderas hacia atrás como si fueras a sentarte en una silla.' },
  { id: 'c3', title: 'Burpees', reps: '10-15', description: 'Desde posición de pie, baja a flexión, vuelve y salta.' },
  { id: 'c4', title: 'Comandos (Plank to Push-up)', reps: '12-16', description: 'Desde posición de plancha, sube a posición de flexión uno a uno y baja.' },
  { id: 'c5', title: 'Mountain Climbers', reps: '30s', description: 'En posición de plancha alta, lleva las rodillas al pecho alternadamente.' },
  { id: 'c6', title: 'Zancadas', reps: '12 por pierna', description: 'Da un paso largo y baja hasta que la rodilla trasera roce el suelo.' },
];

// Mocked exercise library for Gym
const gymExercises: Exercise[] = [
  { id: 'g1', title: 'Press de Banca', reps: '10-12', description: 'Acuéstate en el banco y empuja la barra desde el pecho hacia arriba.' },
  { id: 'g2', title: 'Jalón al Pecho', reps: '12-15', description: 'Tira de la barra hacia tu pecho manteniendo la espalda recta.' },
  { id: 'g3', title: 'Peso Muerto Rumano', reps: '10-12', description: 'Flexiona ligeramente las rodillas y baja el torso empujando la cadera hacia atrás.' },
  { id: 'g4', title: 'Biserie: Curl de Bíceps / Extensión de Tríceps', reps: '12-15 c/u', description: 'Alterna entre flexionar el codo para bíceps y extenderlo en polea para tríceps.' },
  { id: 'g5', title: 'Press Militar', reps: '10-12', description: 'Empuja el peso por encima de la cabeza hasta bloquear los codos.' },
  { id: 'g6', title: 'Prensa de Piernas', reps: '15-20', description: 'Empuja la plataforma controlando la bajada sin bloquear las rodillas.' },
];

const generateRoutines = (): DailyRoutine[] => {
  const routines: DailyRoutine[] = [];

  for (let day = 1; day <= 45; day++) {
    // Determine the block based on the day
    let blockTitle = 'Bloque I: Despertar a la Bestia (Semanas 1-2)';
    if (day > 14 && day <= 28) {
      blockTitle = 'Bloque II: Forjando el Acero (Semanas 3-4)';
    } else if (day > 28 && day <= 42) {
      blockTitle = 'Bloque III: Modo Guerra (Semanas 5-6)';
    } else if (day > 42) {
      blockTitle = 'La Prueba Final (Últimos Días)';
    }

    // Every 7th day is a rest or active recovery day
    const isRestDay = day % 7 === 0;

    // Generate CASA routine for this day
    routines.push({
      dayNumber: day,
      environment: 'CASA',
      title: isRestDay ? `Día ${day} - Recuperación Activa / Estiramientos` : `Día ${day} - ${blockTitle}`,
      exercises: isRestDay
        ? [{ id: `rest_c_${day}`, title: 'Estiramiento Total', reps: '20 min', description: 'Rutina completa de movilidad y estiramientos.' }]
        : [
            casaExercises[(day + 0) % casaExercises.length],
            casaExercises[(day + 1) % casaExercises.length],
            casaExercises[(day + 2) % casaExercises.length],
            casaExercises[(day + 3) % casaExercises.length]
          ].map((ex, idx) => ({ ...ex, id: `${ex.id}_d${day}_${idx}` }))
    });

    // Generate GYM routine for this day
    routines.push({
      dayNumber: day,
      environment: 'GYM',
      title: isRestDay ? `Día ${day} - Recuperación Activa / Movilidad` : `Día ${day} - ${blockTitle}`,
      exercises: isRestDay
        ? [{ id: `rest_g_${day}`, title: 'Movilidad Articular y Cardio Suave', reps: '30 min', description: 'Caminata inclinada o bicicleta estática suave + 10min de movilidad.' }]
        : [
            gymExercises[(day + 0) % gymExercises.length],
            gymExercises[(day + 1) % gymExercises.length],
            gymExercises[(day + 2) % gymExercises.length],
            gymExercises[(day + 3) % gymExercises.length]
          ].map((ex, idx) => ({ ...ex, id: `${ex.id}_d${day}_${idx}` }))
    });
  }

  return routines;
};

export const allRoutines = generateRoutines();
