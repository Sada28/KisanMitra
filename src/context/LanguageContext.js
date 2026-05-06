import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import hi from '../i18n/translations/hi';
import mr from '../i18n/translations/mr';
import en from '../i18n/translations/en';

const translations = { hi, mr, en };

export const LANGUAGES = [
  { code: 'hi', label: 'हिंदी' },
  { code: 'mr', label: 'मराठी' },
  { code: 'en', label: 'English' },
];

const LANGUAGE_KEY = '@kisan_language';
const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('hi');
  const [t, setT] = useState(translations['hi']);

  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (saved && translations[saved]) {
        setLanguage(saved);
        setT(translations[saved]);
      }
    } catch (e) {
      console.log('Language load error:', e);
    }
  };

  const changeLanguage = async (langCode) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, langCode);
      setLanguage(langCode);
      setT(translations[langCode]);
    } catch (e) {
      console.log('Language save error:', e);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, t, changeLanguage, LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider');
  }
  return context;
}