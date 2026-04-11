
// app/(tabs)/menu/login/admin/bookingsAdmin.tsx 
import { useRouter } from 'expo-router';
import { Image, Pressable, TextInput, View } from 'react-native'; 
import React, { useState } from 'react'; 
import { SafeAreaView } from 'react-native-safe-area-context'; 
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

import ParallaxScrollView from '@/components/ParallaxScrollView'; 
import { ThemedText } from '@/components/ThemedText'; 
import { ThemedView } from '@/components/ThemedView'; 
import Footer from '@/components/Footer'; 
import ContainerStyles from '@/components/ContainerStyles'; 
import ButtonAndInputStyles from '@/components/ButtonAndInputStyles'; 
import TableStyles from '@/components/TableStyles';
import * as Print from 'expo-print';

import { searchBookings } from '@/libraries/backendService';

export default function BookingsAdminScreen() { 
  const router = useRouter();

  const [stage, setStage] = useState<'management' | 'results'>('management');

  const [results, setResults] = useState<any[]>([]);
  const [resultDates, setResultDates] = useState<{ from: string; to: string } | null>(null);
  const [isToday, setIsToday] = useState(false);

  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const formatDate = (date: Date) => date.toLocaleDateString();

  const formatForAPI = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatUKDate = (date: string) => {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleRetrieval = async (mode: 'today' | 'range') => {

    let from: string;
    let to: string;

    const today = new Date();
    today.setHours(0,0,0,0);

    if (mode === 'today') {
      from = formatForAPI(today);
      to = formatForAPI(today);
      setIsToday(true);
    } else {

      if (!fromDate || !toDate) {
        alert('Please select both dates');
        return;
      }

      if (fromDate > toDate) {
        alert('"From" date must be before "To" date');
        return;
      }

      from = formatForAPI(fromDate);
      to = formatForAPI(toDate);
      setIsToday(false);
    }

    const data = await searchBookings('date', from, to);

    const mapped = data.map((b: any) => ({
      ...b,
      dateOfBooking: b.date
    }));

    const sorted = [...mapped].sort((a, b) => {

      if (mode === 'today') {
        return a.time.localeCompare(b.time);
      }

      const dateA = new Date(a.dateOfBooking);
      const dateB = new Date(b.dateOfBooking);

      if (dateA.getTime() !== dateB.getTime()) {
        return dateA.getTime() - dateB.getTime();
      }

      return a.time.localeCompare(b.time);
    });

    setResults(sorted);
    setResultDates({ from, to });
    setStage('results');
  };

  const handlePrint = async () => {
    await Print.printAsync({ html: '<h1>Bookings</h1>' });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#560324'}}>

      {/* ================= MANAGEMENT ================= */}
      {stage === 'management' && (
        <ParallaxScrollView>

          <Image
            source={require('@/assets/images/admin.png')}
            style={ContainerStyles.titleImage}
            accessible
            accessibilityLabel="Admin screen header image"
          />

          <ThemedView style={ContainerStyles.titleContainer}>
            <ThemedText type="title" accessibilityRole="header">
              Booking Management
            </ThemedText>
          </ThemedView>

          <Pressable
            style={ButtonAndInputStyles.button}
            onPress={() => handleRetrieval('today')}
            accessibilityRole="button"
            accessibilityLabel="View today's bookings"
            accessibilityHint="Shows all bookings for today"
          >
            <ThemedText>Today’s Bookings</ThemedText>
          </Pressable>

          <ThemedView>
            <ThemedText type="subtitle" accessibilityRole="header">
              Search Bookings by Date Range
            </ThemedText>

            <ThemedView style={{ flexDirection: 'row', gap: 10 }}>

              {/* FROM */}
              <View style={{ flex: 1 }}>
                <ThemedText>From</ThemedText>

                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff' }}>
                  <TextInput
                    value={fromDate ? formatDate(fromDate) : ''}
                    placeholder="Select date"
                    editable={false}
                    accessibilityLabel="From date"
                    accessibilityHint="Select start date"
                  />

                  <Pressable
                    onPress={() => setShowFromPicker(true)}
                    accessibilityRole="button"
                    accessibilityLabel="Open from date picker"
                  >
                    <Ionicons name="calendar-outline" size={22} />
                  </Pressable>
                </View>

                {showFromPicker && (
                  <DateTimePicker
                    value={fromDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowFromPicker(false);
                      if (selectedDate) setFromDate(selectedDate);
                    }}
                  />
                )}
              </View>

              {/* TO */}
              <View style={{ flex: 1 }}>
                <ThemedText>To</ThemedText>

                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff' }}>
                  <TextInput
                    value={toDate ? formatDate(toDate) : ''}
                    placeholder="Select date"
                    editable={false}
                    accessibilityLabel="To date"
                    accessibilityHint="Select end date"
                  />

                  <Pressable
                    onPress={() => setShowToPicker(true)}
                    accessibilityRole="button"
                    accessibilityLabel="Open to date picker"
                  >
                    <Ionicons name="calendar-outline" size={22} />
                  </Pressable>
                </View>

                {showToPicker && (
                  <DateTimePicker
                    value={toDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowToPicker(false);
                      if (selectedDate) setToDate(selectedDate);
                    }}
                  />
                )}
              </View>

            </ThemedView>

            <Pressable
              style={ButtonAndInputStyles.button}
              onPress={() => handleRetrieval('range')}
              accessibilityRole="button"
              accessibilityLabel="Search bookings by date range"
              accessibilityHint="Displays bookings between selected dates"
            >
              <ThemedText>Search Date Range</ThemedText>
            </Pressable>
          </ThemedView>

          <ThemedView>
            <Pressable
              style={ButtonAndInputStyles.button}
              onPress={() => router.push('/admin')}
              accessibilityRole="button"
              accessibilityLabel="Back to admin home"
            >
              <ThemedText>← Back Admin Home</ThemedText>
            </Pressable>
          </ThemedView>

          <Footer />
        </ParallaxScrollView>
      )}

      {/* ================= RESULTS ================= */}
      {stage === 'results' && (
        <ParallaxScrollView>

          <Image
            source={require('@/assets/images/admin.png')}
            style={ContainerStyles.titleImage}
            accessible
            accessibilityLabel="Bookings results header image"
          />

          <ThemedView>

            <ThemedView style={ContainerStyles.titleContainer}>
              <ThemedText type="title" accessibilityRole="header">
                Bookings
              </ThemedText>
            </ThemedView>

            <ThemedText
              accessibilityLabel={`Showing bookings from ${
                resultDates?.from === resultDates?.to
                  ? formatUKDate(resultDates?.from ?? '')
                  : `${formatUKDate(resultDates?.from ?? '')} to ${formatUKDate(resultDates?.to ?? '')}`
              }`}
            >
              {
                resultDates?.from === resultDates?.to
                  ? formatUKDate(resultDates?.from ?? '')
                  : `${formatUKDate(resultDates?.from ?? '')} - ${formatUKDate(resultDates?.to ?? '')}`
              }
            </ThemedText>

            {/* TABLE HEADER */}
            <View style={TableStyles.headerRow} accessible accessibilityRole="header">
              {!isToday && (
                <View style={[TableStyles.cell, TableStyles.colDate]}>
                  <ThemedText>Date</ThemedText>
                </View>
              )}
              <View style={[TableStyles.cell, TableStyles.colTime]}>
                <ThemedText>Time</ThemedText>
              </View>
              <View style={[TableStyles.cell, TableStyles.colGuests]}>
                <ThemedText>Guests</ThemedText>
              </View>
              <View style={[TableStyles.cell, TableStyles.colName]}>
                <ThemedText>Name</ThemedText>
              </View>
            </View>

            {/* TABLE ROWS */}
            {results.map((b, i) => (
              <View
                key={b.id}
                style={TableStyles.row}
                accessible
                accessibilityRole="text"
                accessibilityLabel={`Booking ${i + 1}: ${b.firstName} ${b.lastName}, ${b.numberOfGuests} guests at ${b.time}${!isToday ? ` on ${formatUKDate(b.date)}` : ''}`}
              >
                {!isToday && (
                  <View style={[TableStyles.cell, TableStyles.colDate]}>
                    <ThemedText>{formatUKDate(b.date)}</ThemedText>
                  </View>
                )}

                <View style={[TableStyles.cell, TableStyles.colTime]}>
                  <ThemedText>{b.time}</ThemedText>
                </View>

                <View style={[TableStyles.cell, TableStyles.colGuests]}>
                  <ThemedText>{b.numberOfGuests}</ThemedText>
                </View>

                <View style={[TableStyles.cell, TableStyles.colName]}>
                  <ThemedText>{b.firstName} {b.lastName}</ThemedText>
                </View>
              </View>
            ))}

            <Pressable
              style={ButtonAndInputStyles.button}
              onPress={handlePrint}
              accessibilityRole="button"
              accessibilityLabel="Print bookings report"
            >
              <ThemedText>🖨 Print Report</ThemedText>
            </Pressable>

            <Pressable
              style={ButtonAndInputStyles.button}
              onPress={() => setStage('management')}
              accessibilityRole="button"
              accessibilityLabel="Go back to booking search"
            >
              <ThemedText>← Back</ThemedText>
            </Pressable>

          </ThemedView>

          <Footer />
        </ParallaxScrollView>
      )}

    </SafeAreaView>
  );
}
