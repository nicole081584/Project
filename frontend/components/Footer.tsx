// components/Footer.tsx
import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';

export default function Footer() {
  return (
    <ThemedView style={styles.footer}>
      <ThemedText style={styles.footertext}>© 2025 Nicole Stronge</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  footertext: {
    fontSize: 10,
    textAlign: 'right',
  },
  footer: {
    marginTop: 300,
  },
});
