import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import MandiScreen from '../screens/MandiScreen';
import MausamScreen from '../screens/MausamScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const icons = {
  Home: '🏠',
  Mandi: '📊',
  Mausam: '🌤️',
  Profile: '👤',
};

const labels = {
  Home: 'Home',
  Mandi: 'Mandi',
  Mausam: 'Mausam',
  Profile: 'Profile',
};

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#52b788',
        tabBarInactiveTintColor: '#aaaaaa',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#eeeeee',
          paddingBottom: 6,
          paddingTop: 6,
          height: 60,
        },
        tabBarLabel: ({ color }) => (
          <Text style={{ color, fontSize: 10, fontWeight: '600' }}>
            {labels[route.name]}
          </Text>
        ),
        tabBarIcon: ({ size }) => (
          <Text style={{ fontSize: size - 4 }}>
            {icons[route.name]}
          </Text>
        ),
      })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Mandi" component={MandiScreen} />
      <Tab.Screen name="Mausam" component={MausamScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}