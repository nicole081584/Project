import { Image } from 'expo-image';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import  Footer  from '@/components/Footer';
import ContainerStyles from '@/components/ContainerStyles';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  // Returns Home screen view
  return (
    
    <SafeAreaView style={{ flex: 1, backgroundColor: '#560324'}}>
    <ParallaxScrollView>
       
          <Image
            source={require('@/assets/images/Restaurant-cover-picture.png')}
            style={ContainerStyles.titleImage}
            />  

      <ThemedView style={ContainerStyles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
      </ThemedView>
      <ThemedView style={ContainerStyles.stepContainer}>
        
        <ThemedText>
           to our Restaurant. 
        </ThemedText>
      </ThemedView>

      <ThemedView style={ContainerStyles.stepContainer}>
        <ThemedText>
          Located in a picturesque, award‑winning village, this purpose‑built restaurant
          is shaped by owners with extensive experience in the hospitality industry, 
          creating a warm and welcoming dining destination.
        </ThemedText>
      </ThemedView>

      <ThemedView style={ContainerStyles.stepContainer}>
        <ThemedText>
          Their enthusiasm for food, culinary expertise and the delivery of excellence in customer service
          means that your first visit will not be your last.
        </ThemedText>
      </ThemedView>

      <Footer />
    </ParallaxScrollView>
    </SafeAreaView>
  );
}

