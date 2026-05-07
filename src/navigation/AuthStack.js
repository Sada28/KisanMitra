import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import TabNavigator from './TabNavigator';
import LanguageScreen from '../screens/ProfileSection/LanguageScreen';

const Stack = createStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
       <Stack.Screen name="MainTabs" component={TabNavigator} />
       <Stack.Screen name="LanguageScreen" component={LanguageScreen}/>
    </Stack.Navigator>
  );
}