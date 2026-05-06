import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BootSplash from 'react-native-bootsplash';
import { useNavigation } from '@react-navigation/native';

export default function SplashScreen() {
  const navigation = useNavigation();

  useEffect(() => {
    const init = async () => {
      // BootSplash hide karo
      await BootSplash.hide({ fade: true });

      // 1 sec baad Onboarding pe jao
      setTimeout(() => {
        navigation.replace('Onboarding');
      }, 1000);
    };

    init();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🌾 किसान मित्र</Text>
      <Text style={styles.tagline}>Har Kisan Ka Saathi</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a3a2a',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  logo: {
    fontSize: 36,
    color: '#fefae0',
    fontWeight: 'bold',
  },
  tagline: {
    fontSize: 13,
    color: '#52b788',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
});