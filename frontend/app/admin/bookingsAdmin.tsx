// app/(tabs)/menu/login/admin/bookingsAdmin.tsx 
import { useRouter } from 'expo-router';
import { Image, Pressable, TextInput, Platform, View } from 'react-native'; 
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

  // --- STAGES ---
  const [stage, setStage] = useState<'management' | 'results'>('management');

  const [results, setResults] = useState<any[]>([]);
  const [resultDates, setResultDates] = useState<{ from: string; to: string } | null>(null);
  const [isToday, setIsToday] = useState(false);

  // --- DATE STATE ---
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());

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

  // --- RETRIEVAL ---
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
    from = formatForAPI(fromDate);
    to = formatForAPI(toDate);
    setIsToday(false);
  }

  // ✅ FIX: DO NOT wrap in new Date()
  const data = await searchBookings('date', from, to);
  const mapped = data.map((b: any) => ({
  ...b,
  dateOfBooking: b.date
}));

  const sorted = [...mapped].sort((a, b) => {

  // 🟢 TODAY → time only
  if (mode === 'today') {
    return a.time.localeCompare(b.time);
  }

  // 🔵 RANGE → proper date comparison
  const dateA = new Date(a.dateOfBooking);
  const dateB = new Date(b.dateOfBooking);

  if (dateA.getTime() !== dateB.getTime()) {
    return dateA.getTime() - dateB.getTime();
  }

  // same date → sort by time
  return a.time.localeCompare(b.time);
});

  setResults(sorted);
  setResultDates({ from, to });
  setStage('results');
};

  // --- PRINT ---
  const handlePrint = async () => {

    const html = `
      <h1>Bookings</h1>
      <p>
        ${
  resultDates?.from === resultDates?.to
    ? formatUKDate(resultDates?.from ?? '')
    : `${formatUKDate(resultDates?.from ?? '')} - ${formatUKDate(resultDates?.to ?? '')}`
}
      </p>

      <table style="width:100%; border-collapse: collapse;">
        <tr>
          <th style="border:1px solid #000; padding:8px;">#</th>
          ${!isToday ? `<th style="border:1px solid #000; padding:8px;">Date</th>` : ''}
          <th style="border:1px solid #000; padding:8px;">Time</th>
          <th style="border:1px solid #000; padding:8px;">Guests</th>
          <th style="border:1px solid #000; padding:8px;">Name</th>
          <th style="border:1px solid #000; padding:8px;">Phone</th>
          <th style="border:1px solid #000; padding:8px;">Comment</th>
        </tr>

        ${results.map((b, i) => `
          <tr>
            <td style="border:1px solid #000; padding:6px;">${i+1}</td>
            ${!isToday ? `<td style="border:1px solid #000; padding:6px;">${formatUKDate(b.date)}</td>` : ''}
            <td style="border:1px solid #000; padding:6px;">${b.time}</td>
            <td style="border:1px solid #000; padding:6px;">${b.numberOfGuests}</td>
            <td style="border:1px solid #000; padding:6px;">${b.title} ${b.firstName} ${b.lastName}</td>
            <td style="border:1px solid #000; padding:6px;">${b.phoneNumber}</td>
            <td style="border:1px solid #000; padding:6px;">${b.comment || ''}</td>
          </tr>
        `).join('')}
      </table>
    `;

    await Print.printAsync({ html });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#560324'}}>

      {/* ================= MANAGEMENT ================= */}
      {stage === 'management' && (
        <ParallaxScrollView>

          <Image source={require('@/assets/images/admin.png')} style={ContainerStyles.titleImage} />

          <ThemedView style={ContainerStyles.titleContainer}>
            <ThemedText type="title">Booking Management</ThemedText>
          </ThemedView>

          {/* TODAY */}
          <Pressable style={ButtonAndInputStyles.button} onPress={() => handleRetrieval('today')}>
            <ThemedText>Today’s Bookings</ThemedText>
          </Pressable>

          {/* DATE RANGE */}
          <ThemedView style={{ marginTop: 25 }}>
            <ThemedText type="subtitle">Search by Date Range</ThemedText>

            <ThemedView style={{ flexDirection: 'row', gap: 10 }}>

              {/* FROM */}
              <ThemedView style={{ flex: 1 }}>
                <ThemedText>From</ThemedText>
                <TextInput value={formatDate(fromDate)} editable={false} style={ButtonAndInputStyles.input}/>
                <Pressable onPress={() => setShowFromPicker(true)}>
                  <Ionicons name="calendar-outline" size={22} />
                </Pressable>
                {showFromPicker && (
                  <DateTimePicker value={fromDate} mode="date"
                    onChange={(e,d)=>{setShowFromPicker(false); if(d) setFromDate(d);}}
                  />
                )}
              </ThemedView>

              {/* TO */}
              <ThemedView style={{ flex: 1 }}>
                <ThemedText>To</ThemedText>
                <TextInput value={formatDate(toDate)} editable={false} style={ButtonAndInputStyles.input}/>
                <Pressable onPress={() => setShowToPicker(true)}>
                  <Ionicons name="calendar-outline" size={22} />
                </Pressable>
                {showToPicker && (
                  <DateTimePicker value={toDate} mode="date"
                    onChange={(e,d)=>{setShowToPicker(false); if(d) setToDate(d);}}
                  />
                )}
              </ThemedView>

            </ThemedView>

            <Pressable style={ButtonAndInputStyles.button} onPress={() => handleRetrieval('range')}>
              <ThemedText>Search Date Range</ThemedText>
            </Pressable>
          </ThemedView>

          <Footer />
        </ParallaxScrollView>
      )}

      {/* ================= RESULTS ================= */}
      {stage === 'results' && (
        <ParallaxScrollView>

          <Image source={require('@/assets/images/admin.png')} style={ContainerStyles.titleImage} />

          <ThemedView style={ContainerStyles.titleContainer}>
            <ThemedText type="title">Bookings</ThemedText>
          </ThemedView>

          <ThemedText type="subtitle">
            {
              resultDates?.from === resultDates?.to
                ? formatUKDate(resultDates?.from ?? '')
                : `${formatUKDate(resultDates?.from ?? '')} - ${formatUKDate(resultDates?.to ?? '')}`
          }
          </ThemedText>

          {/* TABLE HEADER */}
          <View style={TableStyles.headerRow}>
            {!isToday && <View style={TableStyles.cell}><ThemedText>Date</ThemedText></View>}
            <View style={TableStyles.cell}><ThemedText>Time</ThemedText></View>
            <View style={TableStyles.cell}><ThemedText>Guests</ThemedText></View>
          </View>

          {/* TABLE ROWS */}
          {results.map((b, i) => (
            <View key={b.id} style={TableStyles.row}>
              {!isToday && <View style={TableStyles.cell}><ThemedText>{formatUKDate(b.date)}</ThemedText></View>}
              <View style={TableStyles.cell}><ThemedText>{b.time}</ThemedText></View>
              <View style={TableStyles.cell}><ThemedText>{b.numberOfGuests}</ThemedText></View>
            </View>
          ))}

          {/* PRINT */}
          <Pressable style={ButtonAndInputStyles.button} onPress={handlePrint}>
            <ThemedText>🖨 Print Report</ThemedText>
          </Pressable>

          {/* BACK */}
          <Pressable style={ButtonAndInputStyles.button} onPress={() => setStage('management')}>
            <ThemedText>← Back</ThemedText>
          </Pressable>

          <Footer />
        </ParallaxScrollView>
      )}

    </SafeAreaView>
  );
}