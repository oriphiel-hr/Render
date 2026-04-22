import React from 'react';
import { Text, View } from 'react-native';
import { styles } from '../styles';

export default function BrandHeader() {
  return (
    <View style={styles.brandRow}>
      <View style={styles.brandMark}>
        <Text style={styles.brandMarkText}>U</Text>
      </View>
      <View>
        <Text style={styles.brandTitle}>Uslugar</Text>
        <Text style={styles.brandSubtitle}>Marketplace usluga</Text>
      </View>
    </View>
  );
}
