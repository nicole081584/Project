import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useFocusEffect, useNavigation } from 'expo-router';
import { useCallback } from 'react';

import { View, StyleSheet, Text, Dimensions } from 'react-native';

//Just opens navigation

export default function AutoOpenDrawer() {
const navigation = useNavigation() as DrawerNavigationProp<any>;


  useFocusEffect(
    useCallback(() => {
      const timeout = setTimeout(() => {
        navigation.openDrawer?.();
      }, 0);

      return () => clearTimeout(timeout);
    }, [navigation])
  );

  

  return  <View style={styles.background}>
              <Text style = {styles.text}> Press Home</Text>
          </View>; // show background color
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#560324', // match drawer background
  },
  text: {
    color: 'white',
    fontSize: 18,
    marginTop: Dimensions.get('window').height * 0.25, // 1/4 down the page
  },
});

