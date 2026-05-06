import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { Colors } from '../theme/colors';

export default function LanguageSwitcher() {
  const { language, changeLanguage, LANGUAGES } = useLanguage();

  return (
    <View style={styles.langRow}>
      {LANGUAGES.map(lang => (
        <TouchableOpacity
          key={lang.code}
          onPress={() => changeLanguage(lang.code)}
          style={[
            styles.langChip,
            language === lang.code && styles.langChipActive,
          ]}>
          <Text style={[
            styles.langText,
            language === lang.code && styles.langTextActive,
          ]}>
            {lang.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  langRow: {
    flexDirection: 'row',
    gap: 8,
  },
  langChip: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  langChipActive: {
    backgroundColor: Colors.greenBright,
    borderColor: Colors.greenBright,
  },
  langText: {
    fontSize: 11,
    color: Colors.greenLight,
    fontWeight: '500',
  },
  langTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
});