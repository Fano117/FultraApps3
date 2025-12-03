import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useAuth} from '../shared/hooks';
import {FullScreenLoader} from '../shared/components';

// Screens
import {LoginScreen, RegisterScreen, ForgotPasswordScreen} from '../screens/auth';
import {
  DeliveryDetailsScreen,
  DeliveryInProgressScreen,
  DeliveryCompletedScreen,
} from '../screens/entregas';
import {SettingsScreen} from '../screens/profile';

// Navigators
import {MainTabNavigator} from './MainTabNavigator';

// Types
import {RootStackParamList} from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Auth Stack (not logged in)
const AuthStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

// App Stack (logged in)
const AppStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen
        name="DeliveryDetails"
        component={DeliveryDetailsScreen}
        options={{
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="DeliveryInProgress"
        component={DeliveryInProgressScreen}
        options={{
          animation: 'fade',
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="DeliveryCompleted"
        component={DeliveryCompletedScreen}
        options={{
          animation: 'fade',
          gestureEnabled: false,
        }}
      />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
};

export const RootNavigator: React.FC = () => {
  const {isAuthenticated, isInitialized} = useAuth();

  // Show loading while checking auth status
  if (!isInitialized) {
    return <FullScreenLoader message="Cargando..." />;
  }

  return isAuthenticated ? <AppStack /> : <AuthStack />;
};

export default RootNavigator;
