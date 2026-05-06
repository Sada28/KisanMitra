import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Geolocation from '@react-native-community/geolocation';
import { Colors } from '../theme/colors';
import { useLanguage } from '../context/LanguageContext';
import { fetchCurrentWeather, getWeatherEmoji, getFarmingAdvisory } from '../services/weatherService';
import { fetchPrices } from '../services/mandiService';

// ===== FALLBACK LOCATION — Nagpur =====
const FALLBACK_LAT = 21.1458;
const FALLBACK_LON = 79.0882;

export default function HomeScreen({ navigation }) {
  const { t } = useLanguage();

  // Weather state
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  // Mandi state
  const [mandiData, setMandiData] = useState([]);
  const [mandiLoading, setMandiLoading] = useState(true);
  const [userDistrict, setUserDistrict] = useState('');
  const [userState, setUserState] = useState('');

  // Alert state
  const [alerts, setAlerts] = useState([]);

  const features = [
    { icon: '📊', title: t.home.mandi, sub: 'Live Rates', color: '#e8f5ee', screen: 'Mandi' },
    { icon: '🌤️', title: t.home.mausam, sub: 'Aaj ka haal', color: '#fff3e8', screen: 'Mausam' },
    { icon: '🔬', title: t.home.disease, sub: 'Photo Upload', color: '#e8f0ff', screen: 'Disease' },
    { icon: '📋', title: t.home.schemes, sub: 'Apply Karo', color: '#ffeaea', screen: 'Schemes' },
  ];

  useEffect(() => {
    initLocation();
  }, []);

  // ===== Step 1: Get GPS location =====
  const initLocation = async () => {
    try {
      let lat = FALLBACK_LAT;
      let lon = FALLBACK_LON;

      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          lat = await new Promise((resolve) => {
            Geolocation.getCurrentPosition(
              pos => resolve(pos.coords),
              () => resolve({ latitude: FALLBACK_LAT, longitude: FALLBACK_LON }),
              { enableHighAccuracy: false, timeout: 10000 }
            );
          }).then(coords => coords).catch(() => ({ latitude: FALLBACK_LAT, longitude: FALLBACK_LON }));
          // lat is actually coords object here — fix below
        }
      }

      // Re-do cleanly
      await getLocationAndLoad();
    } catch (e) {
      await loadWeather(FALLBACK_LAT, FALLBACK_LON);
      await loadMandiPrices('Maharashtra', 'Nagpur');
    }
  };

  const getLocationAndLoad = () => {
    return new Promise(resolve => {
      const doLoad = async (lat, lon) => {
        await loadWeather(lat, lon);
        const { state, district } = await reverseGeocode(lat, lon);
        setUserState(state);
        setUserDistrict(district);
        await loadMandiPrices(state, district);
        resolve();
      };

      if (Platform.OS === 'android') {
        PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        ).then(granted => {
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            Geolocation.getCurrentPosition(
              pos => doLoad(pos.coords.latitude, pos.coords.longitude),
              () => doLoad(FALLBACK_LAT, FALLBACK_LON),
              { enableHighAccuracy: false, timeout: 10000 }
            );
          } else {
            doLoad(FALLBACK_LAT, FALLBACK_LON);
          }
        });
      } else {
        Geolocation.getCurrentPosition(
          pos => doLoad(pos.coords.latitude, pos.coords.longitude),
          () => doLoad(FALLBACK_LAT, FALLBACK_LON),
          { enableHighAccuracy: false, timeout: 10000 }
        );
      }
    });
  };

  // ===== Step 2: Reverse Geocode (lat/lon → state + district) =====
  const reverseGeocode = async (lat, lon) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
      const res = await fetch(url, {
        headers: { 'Accept-Language': 'en', 'User-Agent': 'KisanMitraApp/1.0' },
      });
      const data = await res.json();
      const addr = data.address || {};

      // District — multiple fallbacks
      const district =
        addr.county ||
        addr.state_district ||
        addr.district ||
        addr.city ||
        addr.town ||
        addr.village ||
        'Nagpur';

      // State
      const state = addr.state || 'Maharashtra';

      // Clean district — remove "District" suffix
      const cleanDistrict = district.replace(/\s*district\s*/gi, '').trim();

      console.log('Reverse geocode:', { state, district: cleanDistrict, addr });
      return { state, district: cleanDistrict };
    } catch (e) {
      console.log('Reverse geocode error:', e);
      return { state: 'Maharashtra', district: 'Nagpur' };
    }
  };

  // ===== Step 3: Weather =====
  const loadWeather = async (lat, lon) => {
    try {
      const data = await fetchCurrentWeather(lat, lon);
      if (data) {
        setWeather(data);
        generateAlerts(data);
      }
    } catch (e) {
      console.log('Weather error:', e);
    } finally {
      setWeatherLoading(false);
    }
  };

  // ===== Step 4: Mandi Prices =====
  const loadMandiPrices = async (state, district) => {
    try {
      const prices = await fetchPrices(state, district);
      if (prices.length > 0) {
        setMandiData(prices.slice(0, 4));
        generateMandiAlerts(prices);
      } else {
        // Fallback — Maharashtra Nagpur
        if (district !== 'Nagpur') {
          const fallback = await fetchPrices('Maharashtra', 'Nagpur');
          setMandiData(fallback.slice(0, 4));
          generateMandiAlerts(fallback);
        }
      }
    } catch (e) {
      console.log('Mandi load error:', e);
    } finally {
      setMandiLoading(false);
    }
  };

  // ===== Auto Alerts — Mandi =====
  const generateMandiAlerts = (prices) => {
    const newAlerts = [];
    prices.forEach(item => {
      const diff = item.max - item.min;
      const changePercent = item.max > 0 ? Math.round((diff / item.max) * 100) : 0;
      if (changePercent > 15) {
        newAlerts.push(`📈 ${item.crop} ka bhav zyada utar-chadh raha hai — Sahi waqt pe becho!`);
      }
      if (item.modal > 5000) {
        newAlerts.push(`💰 ${item.crop} ka bhav ₹${item.modal.toLocaleString()}/q — Accha moka!`);
      }
    });
    setAlerts(prev => [...prev, ...newAlerts.slice(0, 2)]);
  };

  // ===== Auto Alerts — Weather =====
  const generateAlerts = (w) => {
    const newAlerts = [];
    if (w.mainWeather === 'Rain' || w.mainWeather === 'Thunderstorm') {
      newAlerts.push(`🌧️ Aaj baarish sambhav — Chhidkav mat karo!`);
    }
    if (w.temp > 38) {
      newAlerts.push(`🌡️ Bahut zyada garmi — Paudho ko paani do!`);
    }
    setAlerts(prev => [...prev, ...newAlerts]);
  };

  // ===== Weather Based Tip =====
  const getWeatherTip = () => {
    if (!weather) return 'Apni fasal ki regular jaanch karte raho aur mausam ke hisaab se kaam karo.';
    const { mainWeather, humidity, temp, windSpeed } = weather;
    if (mainWeather === 'Rain') return 'Baarish ho rahi hai — Khet mein paani bharne se bachao. Drainage check karo.';
    if (temp > 38) return 'Bahut garmi hai — Subah ya shaam ko khet mein jao. Paudho ko zyada paani do.';
    if (humidity > 80) return 'Nami bahut zyada hai — Fungal bimari ka khatra. Fungicide chhidkav karo.';
    if (windSpeed > 25) return 'Tej hawa chal rahi hai — Chhidkav mat karo. Nai fasal ko support do.';
    if (mainWeather === 'Clear' && temp < 35) return 'Mausam accha hai — Khet ka kaam karne ke liye sahi din. Chhidkav aur sinchai kar sakte ho.';
    return 'Mausam theek hai — Fasal ki dekhbhal karo aur mandi bhav check karo.';
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.greenDark} />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ===== HEADER ===== */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greetText}>{t.home.namaste}</Text>
              <Text style={styles.greetName}>Ramesh Patil</Text>
            </View>
            <TouchableOpacity style={styles.avatar}>
              <Text style={styles.avatarText}>👨‍🌾</Text>
            </TouchableOpacity>
          </View>

          {/* ===== WEATHER CARD ===== */}
          {weatherLoading ? (
            <View style={styles.weatherCardLoading}>
              <ActivityIndicator color={Colors.greenLight} size="small" />
              <Text style={styles.weatherLoadingText}>Mausam load ho raha hai...</Text>
            </View>
          ) : weather ? (
            <TouchableOpacity
              style={styles.weatherCard}
              onPress={() => navigation.navigate('Mausam')}
              activeOpacity={0.85}>
              <View style={styles.weatherLeft}>
                <Text style={styles.weatherEmoji}>{getWeatherEmoji(weather.mainWeather)}</Text>
                <View>
                  <Text style={styles.weatherTemp}>{weather.temp}°C</Text>
                  <Text style={styles.weatherCity}>{weather.city} · {weather.description}</Text>
                  <Text style={styles.weatherSub}>💧 {weather.humidity}% · 💨 {weather.windSpeed}km/h</Text>
                </View>
              </View>
              <View style={[styles.weatherAdvisory, {
                backgroundColor: weather.mainWeather === 'Rain'
                  ? 'rgba(74,144,217,0.2)'
                  : 'rgba(244,162,97,0.2)',
                borderColor: weather.mainWeather === 'Rain'
                  ? 'rgba(74,144,217,0.3)'
                  : 'rgba(244,162,97,0.3)',
              }]}>
                <Text style={[styles.advisoryText, {
                  color: weather.mainWeather === 'Rain' ? '#4a90d9' : Colors.amber,
                }]}>
                  {weather.mainWeather === 'Rain'
                    ? '🌧️ Baarish\nSambhav'
                    : weather.temp > 35
                    ? '🌡️ Garmi\nZyada'
                    : '💧 Sinchai\nKarein Aaj'}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.weatherCard}
              onPress={() => navigation.navigate('Mausam')}>
              <Text style={styles.weatherLoadingText}>🌤️ Mausam dekhne ke liye tap karo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ===== CONTENT ===== */}
        <View style={styles.content}>

          {/* ===== ALERT BANNERS ===== */}
          {alerts.length > 0 && alerts.map((alert, index) => (
            <View key={index} style={styles.alertBanner}>
              <Text style={styles.alertText}>{alert}</Text>
            </View>
          ))}

          {/* ===== FEATURES GRID ===== */}
          <Text style={styles.sectionTitle}>FEATURES</Text>
          <View style={styles.featuresGrid}>
            {features.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.featureCard, { backgroundColor: item.color }]}
                activeOpacity={0.8}
                onPress={() => navigation.navigate(item.screen)}>
                <Text style={styles.featureIcon}>{item.icon}</Text>
                <Text style={styles.featureTitle}>{item.title}</Text>
                <Text style={styles.featureSub}>{item.sub} →</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ===== MANDI STRIP ===== */}
          <View style={styles.mandiCard}>
            <View style={styles.mandiHeader}>
              <Text style={styles.mandiTitle}>
                🏪 {userDistrict ? `${userDistrict} Mandi` : t.home.mandiTitle}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Mandi')}>
                <Text style={styles.seeAll}>{t.home.seeAll}</Text>
              </TouchableOpacity>
            </View>

            {mandiLoading ? (
              <View style={styles.mandiLoadingWrap}>
                <ActivityIndicator color={Colors.greenMid} size="small" />
                <Text style={styles.mandiLoadingText}>Bhav load ho rahe hain...</Text>
              </View>
            ) : mandiData.length > 0 ? (
              mandiData.map((crop, index) => (
                <View
                  key={index}
                  style={[
                    styles.cropRow,
                    index === mandiData.length - 1 && styles.cropRowLast,
                  ]}>
                  <Text style={styles.cropName}>🌾 {crop.crop}</Text>
                  <Text style={styles.cropPrice}>₹{Number(crop.modal).toLocaleString()}/q</Text>
                  <View style={[
                    styles.changeBadge,
                    crop.max > crop.modal ? styles.changeBadgeUp : styles.changeBadgeDown,
                  ]}>
                    <Text style={[
                      styles.changeText,
                      crop.max > crop.modal ? styles.changeTextUp : styles.changeTextDown,
                    ]}>
                      {crop.max > crop.modal ? '▲' : '▼'} {crop.variety}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.mandiLoadingWrap}>
                <Text style={styles.mandiLoadingText}>
                  Data nahi mila — Mandi tab mein dekho
                </Text>
              </View>
            )}
          </View>

          {/* ===== TIP CARD — Weather Based ===== */}
          <View style={styles.tipCard}>
            <Text style={styles.tipHeader}>
              💡 {t.home.tip} {weather ? `· ${weather.city}` : ''}
            </Text>
            <Text style={styles.tipText}>{getWeatherTip()}</Text>
            {weather && (
              <View style={styles.tipWeatherRow}>
                <Text style={styles.tipWeatherBadge}>
                  {getWeatherEmoji(weather.mainWeather)} {weather.temp}°C
                </Text>
                <Text style={styles.tipWeatherBadge}>💧 {weather.humidity}%</Text>
                <Text style={styles.tipWeatherBadge}>💨 {weather.windSpeed}km/h</Text>
              </View>
            )}
          </View>

          <View style={styles.bottomSpace} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f0f4f1' },
  scroll: { flex: 1 },

  // Header
  header: {
    backgroundColor: Colors.greenDark,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greetText: { fontSize: 12, color: Colors.greenLight, opacity: 0.85 },
  greetName: { fontSize: 20, fontWeight: '700', color: Colors.white, marginTop: 2 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.amber,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 20 },

  // Weather Card
  weatherCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  weatherCardLoading: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  weatherLoadingText: { fontSize: 12, color: Colors.greenLight, opacity: 0.8 },
  weatherLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  weatherEmoji: { fontSize: 36 },
  weatherTemp: { fontSize: 24, fontWeight: '700', color: Colors.white, lineHeight: 28 },
  weatherCity: { fontSize: 11, color: Colors.greenLight, marginTop: 2 },
  weatherSub: { fontSize: 10, color: Colors.greenLight, marginTop: 2, opacity: 0.8 },
  weatherAdvisory: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
  },
  advisoryText: { fontSize: 10, fontWeight: '700', textAlign: 'center', lineHeight: 16 },

  // Content
  content: { padding: 16 },

  // Alert Banner
  alertBanner: {
    backgroundColor: '#fff8e8',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.amber,
  },
  alertText: { flex: 1, fontSize: 12, color: '#7a5500', fontWeight: '500', lineHeight: 18 },

  // Section Title
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#aaa',
    letterSpacing: 2,
    marginBottom: 12,
    marginTop: 8,
  },

  // Features Grid
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  featureCard: {
    width: '47%',
    borderRadius: 18,
    padding: 16,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  featureIcon: { fontSize: 26 },
  featureTitle: { fontSize: 13, fontWeight: '700', color: Colors.textDark, lineHeight: 18 },
  featureSub: { fontSize: 11, color: Colors.greenMid, fontWeight: '600' },

  // Mandi Card
  mandiCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  mandiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mandiTitle: { fontSize: 14, fontWeight: '700', color: Colors.textDark },
  seeAll: { fontSize: 12, color: Colors.greenMid, fontWeight: '600' },
  mandiLoadingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  mandiLoadingText: { fontSize: 12, color: Colors.textGrey },
  cropRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  cropRowLast: { borderBottomWidth: 0, paddingBottom: 0 },
  cropName: { fontSize: 13, color: '#444', fontWeight: '500', flex: 1 },
  cropPrice: { fontSize: 13, fontWeight: '700', color: Colors.greenDark, marginRight: 10 },
  changeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  changeBadgeUp: { backgroundColor: '#e8f5ee' },
  changeBadgeDown: { backgroundColor: '#ffeaea' },
  changeText: { fontSize: 10, fontWeight: '700' },
  changeTextUp: { color: Colors.greenMid },
  changeTextDown: { color: '#c0392b' },

  // Tip Card
  tipCard: {
    backgroundColor: Colors.greenDark,
    borderRadius: 18,
    padding: 16,
    gap: 8,
  },
  tipHeader: { fontSize: 13, fontWeight: '700', color: Colors.cream },
  tipText: { fontSize: 12, color: Colors.greenLight, lineHeight: 20, opacity: 0.9 },
  tipWeatherRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  tipWeatherBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 11,
    color: Colors.greenLight,
    fontWeight: '600',
  },

  bottomSpace: { height: 20 },
});
