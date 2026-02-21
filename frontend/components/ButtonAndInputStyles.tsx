// components/VoucherStyles.ts
import { StyleSheet } from 'react-native';

/**
 * Available styles:
 * -button
 * -buttonInUse
 * -input
 * -picker
 * -pickerWrapper
 */

const ButtonAndInputStyles = StyleSheet.create({
   button: {
    backgroundColor: '#560324',
    paddingVertical: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  buttonInUse: {
    backgroundColor: '#96536d',
    paddingVertical: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
   input: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#560324',
    padding: 8,
    borderRadius: 4,
    marginTop: 6,
    height: 50,
    marginBottom: 6,
  },
  picker: {
    height: 60,
    color: '#000000',
  }, 
    pickerWrapper: {
    borderWidth: 2,
    borderColor: '#560324',
    borderRadius: 4,
    backgroundColor: '#ffffff',
    marginTop: 6,
    height: 50,
    justifyContent: 'center',
  },
});

export default ButtonAndInputStyles;
