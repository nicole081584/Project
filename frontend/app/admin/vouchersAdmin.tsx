// app/admin/vouchersAdmin.tsx

import { useRouter } from 'expo-router';
import { Image, TextInput, Pressable, View, Platform } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Footer from '@/components/Footer';
import ContainerStyles from '@/components/ContainerStyles';
import ButtonAndInputStyles from '@/components/ButtonAndInputStyles';
import { searchVouchers } from '@/libraries/backendService';

export default function VouchersAdminScreen() {
  const router = useRouter();

  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  const [showFrom, setShowFrom] = useState(false);
  const [showTo, setShowTo] = useState(false);

  const [isSold, setIsSold] = useState(false);
  const [isRedeemed, setIsRedeemed] = useState(false);

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString();
  };

  const handleValidation = () => {
  // 1. Dates must exist
  if (!fromDate || !toDate) {
    alert('Please select both From and To dates');
    return;
  }

  // 2. To date cannot be before From date
  if (toDate < fromDate) {
    alert('The "To" date cannot be before the "From" date');
    return;
  }

  // 3. Exactly ONE checkbox must be selected
  if ((isSold && isRedeemed) || (!isSold && !isRedeemed)) {
    alert('Please select either Sold OR Redeemed (not both)');
    return;
  }

  // ✅ Passed validation
  console.log('Search with:', {
    fromDate,
    toDate,
    isSold,
    isRedeemed,
  });

  handleRetrieval('range');
  };

  const formatForAPI = (date: Date) => {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
};

const handleRetrieval = async (
  mode: 'todaySold' | 'todayRedeemed' | 'range'
) => {

  let filters: any = {};

  const today = new Date();
  const todayFormatted = formatForAPI(today);

  // --- SOLD TODAY ---
  if (mode === 'todaySold') {
    filters = {
      fromDate: todayFormatted,
      toDate: todayFormatted,
      status: 'sold',
    };
  }

  // --- REDEEMED TODAY ---
  else if (mode === 'todayRedeemed') {
    filters = {
      fromDate: todayFormatted,
      toDate: todayFormatted,
      status: 'redeemed',
    };
  }

  // --- DATE RANGE ---
  else {
    if (!fromDate || !toDate) return;

    filters = {
      fromDate: formatForAPI(fromDate),
      toDate: formatForAPI(toDate),
      status: isSold ? 'sold' : 'redeemed',
    };
  }

  const results = await searchVouchers(filters);

  console.log("Results:", results);

};

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#560324' }}>
      <ParallaxScrollView>

        {/* Header Image */}
        <Image
          source={require('@/assets/images/admin.png')}
          style={ContainerStyles.titleImage}
          accessible={true}
          accessibilityLabel="Admin vouchers page header image"
        />

        {/* Title */}
        <ThemedView style={ContainerStyles.titleContainer}>
          <ThemedText type="title" accessibilityRole="header">
            Voucher Management
          </ThemedText>
        </ThemedView>

        {/* --- Buttons --- */}
        <ThemedView>

          <Pressable
            style={ButtonAndInputStyles.button}
            onPress={() => handleRetrieval('todaySold')}
            accessibilityRole="button"
            accessibilityLabel="View vouchers sold today"
            accessibilityHint="Displays all vouchers sold today"
          >
            <ThemedText>Vouchers Sold Today</ThemedText>
          </Pressable>

          <Pressable
            style={ButtonAndInputStyles.button}
            onPress={() => handleRetrieval('todayRedeemed')}
            accessibilityRole="button"
            accessibilityLabel="View vouchers redeemed today"
            accessibilityHint="Displays all vouchers redeemed today"
          >
            <ThemedText>Vouchers Redeemed Today</ThemedText>
          </Pressable>

        </ThemedView>

        {/* --- Date Range Search --- */}
        <ThemedView>

          <ThemedText type="subtitle">
            Search Vouchers by Date Range
          </ThemedText>

          {/* SIDE BY SIDE DATE INPUTS */}
          <View style={{ flexDirection: 'row', gap: 10 }}>

            {/* FROM DATE */}
            <View style={{ flex: 1 }}>
              <ThemedText type="default">From</ThemedText>

              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderRadius: 8,
                paddingHorizontal: 10,
                backgroundColor: '#fff'
              }}>
                <TextInput
                  style={{ flex: 1, paddingVertical: 10 }}
                  value={formatDate(fromDate)}
                  placeholder="Select date"
                  editable={false}
                  accessibilityLabel="From date input"
                  accessibilityHint="Select the start date for voucher search"
                />

                <Pressable
                  onPress={() => setShowFrom(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Open from date picker"
                  hitSlop={10}
                >
                  <Ionicons name="calendar-outline" size={22} />
                </Pressable>
              </View>

              {showFrom && (
                <DateTimePicker
                  value={fromDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowFrom(Platform.OS === 'ios');
                    if (selectedDate) setFromDate(selectedDate);
                  }}
                />
              )}
            </View>

            {/* TO DATE */}
            <View style={{ flex: 1 }}>
              <ThemedText type="default">To</ThemedText>

              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderRadius: 8,
                paddingHorizontal: 10,
                backgroundColor: '#fff'
              }}>
                <TextInput
                  style={{ flex: 1, paddingVertical: 10 }}
                  value={formatDate(toDate)}
                  placeholder="Select date"
                  editable={false}
                  accessibilityLabel="To date input"
                  accessibilityHint="Select the end date for voucher search"
                />

                <Pressable
                  onPress={() => setShowTo(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Open to date picker"
                  hitSlop={10}
                >
                  <Ionicons name="calendar-outline" size={22} />
                </Pressable>
              </View>

              {showTo && (
                <DateTimePicker
                  value={toDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowTo(Platform.OS === 'ios');
                    if (selectedDate) setToDate(selectedDate);
                  }}
                />
              )}
            </View>

          </View>

          <ThemedView style={{ marginTop: 15 }}>

          <ThemedText type="subtitle">
          Filter by Type
          </ThemedText>

          {/* SOLD */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 10
          }}>
          <Checkbox
          value={isSold}
          onValueChange={setIsSold}
          accessibilityLabel="Filter by sold vouchers"
          />
        <ThemedText style={{ marginLeft: 8 }}>
          Sold
        </ThemedText>
        </View>

        {/* REDEEMED */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 10
      }}>
        <Checkbox
          value={isRedeemed}
          onValueChange={setIsRedeemed}
          accessibilityLabel="Filter by redeemed vouchers"
        />
        <ThemedText style={{ marginLeft: 8 }}>
          Redeemed
        </ThemedText>
      </View>

      </ThemedView>

          {/* Search Button */}
          <Pressable
            style={ButtonAndInputStyles.button}
            onPress={handleValidation}
            accessibilityRole="button"
            accessibilityLabel="Search vouchers by date range"
            accessibilityHint="Retrieves vouchers within selected dates"
          >
            <ThemedText>Search by Date</ThemedText>
          </Pressable>

        </ThemedView>

        {/* Back Button */}
        <ThemedView>
          <Pressable
            style={ButtonAndInputStyles.button}
            onPress={() => router.push('/admin')}
            accessibilityRole="button"
            accessibilityLabel="Back to admin home"
            accessibilityHint="Returns to the admin dashboard"
          >
            <ThemedText>← Back Admin Home</ThemedText>
          </Pressable>
        </ThemedView>

        <Footer />

      </ParallaxScrollView>
    </SafeAreaView>
  );
}