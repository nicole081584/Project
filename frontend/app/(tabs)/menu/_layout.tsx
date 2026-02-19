import { Drawer } from 'expo-router/drawer';
import { StyleSheet } from 'react-native';

//Drawer Layout for Menu tab

export default function MenuDrawerLayout() {
  return (
    <Drawer screenOptions={drawerScreenOptions}>
      <Drawer.Screen
  name="index"
  options={{
    drawerItemStyle: { display: 'none' }, // Hides it from the drawer
    headerShown: false, // Optional: hides the header bar
  }}
/>
      <Drawer.Screen name="menus" options={{ title: 'Menus', headerShown: false, }} />
      <Drawer.Screen name="contact" options={{ title: 'Contact', headerShown: false, }} />
      <Drawer.Screen name="bookings" options={{ title: 'Bookings', headerShown: false, }} />
      <Drawer.Screen name="vouchers" options={{ title: 'Gift Vouchers', headerShown: false, }} />
      <Drawer.Screen name="login/index" options={{ title: 'Login', headerShown: false, }} />
      <Drawer.Screen name="login/admin" options={{ drawerItemStyle: { display: 'none' }, headerShown: false,}} />
      <Drawer.Screen name="login/bookingamendment" options={{ drawerItemStyle: { display: 'none' }, headerShown: false,}} />
      

    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawerLabel: {
    fontSize: 16,
    fontWeight: '600', 
  },
});
// style
const drawerScreenOptions = {
  drawerStyle: {
    backgroundColor: '#560324',
    width: 280,
  },
  drawerActiveTintColor: '#bababa',
  drawerInactiveTintColor: '#ffffff',
  drawerLabelStyle: styles.drawerLabel, 
};