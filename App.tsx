import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import HomeScreen from './src/screens/HomeScreen';
import MapScreen from './src/screens/MapScreen';
import NavigationScreen from './src/screens/NavigationScreen';
import { theme } from './src/theme';

export type RootStackParamList = {
  Home: undefined;
  Map: { dan?: string };
  Navigation: { destination: { latitude: number; longitude: number } };
};

const Stack = createStackNavigator<RootStackParamList>();
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={theme}>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Home"
              screenOptions={{
                headerStyle: {
                  backgroundColor: theme.colors.primary,
                },
                headerTintColor: theme.colors.onPrimary,
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            >
              <Stack.Screen 
                name="Home" 
                component={HomeScreen}
                options={{ title: 'Nigeria Navigation' }}
              />
              <Stack.Screen 
                name="Map" 
                component={MapScreen}
                options={{ title: 'Map View' }}
              />
              <Stack.Screen 
                name="Navigation" 
                component={NavigationScreen}
                options={{ title: 'Navigation' }}
              />
            </Stack.Navigator>
          </NavigationContainer>
          <StatusBar style="light" />
        </PaperProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
