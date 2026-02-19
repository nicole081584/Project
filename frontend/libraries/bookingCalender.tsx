// components/BookingCalendar.tsx
import React, { useState, useMemo } from 'react';
import { Calendar } from 'react-native-calendars';
import closedData from '@/assets/data/closedDays.json';
import { ThemedView } from '@/components/ThemedView';
import ContainerStyles from '@/components/ContainerStyles';

/**
 * Interface generating a pressable booking calender disabling sameday and past days.
 * Marking recurring closed days (Monday) with a red dot to signal closed and 
 * days where online booking is unavailable with a green dot to signal that you can
 * no longer book online but may be able to book by phone.
 * 
 */

interface BookingCalendarProps {
  onDateSelected: (date: string) => void;
}

// Building the calender
const BookingCalendar: React.FC<BookingCalendarProps> = ({ onDateSelected }) => {
  const [selected, setSelected] = useState('');
  //defined today and tomorrow
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  // disable today and past
  const minDate = tomorrow.toISOString().split('T')[0]; 

  // defined marked dates
  const markedDates = useMemo(() => {
    const oneYearLater = new Date();
    oneYearLater.setFullYear(today.getFullYear() + 1);

    const marked: { [key: string]: any } = {};

    // Mark today's date with green dot
        const todayStr = today.toISOString().split('T')[0];
        marked[todayStr] = {
            ...marked[todayStr],
            disabled: true,
            disableTouchEvent: true,
            marked: true,
            dots: [{ color: 'green' }],
        };
    //mark dates from the closedData file with red or green dots as apropriate
    for (let d = new Date(tomorrow); d <= oneYearLater; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-GB', { weekday: 'long' });

      //Mark all closed dates with a red dot
      if (closedData.recurringClosedDays.includes(dayName) || closedData.closedDates.includes(dateStr)) {
        marked[dateStr] = {
          disabled: true,
          disableTouchEvent: true,
          marked: true,
          dots: [{ color: 'red' }], // 🔴 red dot for closed days
        };
      }

      //mark dates where online booking is unavailable with green dots
      if (closedData.onlineBookingUnavailable.includes(dateStr)) {
        marked[dateStr] = {
          disabled: true,
          disableTouchEvent: true,
          marked: true,
          dots: [{ color: 'green' }], // 🟢 green dot for online booking unavailable
        };
      }
    }

    return marked;
  }, []);
  
  //when date is pressed set 
  const handleDayPress = (day: any) => {
    const dateStr = day.dateString;
    if (markedDates[dateStr]?.disabled) {
      alert('This date is not bookable.');
      return;
    }
    //set and return selected date
    setSelected(dateStr);
    onDateSelected(dateStr);
  };

  //Calender View
  return (
    <ThemedView style ={ContainerStyles.calenderContainer}>
    <Calendar
      markingType="multi-dot"  
      onDayPress={handleDayPress}
      minDate={minDate} // ⛔ disables today and earlier
      markedDates={{
        ...markedDates,
        [selected]: { selected: true, selectedColor: '#560324' },
      }}
      theme={{
        selectedDayBackgroundColor: '#560324',
        todayTextColor: '#560324',
        arrowColor: '#560324',
        textDayFontWeight: '500',
        textMonthFontWeight: 'bold',
        textDayFontSize: 16,
        textMonthFontSize: 18,
        textSectionTitleColor: '#560324',      // day of week labels color
      }}
    />
    </ThemedView>
  );
};

export default BookingCalendar;
