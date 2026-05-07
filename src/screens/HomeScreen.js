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
import Ionicons from 'react-native-vector-icons/Ionicons';

import { Colors } from '../theme/colors';
import { useLanguage } from '../context/LanguageContext';

import {
  fetchCurrentWeather,
} from '../services/weatherService';

import { fetchPrices } from '../services/mandiService';

const FALLBACK_LAT = 21.1458;
const FALLBACK_LON = 79.0882;

export default function HomeScreen({ navigation }) {
  const { t } = useLanguage();

  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] =
    useState(true);

  const [mandiData, setMandiData] = useState([]);
  const [mandiLoading, setMandiLoading] =
    useState(true);

  const [userDistrict, setUserDistrict] =
    useState('');

  const [alerts, setAlerts] = useState([]);

  // ===== FEATURES =====
  const features = [
    {
      icon: 'analytics-outline',
      title: t.home.mandi,
      sub: 'Live Market Rates',
      color: '#e8f5ee',
      iconBg: '#d7f5e3',
      iconColor: '#1b8f5a',
      screen: 'Mandi',
    },
    {
      icon: 'partly-sunny-outline',
      title: t.home.mausam,
      sub: 'Today Weather',
      color: '#fff4e5',
      iconBg: '#ffe5c2',
      iconColor: '#f39c12',
      screen: 'Mausam',
    },
    {
      icon: 'leaf-outline',
      title: t.home.disease,
      sub: 'AI Disease Detection',
      color: '#eaf0ff',
      iconBg: '#dbe7ff',
      iconColor: '#4c7cf0',
      screen: 'Disease',
    },
    {
      icon: 'document-text-outline',
      title: t.home.schemes,
      sub: 'Government Schemes',
      color: '#ffeaea',
      iconBg: '#ffd6d6',
      iconColor: '#d64545',
      screen: 'Schemes',
    },
  ];

  useEffect(() => {
    loadData();
  }, []);

  // ===== LOAD DATA =====
  const loadData = async () => {
    try {
      let lat = FALLBACK_LAT;
      let lon = FALLBACK_LON;

      if (Platform.OS === 'android') {
        const granted =
          await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS
              .ACCESS_FINE_LOCATION
          );

        if (
          granted ===
          PermissionsAndroid.RESULTS.GRANTED
        ) {
          Geolocation.getCurrentPosition(
            async pos => {
              lat = pos.coords.latitude;
              lon = pos.coords.longitude;

              await loadWeather(lat, lon);
              await loadMandiPrices();
            },
            async () => {
              await loadWeather(lat, lon);
              await loadMandiPrices();
            },
            {
              enableHighAccuracy: false,
              timeout: 10000,
            }
          );
        } else {
          await loadWeather(lat, lon);
          await loadMandiPrices();
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  // ===== WEATHER =====
  const loadWeather = async (lat, lon) => {
    try {
      const data = await fetchCurrentWeather(
        lat,
        lon
      );

      if (data) {
        setWeather(data);

        if (data.temp > 35) {
          setAlerts([
            'High temperature today. Water your crops properly.',
          ]);
        }
      }
    } catch (e) {
      console.log(e);
    } finally {
      setWeatherLoading(false);
    }
  };

  // ===== MANDI =====
  const loadMandiPrices = async () => {
    try {
      const prices = await fetchPrices(
        'Maharashtra',
        'Nagpur'
      );

      setMandiData(prices.slice(0, 4));
      setUserDistrict('Nagpur');
    } catch (e) {
      console.log(e);
    } finally {
      setMandiLoading(false);
    }
  };

  // ===== WEATHER ICON =====
  const getWeatherIcon = weatherType => {
    switch (weatherType) {
      case 'Rain':
        return 'rainy-outline';

      case 'Clouds':
        return 'cloud-outline';

      case 'Thunderstorm':
        return 'thunderstorm-outline';

      default:
        return 'sunny-outline';
    }
  };

  return (
    <SafeAreaView
      style={styles.root}
      edges={['top']}>

      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.greenDark}
      />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}>

        {/* ===== HEADER ===== */}
        <View style={styles.header}>
          <View style={styles.headerTop}>

            <View>
              <Text style={styles.greetText}>
                {t.home.namaste}
              </Text>

              <Text style={styles.greetName}>
                Ramesh Patil
              </Text>
            </View>

            <TouchableOpacity
              style={styles.avatar}>

              <Ionicons
                name="person-outline"
                size={22}
                color="#fff"
              />
            </TouchableOpacity>
          </View>

          {/* ===== WEATHER CARD ===== */}
          {weatherLoading ? (
            <View
              style={styles.weatherCardLoading}>
              <ActivityIndicator
                color="#fff"
                size="small"
              />

              <Text
                style={
                  styles.weatherLoadingText
                }>
                Loading weather...
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.weatherCard}
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate('Mausam')
              }>

              <View style={styles.weatherLeft}>
                <View
                  style={
                    styles.weatherIconWrap
                  }>

                  <Ionicons
                    name={getWeatherIcon(
                      weather?.mainWeather
                    )}
                    size={34}
                    color="#fff"
                  />
                </View>

                <View>
                  <Text
                    style={
                      styles.weatherTemp
                    }>
                    {weather?.temp}°C
                  </Text>

                  <Text
                    style={
                      styles.weatherCity
                    }>
                    {weather?.city}
                  </Text>

                  <Text
                    style={
                      styles.weatherSub
                    }>
                    Humidity:{' '}
                    {weather?.humidity}% • Wind:{' '}
                    {weather?.windSpeed}km/h
                  </Text>
                </View>
              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color="#fff"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* ===== CONTENT ===== */}
        <View style={styles.content}>

          {/* ===== ALERTS ===== */}
          {alerts?.length > 0 &&
            alerts?.map((item, index) => (
              <View
                key={index}
                style={styles.alertBanner}>

                <View
                  style={styles.alertRow}>

                  <Ionicons
                    name="notifications-outline"
                    size={18}
                    color="#d68910"
                  />

                  <Text
                    style={styles.alertText}>
                    {item}
                  </Text>
                </View>
              </View>
            ))}

          {/* ===== FEATURES ===== */}
          <Text style={styles.sectionTitle}>
            FEATURES
          </Text>

          <View style={styles.featuresGrid}>
            {features.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.featureCard,
                  {
                    backgroundColor:
                      item.color,
                  },
                ]}
                activeOpacity={0.85}
                onPress={() =>
                  navigation.navigate(
                    item.screen
                  )
                }>

                <View
                  style={[
                    styles.featureIconWrap,
                    {
                      backgroundColor:
                        item.iconBg,
                    },
                  ]}>

                  <Ionicons
                    name={item.icon}
                    size={24}
                    color={item.iconColor}
                  />
                </View>

                <View
                  style={{
                    marginTop: 10,
                  }}>

                  <Text
                    style={
                      styles.featureTitle
                    }>
                    {item.title}
                  </Text>

                  <Text
                    style={
                      styles.featureSub
                    }>
                    {item.sub}
                  </Text>
                </View>

                <View style={styles.arrowWrap}>
                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color={item.iconColor}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* ===== MANDI ===== */}
          <View style={styles.mandiCard}>
            <View style={styles.mandiHeader}>

              <Text style={styles.mandiTitle}>
                {userDistrict} Mandi
              </Text>

              <TouchableOpacity>
                <Text style={styles.seeAll}>
                  {t.home.seeAll}
                </Text>
              </TouchableOpacity>
            </View>

            {mandiLoading ? (
              <ActivityIndicator
                color={Colors.greenMid}
                size="small"
              />
            ) : (
              mandiData.map(
                (crop, index) => (
                  <View
                    key={index}
                    style={styles.cropRow}>

                    <View
                      style={
                        styles.cropLeft
                      }>

                      <Ionicons
                        name="leaf-outline"
                        size={16}
                        color={
                          Colors.greenMid
                        }
                      />

                      <Text
                        style={
                          styles.cropName
                        }>
                        {crop.crop}
                      </Text>
                    </View>

                    <Text
                      style={
                        styles.cropPrice
                      }>
                      ₹{crop.modal}/q
                    </Text>
                  </View>
                )
              )
            )}
          </View>

          {/* ===== TIP ===== */}
          <View style={styles.tipCard}>
            <Text style={styles.tipHeader}>
              💡 {t.home.tip}
            </Text>

            <Text style={styles.tipText}>
              Keep monitoring crop health and
              weather conditions regularly for
              better farming decisions.
            </Text>
          </View>

          <View style={{ height: 30 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f4f7f5',
  },

  scroll: {
    flex: 1,
  },

  // ===== HEADER =====
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
    marginBottom: 18,
  },

  greetText: {
    fontSize: 12,
    color: Colors.greenLight,
  },

  greetName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginTop: 2,
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor:
      'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ===== WEATHER =====
  weatherCard: {
    backgroundColor:
      'rgba(255,255,255,0.12)',
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  weatherCardLoading: {
    backgroundColor:
      'rgba(255,255,255,0.12)',
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },

  weatherLoadingText: {
    color: '#fff',
    fontSize: 13,
  },

  weatherLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  weatherIconWrap: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor:
      'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  weatherTemp: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '700',
  },

  weatherCity: {
    color: '#fff',
    fontSize: 13,
    marginTop: 2,
  },

  weatherSub: {
    color: Colors.greenLight,
    fontSize: 11,
    marginTop: 3,
  },

  // ===== CONTENT =====
  content: {
    padding: 16,
  },

  // ===== ALERT =====
  alertBanner: {
    backgroundColor: '#fff8e8',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f1b000',
  },

  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  alertText: {
    flex: 1,
    color: '#7a5500',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },

  // ===== SECTION =====
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#999',
    letterSpacing: 2,
    marginBottom: 12,
  },

  // ===== FEATURES =====
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  featureCard: {
    width: '48%',
    borderRadius: 22,
    padding: 16,
    minHeight: 145,
    marginBottom: 12,
    position: 'relative',
  },

  featureIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
    lineHeight: 20,
  },

  featureSub: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
    fontWeight: '500',
  },

  arrowWrap: {
    position: 'absolute',
    right: 14,
    bottom: 14,
  },

  // ===== MANDI =====
  mandiCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 18,
  },

  mandiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  mandiTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textDark,
  },

  seeAll: {
    fontSize: 12,
    color: Colors.greenMid,
    fontWeight: '600',
  },

  cropRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f4',
  },

  cropLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  cropName: {
    fontSize: 13,
    color: '#444',
    fontWeight: '600',
  },

  cropPrice: {
    fontSize: 13,
    color: Colors.greenDark,
    fontWeight: '700',
  },

  // ===== TIP =====
  tipCard: {
    backgroundColor: Colors.greenDark,
    borderRadius: 20,
    padding: 16,
  },

  tipHeader: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },

  tipText: {
    color: Colors.greenLight,
    fontSize: 12,
    lineHeight: 20,
  },
});