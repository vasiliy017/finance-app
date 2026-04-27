import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { TransactionType } from '@/src/entities/transaction';

type TypeSwitchProps = {
  value: TransactionType;
  onChange: (value: TransactionType) => void;
};

export function TypeSwitch({ value, onChange }: TypeSwitchProps) {
  const background = useThemeColor({ light: '#EEF4F7', dark: '#232B31' }, 'background');
  const tint = useThemeColor({}, 'tint');
  const text = useThemeColor({}, 'text');

  return (
    <View style={[styles.wrapper, { backgroundColor: background }]}> 
      {(['expense', 'income'] as const).map((item) => {
        const active = item === value;

        return (
          <Pressable
            key={item}
            onPress={() => onChange(item)}
            style={[styles.option, active ? { backgroundColor: tint } : undefined]}>
            <ThemedText style={{ color: active ? '#FFFFFF' : text, fontWeight: '600' }}>
              {item === 'expense' ? 'Expense' : 'Income'}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  option: {
    alignItems: 'center',
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
  },
  wrapper: {
    borderRadius: 16,
    flexDirection: 'row',
    gap: 8,
    padding: 6,
  },
});