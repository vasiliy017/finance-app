import type { TextInputProps } from 'react-native';
import { StyleSheet, TextInput, View } from 'react-native';

import { Spacing } from '@/shared/config';
import { useThemeColor } from '@/shared/hooks';
import { ThemedText } from './themed-text';

type TextFieldProps = TextInputProps & {
  label: string;
  error?: string;
  hint?: string;
};

const fieldContainerGap = Spacing.s + Spacing.xs / 2;
const fieldHorizontalPadding = Spacing.m + Spacing.xs / 2;
const fieldVerticalPadding = Spacing.s + Spacing.xs + Spacing.xs / 2;

export function TextField({ label, error, hint, style, ...props }: TextFieldProps) {
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const inputBackground = useThemeColor({}, 'panelRaised');
  const placeholderColor = useThemeColor({}, 'muted');
  const danger = useThemeColor({}, 'danger');

  return (
    <View style={styles.container}>
      <ThemedText type="defaultSemiBold">{label}</ThemedText>
      <TextInput
        placeholderTextColor={placeholderColor}
        style={[
          styles.input,
          {
            backgroundColor: inputBackground,
            borderColor: error ? danger : borderColor,
            color: textColor,
          },
          style,
        ]}
        {...props}
      />
      {error ? <ThemedText style={[styles.error, { color: danger }]}>{error}</ThemedText> : null}
      {!error && hint ? <ThemedText style={styles.hint}>{hint}</ThemedText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: fieldContainerGap,
  },
  error: {
    fontSize: 13,
    lineHeight: 18,
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.72,
  },
  input: {
    borderRadius: 22,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 58,
    paddingHorizontal: fieldHorizontalPadding,
    paddingVertical: fieldVerticalPadding,
  },
});