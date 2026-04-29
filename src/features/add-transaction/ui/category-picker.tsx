import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BackgroundColors, Spacing, TextColors } from '@/constants/theme';
import type { TransactionCategory } from '@/src/entities/transaction';

type CategoryOption = {
  id: TransactionCategory;
  label: string;
  icon: string;
  color: string;
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
              <View style={styles.content}>
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: category.color },
                    active ? styles.activeCircle : undefined,
                  ]}>
                  <MaterialIcons
                    color={BackgroundColors.white}
                    name={category.icon as keyof typeof MaterialIcons.glyphMap}
                    size={28}
                  />
                </View>
                <ThemedText style={styles.label}>{category.label}</ThemedText>
              </View>
            </Pressable>
          );
        })}
      </View>
      {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  activeCircle: {
    borderColor: BackgroundColors.white,
    borderWidth: 3,
    shadowColor: BackgroundColors.white,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  container: {
    gap: Spacing.m - Spacing.xs,
  },
  content: {
    alignItems: 'center',
    gap: Spacing.s,
  },
  error: {
    color: BackgroundColors.red,
    fontSize: 13,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.m - Spacing.xs / 2,
    justifyContent: 'space-between',
  },
  iconCircle: {
    alignItems: 'center',
    borderRadius: 32,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  item: {
    width: '22%',
  },
  label: {
    color: TextColors.body,
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
});