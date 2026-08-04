export const getExerciseGifName = (spanishName: string): string => {
  const dictionary: Record<string, string> = {
    'flexiones de pecho': 'push-up',
    'flexiones diamante': 'diamond push-up',
    'sentadilla profunda': 'squat',
    'sentadilla sumo': 'sumo squat',
    'puente de glúteo': 'glute bridge',
    'desplantes alternados': 'lunge',
    'crunch abdominal': 'crunch',
    'plancha': 'plank',
    'bicicleta abdominal': 'bicycle crunch',
    'burpees': 'burpee',
    'medio burpee': 'burpee',
    'elevaciones de pierna': 'leg raise',
    'mountain climbers': 'mountain climber',
    'jumping jacks': 'jumping jack',
    'remo con garrafones/mochila': 'row',
    'elevaciones laterales': 'lateral raise',
    'fondos en silla': 'chair dip'
  };

  const lowerName = spanishName.toLowerCase().trim();

  // Try exact match first
  if (dictionary[lowerName]) {
    return dictionary[lowerName];
  }

  // Try partial match
  const foundKey = Object.keys(dictionary).find(key => lowerName.includes(key));
  if (foundKey) {
    return dictionary[foundKey];
  }

  // Default fallback or return original if we can't map
  return spanishName;
};

export const translateMuscle = (englishMuscle: string): string => {
  const muscleDict: Record<string, string> = {
    'abs': 'Abdominales',
    'chest': 'Pectorales',
    'back': 'Espalda',
    'legs': 'Piernas',
    'shoulders': 'Hombros',
    'arms': 'Brazos',
    'glutes': 'Glúteos',
    'biceps': 'Bíceps',
    'triceps': 'Tríceps',
    'calves': 'Pantorrillas',
    'quads': 'Cuádriceps',
    'hamstrings': 'Isquiotibiales',
    'forearms': 'Antebrazos',
    'neck': 'Cuello',
    'waist': 'Cintura',
    'lats': 'Dorsales',
    'traps': 'Trapecios'
  };

  const key = englishMuscle.toLowerCase().trim();
  return muscleDict[key] || englishMuscle;
};
