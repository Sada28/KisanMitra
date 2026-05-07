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
  Alert,
  Image,
} from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';
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

  const [errors, setErrors] = useState({
    mobile: '',
    password: '',
  });

  // ===== STATIC LOGIN DATA =====
  const STATIC_MOBILE = '9876543210';
  const STATIC_PASSWORD = '123456';

  // ===== VALIDATION =====
  const validate = () => {
    let valid = true;

    let tempErrors = {
      mobile: '',
      password: '',
    };

    if (!mobile) {
      tempErrors.mobile = 'Mobile number is required';
      valid = false;
    } else if (mobile.length !== 10) {
      tempErrors.mobile =
        'Enter valid 10 digit mobile number';
      valid = false;
    }

    if (!password) {
      tempErrors.password = 'Password is required';
      valid = false;
    } else if (password.length < 6) {
      tempErrors.password =
        'Password must be at least 6 characters';
      valid = false;
    }

    setErrors(tempErrors);

    return valid;
  };

  // ===== LOGIN FUNCTION =====
  const handleLogin = () => {
    if (!validate()) return;

    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      if (
        mobile === STATIC_MOBILE &&
        password === STATIC_PASSWORD
      ) {
        navigation.replace('MainTabs');
      } else {
        Alert.alert(
          'Login Failed',
          'Invalid mobile number or password'
        );
      }
    }, 1500);
  };

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.greenDark}
      />

      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        {/* ===== LOGO IMAGE ===== */}
        {/* <Image
          source={require('../assets/images/KisanMitra_logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        /> */}

        <View style={styles.headerContent}>
          <Text style={styles.logoText}>
            <Text style={styles.logoHighlight}>
              Kisan
            </Text>{' '}
            Mitra
          </Text>

          <Text style={styles.logoSub}>
            SMART FARMING SOLUTION
          </Text>
        </View>

        {/* ===== LANGUAGE SWITCHER ===== */}
        <LanguageSwitcher />
      </View>

      {/* ===== CARD SECTION ===== */}
      <KeyboardAvoidingView
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
        style={styles.cardWrap}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {t.login.title}
            </Text>

           <Text style={styles.cardSub}>
  {t.login.subtitle}
</Text>

            {/* ===== MOBILE INPUT ===== */}
            <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
  {t.login.mobile.toUpperCase()}
</Text>

              <View
                style={[
                  styles.inputField,
                  activeInput === 'mobile' &&
                    styles.inputFieldActive,
                  errors.mobile && styles.errorBorder,
                ]}>

                <Ionicons
                  name="call-outline"
                  size={20}
                  color={Colors.textGrey}
                />

                <Text style={styles.prefix}>+91</Text>

                <TextInput
                  style={styles.input}
                  placeholder="9876543210"
                  placeholderTextColor="#bbb"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={mobile}
                  onChangeText={text => {
                    setMobile(
                      text.replace(/[^0-9]/g, '')
                    );

                    setErrors({
                      ...errors,
                      mobile: '',
                    });
                  }}
                  onFocus={() =>
                    setActiveInput('mobile')
                  }
                  onBlur={() => setActiveInput('')}
                />
              </View>

              {errors.mobile ? (
                <Text style={styles.errorText}>
                  {errors.mobile}
                </Text>
              ) : null}
            </View>

            {/* ===== PASSWORD INPUT ===== */}
            <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
  {t.login.password.toUpperCase()}
</Text>

              <View
                style={[
                  styles.inputField,
                  activeInput === 'password' &&
                    styles.inputFieldActive,
                  errors.password &&
                    styles.errorBorder,
                ]}>

                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={Colors.textGrey}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Enter password"
                  placeholderTextColor="#bbb"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={text => {
                    setPassword(text);

                    setErrors({
                      ...errors,
                      password: '',
                    });
                  }}
                  onFocus={() =>
                    setActiveInput('password')
                  }
                  onBlur={() => setActiveInput('')}
                />

                <TouchableOpacity
                  onPress={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }>

                  <Ionicons
                    name={
                      showPassword
                        ? 'eye-off-outline'
                        : 'eye-outline'
                    }
                    size={20}
                    color={Colors.textGrey}
                  />
                </TouchableOpacity>
              </View>

              {errors.password ? (
                <Text style={styles.errorText}>
                  {errors.password}
                </Text>
              ) : null}
            </View>

            {/* ===== FORGOT PASSWORD ===== */}
            <TouchableOpacity
              style={styles.forgotWrap}>
            <Text style={styles.forgotText}>
  {t.login.forgot}
</Text>
            </TouchableOpacity>

            {/* ===== LOGIN BUTTON ===== */}
            <TouchableOpacity
              style={[
                styles.loginBtn,
                loading &&
                  styles.loginBtnDisabled,
              ]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}>

              {loading ? (
                <ActivityIndicator
                  color="#fff"
                  size="small"
                />
              ) : (
                <Text style={styles.loginBtnText}>
                  Login
                </Text>
              )}
            </TouchableOpacity>

            {/* ===== DEMO LOGIN ===== */}
            <View style={styles.demoBox}>
              <Text style={styles.demoTitle}>
                Demo Login Credentials
              </Text>

              <Text style={styles.demoText}>
                Mobile: 9876543210
              </Text>

              <Text style={styles.demoText}>
                Password: 123456
              </Text>
            </View>

            {/* ===== DIVIDER ===== */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />

              <Text style={styles.dividerText}>
                {language === 'en'
                  ? 'OR'
                  : 'OR'}
              </Text>

              <View style={styles.dividerLine} />
            </View>

            {/* ===== REGISTER ===== */}
            <View style={styles.registerRow}>
             {t.login.noAccount}

              <TouchableOpacity>
                {t.login.register}
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
    gap: 14,
  },

  logoImage: {
    width: 90,
    height: 90,
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
    shadowOffset: {
      width: 0,
      height: 8,
    },
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

  errorBorder: {
    borderColor: '#ff4d4f',
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

  errorText: {
    color: '#ff4d4f',
    fontSize: 11,
    marginTop: 5,
    marginLeft: 4,
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
    shadowOffset: {
      width: 0,
      height: 4,
    },
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

  demoBox: {
    marginTop: 18,
    backgroundColor: '#f0faf5',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d9f2e3',
  },

  demoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.greenMid,
    marginBottom: 6,
  },

  demoText: {
    fontSize: 12,
    color: Colors.textDark,
    marginBottom: 2,
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
    marginLeft: 4,
  },
});