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
import TableStyles from '@/components/TableStyles';
import * as Print from 'expo-print';

export default function VouchersAdminScreen() {
  const router = useRouter();

  const [stage, setStage] = useState<'management' | 'results'>('management');
  const [results, setResults] = useState<any[]>([]);
  const [resultType, setResultType] = useState<'sold' | 'redeemed' | null>(null);
  const [resultDates, setResultDates] = useState<{ from: string; to: string } | null>(null);

  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  const [showFrom, setShowFrom] = useState(false);
  const [showTo, setShowTo] = useState(false);

  const [isSold, setIsSold] = useState(false);
  const [isRedeemed, setIsRedeemed] = useState(false);

  const formatDate = (date: Date | null) => { // Format as YYYY-MM-DD for input display
    if (!date) return '';
    return date.toLocaleDateString();
  };

  const formatUKDate = (date: string | Date | null) => {
  if (!date) return '';

  // If already a Date object
  if (date instanceof Date) {
    return date.toLocaleDateString('en-GB');
  }

  // If it's a string (YYYY-MM-DD)
  if (typeof date === 'string') {
    const parts = date.split('-');

    // Only handle expected format safely
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}/${month}/${year}`;
    }

    // fallback (just in case)
    return new Date(date).toLocaleDateString('en-GB');
  }

  return '';
};

  const handlePrint = async () => {
  const total = results.reduce((sum, v) => sum + v.value, 0);

  const sortedForPrint = [...results].sort((a, b) => {
  const dateA = resultType === 'redeemed' ? a.dateUsed : a.date;
  const dateB = resultType === 'redeemed' ? b.dateUsed : b.date;

  if (dateA < dateB) return -1;
  if (dateA > dateB) return 1;

  return a.voucherNumber.localeCompare(b.voucherNumber);
});

  const html = `
    <h1>${resultType === 'sold' ? 'Vouchers Sold' : 'Vouchers Redeemed'}</h1>

    <p>
      ${
  resultDates?.from === resultDates?.to
    ? formatUKDate(resultDates?.from ?? null)
    : `${formatUKDate(resultDates?.from ?? null)} - ${formatUKDate(resultDates?.to ?? null)}`
}
    </p>

    <table style="width:100%; border-collapse: collapse;">

      <tr>
        <th style="border:1px solid #000; padding:8px;">#</th>
        <th style="border:1px solid #000; padding:8px;">Voucher</th>
        <th style="border:1px solid #000; padding:8px;">Date</th>
        <th style="border:1px solid #000; padding:8px; text-align:right;">
          ${resultType === 'sold' ? 'Value (£)' : 'Redeemed (£)'}
        </th>
      </tr>

      ${sortedForPrint.map((v, i) => `
        <tr>
          <td style="border:1px solid #000; padding:6px;">${i + 1}</td>
          <td style="border:1px solid #000; padding:6px;">${v.voucherNumber}</td>
          <td style="border:1px solid #000; padding:6px;">${formatUKDate(resultType === 'redeemed' ? v.dateUsed : v.date)}</td>
          <td style="border:1px solid #000; padding:6px; text-align:right;">
            £${v.value}
          </td>
        </tr>
      `).join('')}

      <!-- TOTAL ROW -->
      <tr>
        <td colspan="3" style="padding:8px; text-align:right; font-weight:bold;">
          Total
        </td>
        <td style="border-top:2px solid #000; padding:8px; text-align:right; font-weight:bold;">
          £${total}
        </td>
      </tr>

    </table>
  `;

  await Print.printAsync({ html });
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

  const data = await searchVouchers(filters);

    const sortedResults = [...data].sort((a, b) => {
  // 1. Sort by date
  if (a.date < b.date) return -1;
  if (a.date > b.date) return 1;

  // 2. Then by voucherNumber
  return a.voucherNumber.localeCompare(b.voucherNumber);
});

setResults(sortedResults);
setResultType(filters.status);
setResultDates({
  from: filters.fromDate,
  to: filters.toDate,
});

setStage('results');

};

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#560324' }}>

      {stage === 'management' && (
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
      )}


      {stage === 'results' && (

       <ParallaxScrollView>

        {/* Header Image */}
        <Image
          source={require('@/assets/images/admin.png')}
          style={ContainerStyles.titleImage}
          accessible={true}
          accessibilityLabel="Admin vouchers page header image"
        />

        <ThemedView >
        <ThemedView style={ContainerStyles.titleContainer}>
        {/* Title */}
        <ThemedText type="title">
          {resultType === 'sold' ? 'Vouchers Sold' : 'Vouchers Redeemed'}
        </ThemedText>
        </ThemedView>

        <ThemedView style={{ paddingHorizontal: 20, marginBottom: 10 }}>
          {/* Date */}
          <ThemedText type="subtitle">
          {
            resultDates?.from === resultDates?.to
            ? formatUKDate(resultDates?.from ?? null)
            : `${formatUKDate(resultDates?.from ?? null)} - ${formatUKDate(resultDates?.to ?? null)}`
        }
        </ThemedText>
        </ThemedView>
        

        <View style={TableStyles.headerRow}>

        <View style={[TableStyles.cell, TableStyles.colIndex]}>
          <ThemedText style={TableStyles.bold}>#</ThemedText>
        </View>

        <View style={[TableStyles.cell, TableStyles.colVoucher]}>
          <ThemedText style={TableStyles.bold}>Voucher</ThemedText>
        </View>

        <View style={[TableStyles.cell, TableStyles.colValue]}>
          <ThemedText style={TableStyles.bold}>
            {resultType === 'sold' ? 'Value' : 'Redeemed'}
          </ThemedText>
        </View>

      </View>

        {/* Table */}
        {results.map((item, index) => (
          <View key={item.voucherNumber} style={TableStyles.row}>

            <View style={[TableStyles.cell, TableStyles.colIndex]}>
              <ThemedText style={TableStyles.bold}>
                {index + 1}
              </ThemedText>
            </View>

            <View style={[TableStyles.cell, TableStyles.colVoucher]}>
              <ThemedText>
                {item.voucherNumber}
              </ThemedText>
            </View>

            <View style={[TableStyles.cell, TableStyles.colValue]}>
              <ThemedText>
                £{item.value}
              </ThemedText>
            </View>

          </View>
        ))}

        {/* Total */}
        <ThemedText style={{ marginTop: 10, textAlign: 'right', fontWeight: 'bold' }}>
          Total: £{results.reduce((sum, v) => sum + v.value, 0)}
        </ThemedText>

        {/* Print */}
        <Pressable
          style={ButtonAndInputStyles.button}
          onPress={handlePrint}
          accessibilityRole="button"
          accessibilityLabel="Print voucher report"
        >
          <ThemedText>🖨 Print Report</ThemedText>
        </Pressable>

        {/* Back */}
        <Pressable
          style={ButtonAndInputStyles.button}
          onPress={() => setStage('management')}
          accessibilityRole="button"
          accessibilityLabel="Back to voucher management"
        >
          <ThemedText>← Back to Voucher Managment</ThemedText>
        </Pressable>

          </ThemedView>
          <Footer />
          </ParallaxScrollView>
      )}
      
      </SafeAreaView>
  );
}