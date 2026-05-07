// ===== PROFILE SCREEN =====

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

import { Colors } from '../theme/colors';

export default function ProfileScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.greenDark}
      />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.profileCircle}>
          <Ionicons
            name="person"
            size={38}
            color={Colors.white}
          />
        </View>

        <Text style={styles.userName}>
          Farmer Profile
        </Text>

        <Text style={styles.userSub}>
          Manage your account
        </Text>
      </View>

      {/* CONTENT */}
      <View style={styles.content}>
        
        {/* LANGUAGE CARD */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.card}
          onPress={() =>
            navigation.navigate('LanguageScreen')
          }>

          <View style={styles.left}>
            <View style={styles.iconWrap}>
              <Ionicons
                name="language"
                size={24}
                color={Colors.greenMid}
              />
            </View>

            <View>
              <Text style={styles.cardTitle}>
                Choose Language
              </Text>

              <Text style={styles.cardSub}>
                Change app language
              </Text>
            </View>
          </View>

          <Ionicons
            name="chevron-forward"
            size={22}
            color={Colors.textGrey}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f0f4f1',
  },

  header: {
    backgroundColor: Colors.greenDark,
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  profileCircle: {
    width: 85,
    height: 85,
    borderRadius: 45,
    backgroundColor: Colors.greenMid,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },

  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
  },

  userSub: {
    fontSize: 12,
    color: Colors.greenLight,
    marginTop: 4,
  },

  content: {
    padding: 16,
    marginTop: -10,
  },

  card: {
    backgroundColor: Colors.white,
    borderRadius: 22,
    padding: 18,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    elevation: 4,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconWrap: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#eef8f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textDark,
  },

  cardSub: {
    fontSize: 12,
    color: Colors.textGrey,
    marginTop: 3,
  },
});