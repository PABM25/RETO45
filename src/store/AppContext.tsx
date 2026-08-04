import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { UserProfile, DailyRoutine, DailyProgress, PhotoProgress } from '../types';
import { allRoutines } from '../data/allRoutines';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, setDoc, getDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';

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
    const loadData = async () => {
      const activeUser = firebaseUser || mockUser;
      if (!activeUser) {
        setUserProfileState(null);
        setDailyProgress(initialProgress);
        setPhotos([]);
        setCurrentDay(1);
        setProfileLoaded(true);
        return;
      }

      try {
        // Load User Profile
        const userDocRef = doc(db, 'users', activeUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserProfileState(userDocSnap.data() as UserProfile);
        } else {
          setUserProfileState(null);
        }

        // Load Progress
        const progressCol = collection(userDocRef, 'progress');
        const progressSnap = await getDocs(progressCol);
        const fetchedProgress: number[] = [];
        progressSnap.forEach((doc) => {
          if (doc.data().completed) {
            fetchedProgress.push(Number(doc.id));
          }
        });

        setDailyProgress((prev) =>
          prev.map((p) => ({
            ...p,
            completed: fetchedProgress.includes(p.day),
          }))
        );

        const maxCompletedDay = Math.max(0, ...fetchedProgress);
        setCurrentDay(maxCompletedDay < 45 ? maxCompletedDay + 1 : 45);

        // Load Photos
        const photosCol = collection(userDocRef, 'photos');
        const photosQuery = query(photosCol, orderBy('date', 'asc'));
        const photosSnap = await getDocs(photosQuery);
        const fetchedPhotos: PhotoProgress[] = [];
        photosSnap.forEach((doc) => {
          fetchedPhotos.push(doc.data() as PhotoProgress);
        });
        setPhotos(fetchedPhotos);

      } catch (e) {
        console.error("Failed to load user data from Firestore", e);
      } finally {
        setProfileLoaded(true);
      }
    };

    if (!authLoading) {
        loadData();
    }
  }, [firebaseUser, mockUser, authLoading]);

  const setUserProfile = async (profile: UserProfile | null) => {
    setUserProfileState(profile);
    const activeUser = firebaseUser || mockUser;
    if (activeUser) {
      const userDocRef = doc(db, 'users', activeUser.uid);
      if (profile) {
        await setDoc(userDocRef, profile, { merge: true });
      }
    }
  };

  const addPhoto = async (photo: PhotoProgress) => {
    setPhotos((prev) => [...prev, photo]);
    const activeUser = firebaseUser || mockUser;
    if (activeUser) {
      const photoDocRef = doc(db, 'users', activeUser.uid, 'photos', photo.id);
      await setDoc(photoDocRef, photo);
    }
  };

  const markDayCompleted = async (day: number) => {
    setDailyProgress((prev) =>
      prev.map((progress) =>
        progress.day === day ? { ...progress, completed: true } : progress
      )
    );
    if (day === currentDay && currentDay < 45) {
      setCurrentDay(prev => prev + 1);
    }

    const activeUser = firebaseUser || mockUser;
    if (activeUser) {
        const progressDocRef = doc(db, 'users', activeUser.uid, 'progress', String(day));
        await setDoc(progressDocRef, { completed: true, timestamp: new Date().toISOString() });
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
