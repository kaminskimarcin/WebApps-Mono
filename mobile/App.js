import React, { useState, useEffect } from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import LoginScreen from './src/screens/LoginScreen';
import TeamsScreen from './src/screens/TeamsScreen';
import BoardScreen from './src/screens/BoardScreen';
import { auth } from './src/config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return null;

  return (
    <NavigationContainer theme={DarkTheme}>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{ 
        headerStyle: { backgroundColor: '#0f172a' },
        headerTintColor: '#fff',
        contentStyle: { backgroundColor: '#0f172a' }
      }}>
        {user ? (
          <>
            <Stack.Screen name="Teams" component={TeamsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Board" component={BoardScreen} options={({ route }) => ({ title: route.params.teamName || 'Tablica Zadań' })} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
