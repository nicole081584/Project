// app/(tabs)/menu/login/index.tsx
import { useRouter } from 'expo-router';
import {
  Image,
  TextInput,
  Pressable,
  AccessibilityInfo,
  Alert
} from 'react-native';
import React, { useState, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { checkUserType } from '@/libraries/backendService';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Footer from '@/components/Footer';
import ContainerStyles from '@/components/ContainerStyles';
import ButtonAndInputStyles from '@/components/ButtonAndInputStyles';

export default function LoginScreen() {

  const [emailUsername, setEmailUsername] = useState('');
  const [bookingNumberPassword, setBookingNumberPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const passwordRef = useRef<TextInput>(null);

  const router = useRouter();

  const handleReset = () => {
    setEmailUsername('');
    setBookingNumberPassword('');
  };

  const handleLogin = async () => {

    // ✅ Trim whitespace (important accessibility + usability fix)
    const username = emailUsername.trim();
    const password = bookingNumberPassword.trim();

    if (username === '') {
      const message = "Please enter your username";
      Alert.alert(message);
      AccessibilityInfo.announceForAccessibility(message);
      return;
    }

    if (password === '') {
      const message = "Please enter your password";
      Alert.alert(message);
      AccessibilityInfo.announceForAccessibility(message);
      return;
    }

    const user = await checkUserType(username, password);

    if (user === 'admin') {
      AccessibilityInfo.announceForAccessibility("Login successful");
      router.replace({
        pathname: '/admin',
        params: { emailUsername: username },
      });
      handleReset();
    } else {
      const message = "User not recognised! Please try again.";
      Alert.alert(message);
      AccessibilityInfo.announceForAccessibility(message);
    }
  };

  return (
    <SafeAreaView accessible={false} style={{ flex: 1, backgroundColor: '#560324' }}>
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

        {/* Username */}
        <ThemedText type="subtitle">Username</ThemedText>
        <TextInput
          style={ButtonAndInputStyles.input}
          placeholder="Enter Username"
          value={emailUsername}
          onChangeText={setEmailUsername}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="default" // ✅ NOT email
          textContentType="username"
          autoComplete="username"
          importantForAutofill="yes"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          accessibilityLabel="Username input field"
          accessibilityHint="Enter your username"
        />

        {/* Password */}
        <ThemedText type="subtitle">Password</ThemedText>
        <ThemedView style={{ position: 'relative' }}>
          <TextInput
            ref={passwordRef}
            style={ButtonAndInputStyles.input}
            placeholder="Enter Password"
            value={bookingNumberPassword}
            onChangeText={setBookingNumberPassword}
            secureTextEntry={!showPassword}
            textContentType="password"
            autoComplete="password"
            importantForAutofill="yes"
            returnKeyType="done"
            onSubmitEditing={handleLogin}
            accessibilityLabel="Password input field"
            accessibilityHint="Enter your password"
          />

          <Pressable
            onPress={() => setShowPassword(prev => !prev)}
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

        {/* Login Button */}
        <ThemedView>
          <Pressable
            style={ButtonAndInputStyles.button}
            onPress={handleLogin}
            accessibilityRole="button"
            accessibilityLabel="Log in"
            accessibilityHint="Press to log in"
          >
            <ThemedText type='subtitle'>Login</ThemedText>
          </Pressable>
        </ThemedView>

        <Footer />

      </ParallaxScrollView>
    </SafeAreaView>
  );
}