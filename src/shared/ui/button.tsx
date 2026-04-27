import type { ReactNode } from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  icon,
  style,
}: ButtonProps) {
  const tint = useThemeColor({}, 'tint');
  const background = useThemeColor({ light: '#EEF4F7', dark: '#232B31' }, 'background');
  const text = useThemeColor({}, 'text');
  const danger = '#C0392B';

  const variantStyle =
    variant === 'primary'
      ? { backgroundColor: tint, borderColor: tint }
      : variant === 'danger'
        ? { backgroundColor: danger, borderColor: danger }
        : variant === 'ghost'
          ? { backgroundColor: 'transparent', borderColor: 'transparent' }
          : { backgroundColor: background, borderColor: background };

  const labelColor = variant === 'primary' || variant === 'danger' ? '#FFFFFF' : text;

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
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
});