import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { UserProfile, DailyRoutine, DailyProgress, PhotoProgress } from '../types';
import { allRoutines } from '../data/allRoutines';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../config/firebase';

interface AppContextType {
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile | null) => void;
  routines: DailyRoutine[];
  dailyProgress: DailyProgress[];
  markDayCompleted: (day: number) => void;
  currentDay: number;
  photos: PhotoProgress[];
  addPhoto: (photo: PhotoProgress) => void;
  firebaseUser: User | null;
  authLoading: boolean;
  profileLoaded: boolean;
  setMockAuth: (isLoggedIn: boolean) => void;
}

const initialProgress: DailyProgress[] = Array.from({ length: 45 }, (_, i) => ({
  day: i + 1,
  completed: false,
}));

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);
  const [routines] = useState<DailyRoutine[]>(allRoutines);
  const [dailyProgress, setDailyProgress] = useState<DailyProgress[]>(initialProgress);
  const [currentDay, setCurrentDay] = useState(1);
  const [photos, setPhotos] = useState<PhotoProgress[]>([]);

  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [mockUser, setMockUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const storedProfile = await AsyncStorage.getItem('userProfile');
        if (storedProfile) {
          setUserProfileState(JSON.parse(storedProfile));
        }
      } catch (e) {
        console.error("Failed to load profile", e);
      } finally {
        setProfileLoaded(true);
      }
    };
    loadProfile();
  }, []);

  const setUserProfile = async (profile: UserProfile | null) => {
    setUserProfileState(profile);
    if (profile) {
      await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
    } else {
      await AsyncStorage.removeItem('userProfile');
    }
  };

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

  const setMockAuth = (isLoggedIn: boolean) => {
    if (isLoggedIn) {
      setMockUser({ uid: 'mock-uid-123', email: 'test@example.com' } as User);
    } else {
      setMockUser(null);
    }
  };

  const activeUser = firebaseUser || mockUser;

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
        firebaseUser: activeUser,
        authLoading,
        profileLoaded,
        setMockAuth,
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
