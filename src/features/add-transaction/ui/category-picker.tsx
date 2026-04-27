import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { TransactionCategory } from '@/src/entities/transaction';
import { Card } from '@/src/shared/ui/card';

type CategoryOption = {
  id: TransactionCategory;
  label: string;
};

type CategoryPickerProps = {
  categories: readonly CategoryOption[];
  value?: TransactionCategory;
  error?: string;
  onChange: (value: TransactionCategory) => void;
};

export function CategoryPicker({ categories, value, error, onChange }: CategoryPickerProps) {
  return (
    <View style={styles.container}>
      <ThemedText type="defaultSemiBold">Category</ThemedText>
      <View style={styles.grid}>
        {categories.map((category) => {
          const active = category.id === value;

          return (
            <Pressable key={category.id} onPress={() => onChange(category.id)} style={styles.item}>
              <Card style={[styles.chip, active ? styles.activeChip : undefined]}>
                <ThemedText style={active ? styles.activeLabel : undefined}>{category.label}</ThemedText>
              </Card>
            </Pressable>
          );
        })}
      </View>
      {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  activeChip: {
    borderColor: '#0A7EA4',
  },
  activeLabel: {
    color: '#0A7EA4',
    fontWeight: '700',
  },
  chip: {
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
    paddingHorizontal: 12,
    width: '100%',
  },
  container: {
    gap: 8,
  },
  error: {
    color: '#C0392B',
    fontSize: 13,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  item: {
    minWidth: '47%',
  },
});