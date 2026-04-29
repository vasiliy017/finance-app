import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
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
    gap: 8,
    paddingBottom: 4,
  },
  optionActiveText: {
    color: '#61C2B1',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  optionText: {
    color: '#F5F7FB',
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
    backgroundColor: '#61C2B1',
  },
  wrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
});