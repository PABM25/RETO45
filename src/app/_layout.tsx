import { Stack } from 'expo-router';
import { AppContextProvider, useAppContext } from '../store/AppContext';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View } from 'react-native';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isLoading } = useAppContext();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  if (isLoading) {
    return <View style={{ flex: 1, backgroundColor: '#121212' }} />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#121212',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        contentStyle: {
          backgroundColor: '#121212',
        },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Onboarding', headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AppContextProvider>
      <StatusBar style="light" />
      <RootLayoutNav />
    </AppContextProvider>
  );
}
