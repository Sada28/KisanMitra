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
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Geolocation from '@react-native-community/geolocation';
import { Colors } from '../theme/colors';
import { useLanguage } from '../context/LanguageContext';
import {
  fetchCurrentWeather,
  fetchForecast,
  getWeatherEmoji,
  getFarmingAdvisory,
  getDayName,
} from '../services/weatherService';

// ===== STAT CARD =====
function StatCard({ icon, label, value }) {
  return (
    <View style={sc.card}>
      <Text style={sc.icon}>{icon}</Text>
      <Text style={sc.value}>{value}</Text>
      <Text style={sc.label}>{label}</Text>
    </View>
  );
}

// ===== FORECAST DAY CARD =====
function ForecastCard({ item, isToday }) {
  return (
    <View style={[fc.card, isToday && fc.cardActive]}>
      <Text style={[fc.day, isToday && fc.dayActive]}>{getDayName(item.date)}</Text>
      <Text style={fc.emoji}>{getWeatherEmoji(item.mainWeather)}</Text>
      <Text style={[fc.temp, isToday && fc.tempActive]}>{item.temp}°</Text>
      <Text style={fc.range}>{item.tempMin}° / {item.tempMax}°</Text>
      {item.rain > 0 && (
        <Text style={fc.rain}>🌧 {item.rain}mm</Text>
      )}
    </View>
  );
}

