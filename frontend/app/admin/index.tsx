// app/(tabs)/menu/login/admin/index.tsx
import { useRouter } from 'expo-router';
import { Image, Pressable } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Footer from '@/components/Footer';
import ContainerStyles from '@/components/ContainerStyles';
import ButtonAndInputStyles from '@/components/ButtonAndInputStyles';

export default function AdminScreen() {
  const router = useRouter();

  return (
    <SafeAreaView accessible={false} style={{ flex: 1, backgroundColor: '#560324' }}>
      <ParallaxScrollView>

        <Image
          source={require('@/assets/images/admin.png')}
          style={ContainerStyles.titleImage}
           accessible={true}
            accessibilityLabel="Admin Homepage header image"
        />

        <ThemedView style={ContainerStyles.titleContainer}>
          <ThemedText type="title" accessibilityRole="header">Admin Homepage</ThemedText>
        </ThemedView>

        {/* Buttons Container */}
        <ThemedView >

          {/* Redeem Voucher */}
          <Pressable
            style={ButtonAndInputStyles.button}
            onPress={() => router.push('/admin/redeem')}
            accessibilityRole="button"
            accessibilityLabel="Redeem voucher"
            accessibilityHint="Navigate to redeem voucher screen"
          >
            <ThemedText>Redeem Voucher</ThemedText>
          </Pressable>

          {/* Vouchers */}
          <Pressable
            style={ButtonAndInputStyles.button}
            onPress={() => router.push('/admin/vouchersAdmin')}
            accessibilityRole="button"
            accessibilityLabel="View vouchers"
            accessibilityHint="Navigate to vouchers management screen"
          >
            <ThemedText>Vouchers</ThemedText>
          </Pressable>

          {/* Bookings */}
          <Pressable
            style={ButtonAndInputStyles.button}
            onPress={() => router.push('/admin/bookingsAdmin')}
            accessibilityRole="button"
            accessibilityLabel="View bookings"
            accessibilityHint="Navigate to bookings management screen"
          >
            <ThemedText>Bookings</ThemedText>
          </Pressable>

          <Pressable
            style={ButtonAndInputStyles.button}
            onPress={() => router.push('/(tabs)/menu')}
            accessibilityRole="button"
            accessibilityLabel="Back to main app"
            accessibilityHint="Returns to the main menu"
          >
          <ThemedText>← Back to App</ThemedText>
        </Pressable>

        </ThemedView>

        <Footer />
      </ParallaxScrollView>
    </SafeAreaView>
  );
}
