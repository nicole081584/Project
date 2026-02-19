// app/(tabs)/menu/login/admin.tsx
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

export default function AdminScreen() {
    return (
  <SafeAreaView style={{ flex: 1, backgroundColor: '#560324'}}>
    <ParallaxScrollView>
       
          <Image
            source={require('@/assets/images/Login.png')}
            style={ContainerStyles.titleImage}
            />    

    <ThemedView style={ContainerStyles.titleContainer}>
        <ThemedText type="title">Admin</ThemedText>
    </ThemedView>

    <Footer />
    </ParallaxScrollView>
    </SafeAreaView>

    )}