import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  StatusBar,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../theme/colors';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    icon: '🌾',
    title: 'Get The Best\nPrice For Your Crops',
    subtitle: 'Real-time market prices anytime, anywhere',
    features: [
      {
        icon: '📊',
        text: 'Live Market Prices',
        sub: 'Nagpur, Amravati, Wardha',
      },
      {
        icon: '🔔',
        text: 'Price Alerts',
        sub: 'Get notified when prices increase',
      },
    ],
  },
  {
    id: '2',
    icon: '🌤️',
    title: 'Smart Weather\nAdvisory',
    subtitle: 'Hyperlocal weather forecast for your village',
    features: [
      {
        icon: '🌧️',
        text: 'Rain Alerts',
        sub: 'Best time for sowing',
      },
      {
        icon: '💧',
        text: 'Irrigation Guide',
        sub: 'Know whether to water today or not',
      },
    ],
  },
  {
    id: '3',
    icon: '🔬',
    title: 'Detect Crop\nDiseases',
    subtitle: 'Capture a photo — AI will detect the disease',
    features: [
      {
        icon: '📷',
        text: 'Scan with Camera',
        sub: 'Take a direct photo of the plant',
      },
      {
        icon: '💊',
        text: 'Treatment Suggestions',
        sub: 'Available in English, Hindi & Marathi',
      },
    ],
  },
];

export default function OnboardingScreen() {
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.replace('Login');
    }
  };

  const handleSkip = () => {
    navigation.replace('Login');
  };

  const renderSlide = ({ item }) => (
    <View style={styles.slide}>
      {/* Top Green Section */}
      <View style={styles.slideTop}>
        <View style={styles.illustrationCircle}>
          <Text style={styles.illustrationIcon}>{item.icon}</Text>
        </View>
        <Text style={styles.slideTitle}>{item.title}</Text>
        <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
      </View>

      {/* Feature Chips */}
      <View style={styles.featuresWrap}>
        {item.features.map((feature, index) => (
          <View key={index} style={styles.featureChip}>
            <View style={styles.chipIconWrap}>
              <Text style={styles.chipIcon}>{feature.icon}</Text>
            </View>
            <View>
              <Text style={styles.chipText}>{feature.text}</Text>
              <Text style={styles.chipSub}>{feature.sub}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.greenDark} />

      {/* Skip Button */}
      <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        scrollEnabled={true}
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={e => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        scrollEventThrottle={16}
      />

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {/* Dots */}
        <View style={styles.dotsRow}>
          {slides.map((_, index) => {
            const dotWidth = scrollX.interpolate({
              inputRange: [
                (index - 1) * width,
                index * width,
                (index + 1) * width,
              ],
              outputRange: [8, 24, 8],
              extrapolate: 'clamp',
            });
            const dotColor = scrollX.interpolate({
              inputRange: [
                (index - 1) * width,
                index * width,
                (index + 1) * width,
              ],
              outputRange: ['#ccc', Colors.greenMid, '#ccc'],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={index}
                style={[styles.dot, { width: dotWidth, backgroundColor: dotColor }]}
              />
            );
          })}
        </View>

        {/* Next / Get Started Button */}
        {/* Next / Get Started Button */}
        <TouchableOpacity
          style={styles.nextBtn}
          onPress={handleNext}
          activeOpacity={0.85}>
          <Text style={styles.nextBtnText}>
            {currentIndex === slides.length - 1
              ? 'Get Started'
              : 'Next'}
          </Text>
        </TouchableOpacity>

        {/* Already have account */}
        <View style={styles.loginRow}>
          <Text style={styles.loginText}>
            Already have an account?{' '}
          </Text>

          <TouchableOpacity
            onPress={() => navigation.replace('Login')}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f0f4f1',
  },

  // Skip
  skipBtn: {
    position: 'absolute',
    top: 52,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  skipText: {
    fontSize: 13,
    color: Colors.white,
    fontWeight: '600',
  },

  // Slide
  slide: {
    width,
    flex: 1,
  },

  // Top green
  slideTop: {
    backgroundColor: Colors.greenDark,
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 28,
    alignItems: 'center',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    minHeight: '52%',
    justifyContent: 'center',
  },
  illustrationCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  illustrationIcon: {
    fontSize: 54,
  },
  slideTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.white,
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 10,
  },
  slideSubtitle: {
    fontSize: 13,
    color: Colors.greenLight,
    textAlign: 'center',
    opacity: 0.85,
    lineHeight: 20,
  },

  // Features
  featuresWrap: {
    padding: 20,
    gap: 12,
    marginTop: 4,
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  chipIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#e8f5ee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipIcon: {
    fontSize: 22,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
  },
  chipSub: {
    fontSize: 11,
    color: Colors.textGrey,
    marginTop: 2,
  },

  // Bottom
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 36,
    paddingTop: 16,
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#f0f4f1',
  },

  // Dots
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },

  // Next Button
  nextBtn: {
    width: '100%',
    backgroundColor: Colors.greenMid,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: Colors.greenMid,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  nextBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.5,
  },

  // Login Row
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 13,
    color: Colors.textGrey,
  },
  loginLink: {
    fontSize: 13,
    color: Colors.greenMid,
    fontWeight: '700',
  },
});
