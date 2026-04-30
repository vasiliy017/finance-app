import type { ReactNode } from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { BackgroundColors, Spacing, TextColors } from '@/shared/config';
import { useThemeColor } from '@/shared/hooks';
import { ThemedText } from './themed-text';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

const buttonHorizontalPadding = Spacing.m + Spacing.xs;
const buttonVerticalPadding = Spacing.s + Spacing.xs + Spacing.xs / 2;

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  icon,
  style,
}: ButtonProps) {
  const tint = useThemeColor({}, 'tint');
  const panel = useThemeColor({}, 'panelRaised');
  const border = useThemeColor({}, 'border');
  const text = useThemeColor({}, 'text');
  const danger = useThemeColor({}, 'danger');

  const variantStyle =
    variant === 'primary'
      ? { backgroundColor: tint, borderColor: tint }
      : variant === 'danger'
        ? { backgroundColor: danger, borderColor: danger }
        : variant === 'ghost'
          ? { backgroundColor: 'transparent', borderColor: 'transparent' }
          : { backgroundColor: panel, borderColor: border };

  const labelColor = variant === 'primary' ? TextColors.brand : variant === 'danger' ? BackgroundColors.white : text;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variantStyle,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}>
      {icon}
      <ThemedText style={[styles.label, { color: labelColor }]}>{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    gap: Spacing.s,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: buttonHorizontalPadding,
    paddingVertical: buttonVerticalPadding,
    shadowColor: BackgroundColors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 8,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
});