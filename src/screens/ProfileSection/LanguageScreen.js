// ===== LANGUAGE SCREEN =====

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { Colors } from '../../theme/colors';
import { useLanguage } from '../../context/LanguageContext';

export default function LanguageScreen() {
  const { language, changeLanguage } =
    useLanguage();

  const languages = [
    {
      code: 'en',
      title: 'English',
    },
    {
      code: 'hi',
      title: 'हिंदी',
    },
    {
      code: 'mr',
      title: 'मराठी',
    },
  ];

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#f0f4f1"
      />

      <View style={styles.container}>
        <Text style={styles.title}>
          Choose Language
        </Text>

        {languages.map(item => {
          const active =
            language === item.code;

          return (
            <TouchableOpacity
              key={item.code}
              activeOpacity={0.85}
              style={[
                styles.langCard,
                active &&
                  styles.langCardActive,
              ]}
              onPress={() =>
                changeLanguage(item.code)
              }>

              <Text
                style={[
                  styles.langText,
                  active &&
                    styles.langTextActive,
                ]}>
                {item.title}
              </Text>

              {active && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={Colors.greenMid}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f0f4f1',
  },

  container: {
    padding: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 20,
  },

  langCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,

    paddingVertical: 18,
    paddingHorizontal: 18,

    marginBottom: 14,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    elevation: 3,
  },

  langCardActive: {
    borderWidth: 1.5,
    borderColor: Colors.greenBright,
    backgroundColor: '#eef8f2',
  },

  langText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textDark,
  },

  langTextActive: {
    color: Colors.greenDark,
  },
});