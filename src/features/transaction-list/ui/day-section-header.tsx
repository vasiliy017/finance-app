import { StyleSheet, View } from 'react-native';

import { Colors, Spacing } from '@/shared/config';
import { formatCurrency } from '@/shared/lib/currency';
import { formatDayLabel } from '@/shared/lib/date';
import { ThemedText } from '@/shared/ui';

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
    marginBottom: Spacing.s + Spacing.xs / 2,
  },
  negative: {
    color: Colors.dark.danger,
    fontWeight: '600',
  },
  positive: {
    color: Colors.dark.success,
    fontWeight: '600',
  },
});