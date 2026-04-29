import type { TextInputProps } from 'react-native';
import { StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

type TextFieldProps = TextInputProps & {
  label: string;
  error?: string;
  hint?: string;
};

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
      {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
      {!error && hint ? <ThemedText style={styles.hint}>{hint}</ThemedText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  error: {
    color: '#FF9085',
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
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
});