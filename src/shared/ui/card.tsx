import type { PropsWithChildren } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, View } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

type CardProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
}>;

export function Card({ children, style }: CardProps) {
  const backgroundColor = useThemeColor({ light: '#F7FAFC', dark: '#1E2428' }, 'background');
  const borderColor = useThemeColor({ light: '#D8E1E8', dark: '#2C363D' }, 'icon');

  return <View style={[styles.card, { backgroundColor, borderColor }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
});