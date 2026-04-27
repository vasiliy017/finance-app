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
  const borderColor = useThemeColor({ light: '#D8E1E8', dark: '#2C363D' }, 'icon');
  const inputBackground = useThemeColor({ light: '#FFFFFF', dark: '#1A2125' }, 'background');
  const placeholderColor = useThemeColor({ light: '#7A8793', dark: '#7A8793' }, 'icon');

  return (
    <View style={styles.container}>
      <ThemedText type="defaultSemiBold">{label}</ThemedText>
      <TextInput
        placeholderTextColor={placeholderColor}
        style={[
          styles.input,
          {
            backgroundColor: inputBackground,
            borderColor: error ? '#C0392B' : borderColor,
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
    gap: 8,
  },
  error: {
    color: '#C0392B',
    fontSize: 13,
    lineHeight: 18,
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.7,
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
});