// ===== MAIN SCREEN =====
export default function MausamScreen() {
   const { t } = useLanguage();

  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [locationName, setLocationName] = useState('');

  useEffect(() => {
    requestLocationAndFetch();
  }, []);

  // ===== Location Permission =====
  const requestLocationAndFetch = async () => {
    setLoading(true);
    setError('');

    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'Mausam jaanne ke liye location chahiye',
            buttonNeutral: 'Baad Mein',
            buttonNegative: 'Nahi',
            buttonPositive: 'Haan',
          }
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          setError('Location permission nahi mili — Manual city select karo');
          setLoading(false);
          return;
        }
      }

      // Location fetch karo
      Geolocation.getCurrentPosition(
        async position => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lon: longitude });
          await fetchWeatherData(latitude, longitude);
        },
        err => {
          console.log('Location error:', err);
          setError('Location nahi mili — Default Nagpur ka mausam dikh raha hai');
          // Default — Nagpur
          fetchWeatherData(21.1458, 79.0882);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } catch (e) {
      console.log('Permission error:', e);
      setError('Kuch gadbad hui — Nagpur ka mausam dikh raha hai');
      fetchWeatherData(21.1458, 79.0882);
    }
  };

  // ===== Fetch Weather =====
  const fetchWeatherData = async (lat, lon) => {
    try {
      const [currentData, forecastData] = await Promise.all([
        fetchCurrentWeather(lat, lon),
        fetchForecast(lat, lon),
      ]);

      if (currentData) {
        setWeather(currentData);
        setLocationName(`${currentData.city}`);
      } else {
        setError('Mausam data load nahi hua — Retry karo');
      }

      setForecast(forecastData);
    } catch (e) {
      setError('Network error — Retry karo');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (location) {
      fetchWeatherData(location.lat, location.lon);
    } else {
      requestLocationAndFetch();
    }
  };

  // ===== Format Time =====
  const formatTime = (unix) => {
    const date = new Date(unix * 1000);
    return date.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const advisory = weather ? getFarmingAdvisory(weather) : null;

  // ===== LOADING STATE =====
  if (loading) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.greenDark} />
        <View style={styles.loadingWrap}>
          <Text style={styles.loadingEmoji}>🌤️</Text>
          <ActivityIndicator color={Colors.greenMid} size="large" />
          <Text style={styles.loadingText}>Aapka mausam dhund rahe hain...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.greenDark} />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.greenMid]}
            tintColor={Colors.greenMid}
          />
        }>

        {/* ===== HEADER ===== */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>🌤️ {t.mausam.title}</Text>
              <Text style={styles.locationText}>
                📍 {locationName || 'Location dhund rahe hain...'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.refreshBtn}
              onPress={onRefresh}>
              <Text style={styles.refreshIcon}>🔄</Text>
            </TouchableOpacity>
          </View>

          {/* ===== MAIN TEMP CARD ===== */}
          {weather && (
            <View style={styles.mainWeatherCard}>
              <View style={styles.tempRow}>
                <Text style={styles.weatherEmoji}>
                  {getWeatherEmoji(weather.mainWeather)}
                </Text>
                <View>
                  <Text style={styles.tempText}>{weather.temp}°C</Text>
                  <Text style={styles.feelsLike}>Mehsoos: {weather.feelsLike}°C</Text>
                </View>
              </View>
              <Text style={styles.weatherDesc}>{weather.description}</Text>

              {/* Sunrise Sunset */}
              <View style={styles.sunRow}>
                <Text style={styles.sunText}>🌅 {formatTime(weather.sunrise)}</Text>
                <View style={styles.sunDivider} />
                <Text style={styles.sunText}>🌇 {formatTime(weather.sunset)}</Text>
              </View>
            </View>
          )}
        </View>

        {/* ===== ERROR BANNER ===== */}
        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        ) : null}

        {weather && (
          <>
            {/* ===== STATS GRID ===== */}
            <View style={styles.statsGrid}>
              <StatCard icon="💧" label={t.mausam.humidity} value={`${weather.humidity}%`} />
              <StatCard icon="💨" label={t.mausam.wind} value={`${weather.windSpeed} km/h`} />
              <StatCard icon="👁️" label="Visibility" value={`${weather.visibility} km`} />
              <StatCard icon="🌡️" label="Pressure" value={`${weather.pressure} hPa`} />
              <StatCard icon="☁️" label="Badal" value={`${weather.cloudiness}%`} />
              <StatCard icon="🌡️" label="Feels Like" value={`${weather.feelsLike}°C`} />
            </View>

            {/* ===== FARMING ADVISORY ===== */}
            {advisory && (
              <View style={[styles.advisoryCard, {
                backgroundColor: advisory.color,
                borderLeftColor: advisory.borderColor,
              }]}>
                <View style={styles.advisoryHeader}>
                  <Text style={styles.advisoryIcon}>{advisory.icon}</Text>
                  <Text style={[styles.advisoryTitle, { color: advisory.borderColor }]}>
                    {advisory.title}
                  </Text>
                </View>
                <Text style={styles.advisoryText}>{advisory.advice}</Text>
              </View>
            )}

            {/* ===== 5 DAY FORECAST ===== */}
            {forecast.length > 0 && (
              <View style={styles.forecastSection}>
                <Text style={styles.sectionTitle}>📅 5 Din Ka Mausam</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.forecastScroll}>
                  {forecast.map((item, index) => (
                    <ForecastCard
                      key={item.date}
                      item={item}
                      isToday={index === 0}
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* ===== FARMING TIPS ===== */}
            <View style={styles.tipsCard}>
              <Text style={styles.tipsTitle}>🌾 Kisan Tips</Text>
              <View style={styles.tipRow}>
                <Text style={styles.tipIcon}>💧</Text>
                <Text style={styles.tipText}>
                  {weather.humidity > 70
                    ? 'Nami zyada hai — Sinchai kam karo'
                    : 'Nami thodi hai — Sinchai karo aaj'}
                </Text>
              </View>
              <View style={styles.tipRow}>
                <Text style={styles.tipIcon}>🌡️</Text>
                <Text style={styles.tipText}>
                  {weather.temp > 35
                    ? 'Garmi zyada — Subah ya shaam kaam karo'
                    : 'Temp sahi hai — Khet ka kaam kar sakte ho'}
                </Text>
              </View>
              <View style={styles.tipRow}>
                <Text style={styles.tipIcon}>💨</Text>
                <Text style={styles.tipText}>
                  {weather.windSpeed > 20
                    ? 'Tej hawa — Chhidkav aaj mat karo'
                    : 'Hawa theek hai — Chhidkav kar sakte ho'}
                </Text>
              </View>
            </View>
          </>
        )}

        {/* No Weather Data */}
        {!weather && !loading && (
          <View style={styles.noData}>
            <Text style={styles.noDataEmoji}>🌧️</Text>
            <Text style={styles.noDataText}>Mausam data nahi mila</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={requestLocationAndFetch}>
              <Text style={styles.retryText}>Dobara Try Karo</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ===== STAT CARD STYLES =====
const sc = StyleSheet.create({
  card: {
    width: '30%',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  icon: { fontSize: 22 },
  value: { fontSize: 14, fontWeight: '800', color: Colors.textDark },
  label: { fontSize: 9, color: Colors.textGrey, fontWeight: '600', textAlign: 'center' },
});

// ===== FORECAST CARD STYLES =====
const fc = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    marginRight: 10,
    width: 90,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardActive: {
    backgroundColor: Colors.greenDark,
  },
  day: { fontSize: 11, fontWeight: '700', color: Colors.textGrey },
  dayActive: { color: Colors.greenLight },
  emoji: { fontSize: 24, marginVertical: 4 },
  temp: { fontSize: 18, fontWeight: '800', color: Colors.textDark },
  tempActive: { color: Colors.white },
  range: { fontSize: 9, color: Colors.textGrey },
  rain: { fontSize: 9, color: '#4a90d9', fontWeight: '600' },
});

// ===== MAIN STYLES =====
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f0f4f1' },
  scroll: { flex: 1 },

  // Loading
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingEmoji: { fontSize: 60 },
  loadingText: { fontSize: 14, color: Colors.textGrey },

  // Header
  header: {
    backgroundColor: Colors.greenDark,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    gap: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.white },
  locationText: { fontSize: 12, color: Colors.greenLight, marginTop: 3, opacity: 0.9 },
  refreshBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshIcon: { fontSize: 18 },

  // Main Weather Card
  mainWeatherCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 8,
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  weatherEmoji: { fontSize: 56 },
  tempText: { fontSize: 52, fontWeight: '800', color: Colors.white, lineHeight: 60 },
  feelsLike: { fontSize: 12, color: Colors.greenLight, opacity: 0.9 },
  weatherDesc: {
    fontSize: 14,
    color: Colors.greenLight,
    fontWeight: '600',
    textTransform: 'capitalize',
    opacity: 0.9,
  },
  sunRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    padding: 10,
    marginTop: 4,
  },
  sunText: { flex: 1, fontSize: 12, color: Colors.amber, fontWeight: '600', textAlign: 'center' },
  sunDivider: { width: 1, height: 16, backgroundColor: 'rgba(255,255,255,0.2)' },

  // Error
  errorBanner: {
    backgroundColor: '#fff8e8',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.amber,
  },
  errorText: { fontSize: 12, color: '#7a5500', fontWeight: '500' },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: 16,
    gap: 10,
    justifyContent: 'space-between',
  },

  // Advisory
  advisoryCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    gap: 8,
  },
  advisoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  advisoryIcon: { fontSize: 20 },
  advisoryTitle: { fontSize: 15, fontWeight: '800' },
  advisoryText: { fontSize: 13, color: Colors.textDark, lineHeight: 20, opacity: 0.85 },

  // Forecast
  forecastSection: { marginHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: Colors.textDark, marginBottom: 12 },
  forecastScroll: { paddingBottom: 4 },

  // Tips
  tipsCard: {
    backgroundColor: Colors.greenDark,
    marginHorizontal: 16,
    borderRadius: 18,
    padding: 16,
    gap: 12,
    marginBottom: 16,
  },
  tipsTitle: { fontSize: 14, fontWeight: '700', color: Colors.cream },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  tipIcon: { fontSize: 16 },
  tipText: { flex: 1, fontSize: 12, color: Colors.greenLight, lineHeight: 18, opacity: 0.9 },

  // No Data
  noData: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  noDataEmoji: { fontSize: 50 },
  noDataText: { fontSize: 16, color: Colors.textDark, fontWeight: '600' },
  retryBtn: {
    backgroundColor: Colors.greenMid,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 4,
  },
  retryText: { fontSize: 14, color: Colors.white, fontWeight: '700' },
});
