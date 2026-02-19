// app/(tabs)/menu/login/index.tsx
import { useRouter } from 'expo-router';
import { Image, TextInput, Pressable } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { checkUserType } from '@/libraries/backendService';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import  Footer  from '@/components/Footer';
import ContainerStyles from '@/components/ContainerStyles';
import ButtonAndInputStyles from '@/components/ButtonAndInputStyles';

export default function LoginScreen() {

    const [emailUsername, setEmailUsername] = useState('');
    const [bookingNumberPassword, setBookingNumberPassword] = useState('');

    const router = useRouter();

    const handleReset = async () => {
    setEmailUsername('');
    setBookingNumberPassword('');
  }


    const handleLogin = async () => {
    
          //check and verify all fields are filled in correctly
          if (emailUsername ===''){
            alert ("Please enter your Username");
          }
          else if (bookingNumberPassword === ''){
            alert ("Please enter your Password.");
          }
          else {
            const user = await checkUserType(emailUsername, bookingNumberPassword);
            if (user === 'admin') {
                router.replace({
                              pathname: '/menu/login/admin',
                              params: {emailUsername},
                              });
                handleReset();
                
            }
            else {
                alert('User not recognised! Please try again.');
            }
          } }

  return (
     <SafeAreaView style={{ flex: 1, backgroundColor: '#560324'}}>
    <ParallaxScrollView>
       
          <Image
            source={require('@/assets/images/Login.png')}
            style={ContainerStyles.titleImage}
            />  

      <ThemedView style={ContainerStyles.titleContainer}>
        <ThemedText type="title">Login</ThemedText>
      </ThemedView>


      <ThemedText type = "subtitle">Username</ThemedText>
      <TextInput
        style={ButtonAndInputStyles.input}
        placeholder="Enter Username"
        value={emailUsername}
        onChangeText={setEmailUsername}
      />

      <ThemedText type = "subtitle">Password</ThemedText>
      <TextInput
        style={ButtonAndInputStyles.input}
        placeholder="Enter Password"
        value={bookingNumberPassword}
        onChangeText={setBookingNumberPassword}
      />

      <ThemedView >
           <Pressable style={ButtonAndInputStyles.button} onPress={handleLogin}>
              <ThemedText type= 'subtitle'>Login</ThemedText>
           </Pressable>
        </ThemedView>


      <Footer />
    </ParallaxScrollView>
    </SafeAreaView>
  );
}




