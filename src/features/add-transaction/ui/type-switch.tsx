import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing, TextColors } from '@/constants/theme';
import type { TransactionType } from '@/src/entities/transaction';

type TypeSwitchProps = {
  value: TransactionType;
  onChange: (value: TransactionType) => void;
};

export function TypeSwitch({ value, onChange }: TypeSwitchProps) {
  return (
    <View style={styles.wrapper}>
      {(['expense', 'income'] as const).map((item) => {
        const active = item === value;

        return (
          <Pressable
            key={item}
            onPress={() => onChange(item)}
            style={styles.option}>
            <ThemedText style={active ? styles.optionActiveText : styles.optionText}>
              {item === 'expense' ? 'Expenses' : 'Income'}
            </ThemedText>
            <View style={[styles.underline, active ? styles.underlineActive : undefined]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  option: {
    alignItems: 'center',
    gap: Spacing.s,
    paddingBottom: Spacing.xs,
  },
  optionActiveText: {
    color: TextColors.secondary,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  optionText: {
    color: TextColors.body,
    fontSize: 18,
    lineHeight: 24,
  },
  underline: {
    backgroundColor: 'transparent',
    borderRadius: 999,
    height: 3,
    width: 72,
  },
  underlineActive: {
    backgroundColor: TextColors.secondary,
  },
  wrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.s,
  },
});