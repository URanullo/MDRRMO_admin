import { MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { onAuthStateChanged, User } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import Details from '../components/Details';
import Profile from '../components/Profile';
import SendAlarm from '../components/SendAlarm';
import { auth } from './service/firebaseconfig';

const Tab = createBottomTabNavigator();

interface BottomTabNavigatorProps {
  onLogout: () => void;
}

export default function BottomTabNavigator({ onLogout }: BottomTabNavigatorProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return null;

  if (!user) {
    return null;
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = '';
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Send Alarm') iconName = 'alarm';
          else if (route.name === 'Profile') iconName = 'person';
          return <MaterialIcons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#E53935',
        tabBarInactiveTintColor: '#bbb',
      })}
    >
      <Tab.Screen name="Home" component={Details} />
      <Tab.Screen name="Send Alarm" component={SendAlarm} />
      <Tab.Screen 
        name="Profile" 
        children={() => <Profile onLogout={onLogout} />}
      />
    </Tab.Navigator>
  );
}
