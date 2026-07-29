import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppContext } from '../store/AppContext';

export default function IndexScreen() {
  const router = useRouter();
  const { firebaseUser, userProfile, authLoading, profileLoaded } = useAppContext();

  useEffect(() => {
    if (!authLoading && profileLoaded) {
      if (!firebaseUser) {
        // User not logged in, go to login
        router.replace('/login');
      } else if (!userProfile) {
        // Logged in but hasn't completed onboarding
        router.replace('/onboarding');
      } else {
        // Logged in and onboarded, go to tabs
        router.replace('/(tabs)');
      }
    }
  }, [firebaseUser, userProfile, authLoading, profileLoaded, router]);

  return (
    <View style={{ flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#E63946" />
    </View>
  );
}
