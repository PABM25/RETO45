import { Tabs } from 'expo-router';
import { Shield, Dumbbell, Calendar, Camera } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#1e1e1e',
          borderTopColor: '#2c2c2c',
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: '#E63946',
        tabBarInactiveTintColor: '#aaaaaa',
        headerStyle: {
          backgroundColor: '#121212',
          borderBottomWidth: 1,
          borderBottomColor: '#2c2c2c',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: '900',
          textTransform: 'uppercase',
          letterSpacing: 1,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Shield size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="workout"
        options={{
          title: 'Rutina',
          tabBarIcon: ({ color }) => <Dumbbell size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Progreso',
          tabBarIcon: ({ color }) => <Calendar size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="photos"
        options={{
          title: 'Fotos',
          tabBarIcon: ({ color }) => <Camera size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
