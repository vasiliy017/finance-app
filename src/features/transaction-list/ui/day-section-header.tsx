import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { formatCurrency } from '@/src/shared/lib/currency';
import { formatDayLabel } from '@/src/shared/lib/date';

type DaySectionHeaderProps = {
  dayKey: string;
  subtotal: number;
};

export function DaySectionHeader({ dayKey, subtotal }: DaySectionHeaderProps) {
  return (
    <View style={styles.container}>
      <ThemedText type="defaultSemiBold">{formatDayLabel(dayKey)}</ThemedText>
      <ThemedText style={subtotal >= 0 ? styles.positive : styles.negative}>
        {subtotal >= 0 ? '+' : ''}
        {formatCurrency(subtotal)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  negative: {
    color: '#C0392B',
    fontWeight: '600',
  },
  positive: {
    color: '#1F8A4D',
    fontWeight: '600',
  },
});