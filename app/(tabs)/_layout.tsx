import { Tabs } from 'expo-router';
import { useColorScheme, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      // Redirect to login if not authenticated
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  // Show loading or redirect if not authenticated
  if (isLoading || !user) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2E8BFF',
        tabBarInactiveTintColor: '#757575',
        tabBarStyle: {
          backgroundColor: '#1E1E1E',
          borderTopWidth: 1,
          borderTopColor: '#2C2C2C',
          paddingBottom: Platform.select({ ios: 20, android: 12, default: 12 }),
          paddingTop: 8,
          height: Platform.select({ ios: 85, android: 75, default: 75 }),
          marginBottom: 0,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: '600',
          marginTop: 0,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <Ionicons name="grid" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: 'Shopping',
          tabBarIcon: ({ color }) => (
            <Ionicons name="bag" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="pantry"
        options={{
          title: 'Pantry',
          tabBarIcon: ({ color }) => (
            <Ionicons name="restaurant" size={20} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="recurring"
        options={{
          title: 'Lists',
          tabBarIcon: ({ color }) => (
            <Ionicons name="list" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-circle" size={20} color={color} />
          ),
        }}
      />
      
    </Tabs>
  );
}
