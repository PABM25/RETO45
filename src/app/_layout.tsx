import { Stack } from 'expo-router';
import { AppContextProvider } from '../store/AppContext';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <AppContextProvider>
        <StatusBar style="light" />
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
    </AppContextProvider>
  );
}
