// app/(tabs)/menu/menus.tsx
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Collapsible } from '@/components/Collapsible';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import  Footer  from '@/components/Footer';
import ContainerStyles from '@/components/ContainerStyles';

export default function MenusScreen() {

  return (
    
    <SafeAreaView style={{ flex: 1, backgroundColor: '#560324'}}>
    <ParallaxScrollView>
       
          <Image
            source={require('@/assets/images/Menu.png')}
            style={ContainerStyles.titleImage}
            />    

      <ThemedView style={ContainerStyles.titleContainer}>
        <ThemedText type="title">Menus</ThemedText>
      </ThemedView>
      <Collapsible title="Breakfast">
        <ThemedText>
          available 10am-11:45am Tuesday to Saturday and 10am-11:30am Sunday
        </ThemedText>
      </Collapsible>

      <Collapsible title="Lunch">
        <ThemedText>
          available 12pm-3pm Tuesday, Wednesday and 12pm-3:30pm Thursday-Saturday
        </ThemedText>
      </Collapsible>

      <Collapsible title="A la Carte">
        <ThemedText>
          available 5pm-7:30pm Thursday, 5pm-8:30pm Friday and Saturday
        </ThemedText>
      </Collapsible>

      <Collapsible title="Sample Sunday Menu">
        <ThemedText>
          available 12pm-3:30pm and 5pm-7pm Sunday.
        </ThemedText>
        <ThemedText type="defaultSemiBold">
          Menu changes weekly.
        </ThemedText>
      </Collapsible>

      <Collapsible title="Vegetarian Menu">
        <ThemedText>
          available during Lunch and Dinner Service Tuesday-Sunday
        </ThemedText>
      </Collapsible>

      <Collapsible title="Dessert Menu">
        <ThemedText>
          available during Lunch and Dinner Service Tuesday-Saturday
        </ThemedText>
      </Collapsible>

      <Collapsible title="Kids Menu">
        <ThemedText>
          available during Lunch and Dinner Service Tuesday-Saturday
        </ThemedText>
      </Collapsible>

      <Footer />

    </ParallaxScrollView>
    </SafeAreaView>
    
  );
}


