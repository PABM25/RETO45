import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserProfile, DailyRoutine, DailyProgress, PhotoProgress } from '../types';
import { allRoutines } from '../data/allRoutines';

interface AppContextType {
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile) => void;
  routines: DailyRoutine[];
  dailyProgress: DailyProgress[];
  markDayCompleted: (day: number) => void;
  currentDay: number;
  photos: PhotoProgress[];
  addPhoto: (photo: PhotoProgress) => void;
}

const initialProgress: DailyProgress[] = Array.from({ length: 45 }, (_, i) => ({
  day: i + 1,
  completed: false,
}));

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [routines] = useState<DailyRoutine[]>(allRoutines);
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
