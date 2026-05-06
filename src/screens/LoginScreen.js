import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../theme/colors';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function LoginScreen() {
  const navigation = useNavigation();
  const { t, language } = useLanguage();

  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeInput, setActiveInput] = useState('');

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.replace('MainTabs');
    }, 1500);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.greenDark} />

      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.logoText}>
            <Text style={styles.logoHighlight}>किसान</Text> मित्र
          </Text>
          <Text style={styles.logoSub}>KISAN MITRA · स्वागत है</Text>
        </View>

        {/* Language Switcher Component */}
        <LanguageSwitcher />
      </View>

      {/* ===== WHITE CARD ===== */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.cardWrap}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t.login.title}</Text>
            <Text style={styles.cardSub}>{t.login.subtitle}</Text>

            {/* Mobile Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.login.mobile}</Text>
              <View style={[
                styles.inputField,
                activeInput === 'mobile' && styles.inputFieldActive,
              ]}>
                <Text style={styles.inputIcon}>📱</Text>
                <Text style={styles.prefix}>+91</Text>
                <TextInput
                  style={styles.input}
                  placeholder="98765 43210"
                  placeholderTextColor="#bbb"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={mobile}
                  onChangeText={setMobile}
                  onFocus={() => setActiveInput('mobile')}
                  onBlur={() => setActiveInput('')}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.login.password}</Text>
              <View style={[
                styles.inputField,
                activeInput === 'password' && styles.inputFieldActive,
              ]}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#bbb"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setActiveInput('password')}
                  onBlur={() => setActiveInput('')}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Text style={styles.eyeIcon}>
                    {showPassword ? '🙈' : '👁️'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotWrap}>
              <Text style={styles.forgotText}>{t.login.forgot}</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}>
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.loginBtnText}>{t.login.loginBtn}</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>
                {language === 'en' ? 'OR' : 'या'}
              </Text>
              <View style={styles.dividerLine} />
            </View>

            {/* OTP Button */}
            <TouchableOpacity style={styles.otpBtn} activeOpacity={0.8}>
              <Text style={styles.otpIcon}>📲</Text>
              <Text style={styles.otpText}>{t.login.otp}</Text>
            </TouchableOpacity>

            {/* Register */}
            <View style={styles.registerRow}>
              <Text style={styles.registerText}>{t.login.noAccount}</Text>
              <TouchableOpacity>
                <Text style={styles.registerLink}>{t.login.register}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.greenDark,
  },
  header: {
    paddingTop: 52,
    paddingHorizontal: 24,
    paddingBottom: 28,
    alignItems: 'center',
    gap: 16,
  },
  headerContent: {
    alignItems: 'center',
  },
  logoText: {
    fontSize: 30,
    color: Colors.cream,
    fontWeight: 'bold',
  },
  logoHighlight: {
    color: Colors.greenBright,
  },
  logoSub: {
    fontSize: 11,
    color: Colors.greenLight,
    letterSpacing: 2,
    marginTop: 4,
    opacity: 0.8,
  },
  cardWrap: {
    flex: 1,
    backgroundColor: '#f0f4f1',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textDark,
  },
  cardSub: {
    fontSize: 12,
    color: Colors.textGrey,
    marginTop: 2,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#999',
    letterSpacing: 1.5,
    marginBottom: 7,
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
    gap: 10,
  },
  inputFieldActive: {
    borderColor: Colors.greenBright,
    backgroundColor: '#f0faf5',
  },
  inputIcon: {
    fontSize: 16,
  },
  prefix: {
    fontSize: 13,
    color: Colors.textDark,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.textDark,
    padding: 0,
  },
  eyeIcon: {
    fontSize: 16,
  },
  forgotWrap: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    marginTop: -4,
  },
  forgotText: {
    fontSize: 12,
    color: Colors.greenMid,
    fontWeight: '600',
  },
  loginBtn: {
    backgroundColor: Colors.greenMid,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: Colors.greenMid,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  loginBtnDisabled: {
    opacity: 0.7,
  },
  loginBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#eee',
  },
  dividerText: {
    fontSize: 11,
    color: '#ccc',
    fontWeight: '600',
  },
  otpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.greenBright,
    borderRadius: 14,
    paddingVertical: 13,
    gap: 8,
  },
  otpIcon: {
    fontSize: 16,
  },
  otpText: {
    fontSize: 13,
    color: Colors.greenMid,
    fontWeight: '600',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerText: {
    fontSize: 13,
    color: Colors.textGrey,
  },
  registerLink: {
    fontSize: 13,
    color: Colors.greenMid,
    fontWeight: '700',
  },
});
