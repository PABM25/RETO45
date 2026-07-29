import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserProfile, Routine, DailyProgress, PhotoProgress } from '../types';

interface AppContextType {
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile) => void;
  routines: Routine[];
  dailyProgress: DailyProgress[];
  markDayCompleted: (day: number) => void;
  currentDay: number;
  photos: PhotoProgress[];
  addPhoto: (photo: PhotoProgress) => void;
}

const baseExercises = [
  { title: 'Flexiones', reps: 15, sets: 4, description: 'Mantén el cuerpo recto y baja hasta que el pecho toque el suelo.', videoUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4' },
  { title: 'Sentadillas', reps: 20, sets: 4, description: 'Baja las caderas hacia atrás como si fueras a sentarte en una silla.', videoUrl: 'https://www.youtube.com/watch?v=U3HlFDQy24' },
  { title: 'Dominadas', reps: 'Al fallo', sets: 3, description: 'Cuelga de la barra y tira hasta que tu barbilla la pase.', videoUrl: 'https://www.youtube.com/watch?v=eGo4IYtlMh0' },
  { title: 'Plancha', reps: '60s', sets: 3, description: 'Mantén el cuerpo en línea recta apoyado en los antebrazos y puntas de los pies.', videoUrl: 'https://www.youtube.com/watch?v=ASdvN_XEl_c' },
];

const mockRoutines: Routine[] = Array.from({ length: 45 }).flatMap((_, dayIndex) => {
  return baseExercises.map((exercise, exIndex) => ({
    id: `day${dayIndex + 1}_ex${exIndex + 1}`,
    day: dayIndex + 1,
    ...exercise,
  }));
});

const initialProgress: DailyProgress[] = Array.from({ length: 45 }, (_, i) => ({
  day: i + 1,
  completed: false,
}));

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [routines] = useState<Routine[]>(mockRoutines);
  const [dailyProgress, setDailyProgress] = useState<DailyProgress[]>(initialProgress);
  const [currentDay, setCurrentDay] = useState(1);
  const [photos, setPhotos] = useState<PhotoProgress[]>([]);

  const addPhoto = (photo: PhotoProgress) => {
    setPhotos((prev) => [...prev, photo]);
  };

  const markDayCompleted = (day: number) => {
    setDailyProgress((prev) =>
      prev.map((progress) =>
        progress.day === day ? { ...progress, completed: true } : progress
      )
    );
    if (day === currentDay && currentDay < 45) {
      setCurrentDay(prev => prev + 1);
    }
  };

  return (
    <AppContext.Provider
      value={{
        userProfile,
        setUserProfile,
        routines,
        dailyProgress,
        markDayCompleted,
        currentDay,
        photos,
        addPhoto,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};
