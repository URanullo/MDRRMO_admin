import { MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getAuth, onAuthStateChanged, User, type Auth } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import HomeScreen from './screens/home/HomeScreen';
import ProfileScreen from './screens/profile/ProfileScreen';
import SendAlarmScreen from './screens/send_alarm/SendAlarmScreen';
import LoginScreen from './screens/login/LoginScreen';
import { app } from './services/firebaseConfig';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  const authRef: Auth = getAuth(app);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(authRef, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return null;

  if (!user) {
    return <LoginScreen />;
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
        tabBarShowLabel: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false, }}/>
      <Tab.Screen name="Send Alarm" component={SendAlarmScreen} options={{ headerShown: false, }}/>
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false, }}/>
    </Tab.Navigator>
  );
}
