// app/(tabs)/menu/contact.tsx
import { Linking, StyleSheet, Pressable, Platform } from 'react-native';
import { Image } from 'expo-image';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import  Footer  from '@/components/Footer';
import ContainerStyles from '@/components/ContainerStyles';
import ButtonAndInputStyles from '@/components/ButtonAndInputStyles';




export default function ContactScreen() {

const phoneNumber = '01632 960000';
const emailAddress = 'sample@test.com';
const address = '123 Example Street, Example Town, EX1 2PL';

// Coordinates for Restaurant (generic data)
const latitude =54.5;
const longitude =-2.5;


  // handles the call logic automaticlly suggesting Restaurant Number
  const handleCallPress = () => {
    Linking.openURL(`tel:${phoneNumber}`).catch((err) =>
      console.error('Failed to make call:', err)
    );
  };

  //handles the mail logic, automatically filling in Restaurant email addess and a subject of App Inquiry
  const handleEmailPress = () => {
    const subject = 'App Inquiry';
    const body = 'Hi, I’d like to know more about...';
    const mailto = `mailto:${emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    Linking.openURL(mailto).catch((err) =>
      console.error('Failed to send email:', err)
    );
  };

  // Handles when someone presses on the map to get directions linking to apple or google maps
  const handleMapPress = () => {
    const url = Platform.select({
      ios: `http://maps.apple.com/?ll=${latitude},${longitude}`,
      android: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
    });

    Linking.openURL(url as string);
  };
 
  
  // Returns the Contact screen view
  return (
    
    <SafeAreaView style={{ flex: 1, backgroundColor: '#560324'}}>
    <ParallaxScrollView>
       
          <Image
            source={require('@/assets/images/Contacts.png')}
            style={ContainerStyles.titleImage}
            />    

      <ThemedView style={ContainerStyles.titleContainer}>
        <ThemedText type="title">Find Us</ThemedText>
      </ThemedView>

      <ThemedView style = {ContainerStyles.mapContainer}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onPress={handleMapPress}
      >
        <Marker
          coordinate={{ latitude, longitude }}
          title="Our Restaurant"
          description={address}
        />
      </MapView>
      </ThemedView>
      <ThemedText type="default">{address}</ThemedText>

      <ThemedView style={ContainerStyles.titleContainer}>
        <ThemedText type="title">Contact Us</ThemedText>
      </ThemedView>

      <ThemedText type="default">Phone: {phoneNumber}</ThemedText>  
      <ThemedView>
        <Pressable style={ButtonAndInputStyles.button} onPress={handleCallPress}>
          <ThemedText>Call Us</ThemedText>
        </Pressable>
      </ThemedView>
      
      <ThemedText type="default">Email: {emailAddress}</ThemedText>
      <ThemedView>
        <Pressable style={ButtonAndInputStyles.button} onPress={handleEmailPress}>
          <ThemedText>Email Us</ThemedText>
        </Pressable>
      </ThemedView>
      <Footer />
    </ParallaxScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  map: {
    height: 200,
    width: '100%',
  },
});

