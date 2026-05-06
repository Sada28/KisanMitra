import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>👤 Profile</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f1', alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 24, color: '#1a3a2a', fontWeight: 'bold' },
});