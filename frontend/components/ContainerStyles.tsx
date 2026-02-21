// components/VoucherStyles.ts
import { StyleSheet } from 'react-native';

/**
 * Available styles:
 * -calenderContainer
 * -loadingOverlay
 * -qrContainer
 * -stepContainer
 * -titleContainer
 * -titleImage
 * -voucherBackground
 */

const ContainerStyles = StyleSheet.create({
  calenderContainer:{
    marginTop: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#560324',
    borderRadius: 12,
    overflow: 'hidden',
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    borderWidth: 2,
    borderColor: '#560324',
    marginBottom: 20,
  },
  qrContainer: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    alignSelf: 'center',
    marginBottom: 15,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
   titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
   titleImage: {
     width: '100%',
    height: 200,
    padding: 5,
    borderRadius: 10,
    position: 'static',
    borderWidth: 2,
    borderColor: '#560324'
  },
  voucherBackground: {
    flex: 1,
    width: '100%',
    borderRadius: 5,
    marginTop: 20,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
 
});

export default ContainerStyles;
