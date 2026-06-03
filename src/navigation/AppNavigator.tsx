import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {RootStackParamList} from './types';

// Screens
import SplashScreen from '../screens/SplashScreen';
import HomeScreen from '../screens/HomeScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import EnrollmentScreen from '../screens/EnrollmentScreen';
import VerificationScreen from '../screens/VerificationScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SyncStatusScreen from '../screens/SyncStatusScreen';
import MainTabNavigator from './MainTabNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: {backgroundColor: '#000000'},
        navigationBarColor: '#000000',
      }}>
      <Stack.Screen name="Splash" component={SplashScreen} options={{animation: 'none'}} />
      <Stack.Screen name="Home" component={HomeScreen} options={{animation: 'fade'}} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{animation: 'fade'}} />
      <Stack.Screen name="Login" component={LoginScreen} options={{animation: 'fade'}} />
      {/* Dashboard now hosts the full bottom tab navigator */}
      <Stack.Screen name="Dashboard" component={MainTabNavigator} options={{animation: 'fade'}} />
      <Stack.Screen name="Enrollment" component={EnrollmentScreen} options={{animation: 'slide_from_right'}} />
      <Stack.Screen name="Verification" component={VerificationScreen} options={{animation: 'slide_from_right'}} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{animation: 'slide_from_right'}} />
      <Stack.Screen name="SyncStatus" component={SyncStatusScreen} options={{animation: 'slide_from_right'}} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
