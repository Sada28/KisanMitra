import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BootSplash from 'react-native-bootsplash';
import AppNavigator from './src/navigation/AppNavigator';
import { LanguageProvider } from './src/context/LanguageContext';

export default function App() {
  return (
    <LanguageProvider>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#1a3a2a" />
        <AppNavigator
          onReady={() => BootSplash.hide({ fade: true })}
        />
      </SafeAreaProvider>
    </LanguageProvider>
  );
}