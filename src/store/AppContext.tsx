import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserProfile, Routine, DailyProgress } from '../types';

interface AppContextType {
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile) => void;
  routines: Routine[];
  dailyProgress: DailyProgress[];
  markDayCompleted: (day: number) => void;
  currentDay: number;
}

const mockRoutines: Routine[] = [
  { id: '1', title: 'Flexiones', reps: 15, sets: 4 },
  { id: '2', title: 'Sentadillas', reps: 20, sets: 4 },
  { id: '3', title: 'Dominadas', reps: 'Al fallo', sets: 3 },
  { id: '4', title: 'Plancha', reps: '60s', sets: 3 },
];

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
