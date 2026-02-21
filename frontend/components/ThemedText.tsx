import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'small'| 'link'|'voucherTitle' |'voucherValue'|'voucher'|'voucherFineprint';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'small'? styles.small: undefined,
        type === 'link' ? styles.link : undefined,
        type === 'voucherTitle' ? styles.voucherTitle : undefined,
        type === 'voucherValue' ? styles.voucherValue : undefined,
        type === 'voucher' ? styles.voucher : undefined,
        type === 'voucherFineprint' ? styles.voucherFineprint : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  small: {
    fontSize: 12,
    lineHeight: 16,
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#560324',
    fontWeight: 'bold'
  },
  voucherTitle : {
    fontSize: 32,
    color : '#560324',
    textAlign: 'center',
    fontWeight: 'bold',
    lineHeight: 50,
    marginBottom: 20,
  },
  voucherValue :{
    fontSize: 20,
    fontWeight: 'bold',
    color : '#560324',
    textAlign: 'center',
    marginBottom: 30,
  },
  voucher :{
    fontSize: 16,
    color : '#560324',
    textAlign: 'center',
    marginBottom: 30,
  },
  voucherFineprint: {
    fontSize: 10,
    color : 'black',
    textAlign: 'center',

  }

});
