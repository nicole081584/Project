// app/(tabs)/menu/login/index.tsx
import { useRouter } from 'expo-router';
import { Image, TextInput, Pressable,AccessibilityInfo, Alert } from 'react-native';
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
    const [showPassword, setShowPassword] = useState(false);

    const router = useRouter();

    const handleReset = async () => {
    setEmailUsername('');
    setBookingNumberPassword('');
  }


    const handleLogin = async () => {
    
          //check and verify all fields are filled in correctly
          if (emailUsername ===''){
            const message = "Please enter your username";

          Alert.alert(message); // 👀 visible popup
          AccessibilityInfo.announceForAccessibility(message); // 🔊 screen reader
  
          }
          else if (bookingNumberPassword === ''){
            const message = "Please enter your Password.";

            Alert.alert(message); // 👀 visible popup
            AccessibilityInfo.announceForAccessibility(message); // 🔊 screen reader
          }
          else {
            const user = await checkUserType(emailUsername, bookingNumberPassword);
            if (user === 'admin') {
                router.replace({
                              pathname: '/admin',
                              params: {emailUsername},
                              });
                handleReset();
                
            }
            else {
                const message = "User not recognised! Please try again.";
                Alert.alert(message);
                AccessibilityInfo.announceForAccessibility(message);
            }
          } }

  return (
     <SafeAreaView accessible={false} style={{ flex: 1, backgroundColor: '#560324'}}>
    <ParallaxScrollView>
       
          <Image
            source={require('@/assets/images/Login.png')}
            style={ContainerStyles.titleImage}
            accessible={true}
            accessibilityLabel="Login page header image"
            />  

      <ThemedView style={ContainerStyles.titleContainer}>
        <ThemedText type="title" accessibilityRole="header">Login</ThemedText>
      </ThemedView>


      <ThemedText type = "subtitle">Username</ThemedText>
      <TextInput
        style={ButtonAndInputStyles.input}
        placeholder="Enter Username"
        value={emailUsername}
        onChangeText={setEmailUsername}
        accessibilityLabel="Username input field"
        accessibilityHint="Enter your username"
      />

      <ThemedView style={{ position: 'relative' }}>
        <TextInput
        style={ButtonAndInputStyles.input}
        placeholder="Enter Password"
        value={bookingNumberPassword}
        onChangeText={setBookingNumberPassword}
        secureTextEntry={!showPassword}
        accessibilityLabel="Password input field"
        accessibilityHint="Enter your password"
      />

      <Pressable
        onPress={() => setShowPassword((prev) => !prev)}
        accessibilityRole="button"
        accessibilityLabel={showPassword ? "Hide password" : "Show password"}
        accessibilityHint="Toggles password visibility"
        style={{
          position: 'absolute',
          right: 10,
          top: '50%',
          transform: [{ translateY: -12 }],
          padding: 5,
        }}
    >
      <ThemedText>
          {showPassword ? '🙈' : '👁'}
      </ThemedText>
    </Pressable>
    </ThemedView>

      <ThemedView >
           <Pressable style={ButtonAndInputStyles.button} onPress={handleLogin} 
            accessibilityRole="button"
            accessibilityLabel="Log in"
            accessibilityHint="Press to Login">
              <ThemedText type= 'subtitle'>Login</ThemedText>
           </Pressable>
        </ThemedView>


      <Footer />
    </ParallaxScrollView>
    </SafeAreaView>
  );
}




