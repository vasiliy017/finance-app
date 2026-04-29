import type { PropsWithChildren } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, View } from 'react-native';

import { BackgroundColors, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

type CardProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
}>;

const cardPadding = Spacing.m + Spacing.xs / 2;
const cardGap = Spacing.s + Spacing.xs + Spacing.xs / 2;

export function Card({ children, style }: CardProps) {
  const backgroundColor = useThemeColor({}, 'panel');
  const borderColor = useThemeColor({}, 'border');

  return <View style={[styles.card, { backgroundColor, borderColor }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    borderWidth: 1,
    gap: cardGap,
    padding: cardPadding,
    shadowColor: BackgroundColors.black,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 10,
  },
});