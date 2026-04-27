import { TextField } from '@/src/shared/ui/text-field';

type DateFieldProps = {
  value: string;
  error?: string;
  onChange: (value: string) => void;
};

export function DateField({ value, error, onChange }: DateFieldProps) {
  return (
    <TextField
      autoCapitalize="none"
      autoCorrect={false}
      error={error}
      hint="Format: YYYY-MM-DD"
      keyboardType="numbers-and-punctuation"
      label="Date"
      onChangeText={onChange}
      placeholder="2026-04-26"
      value={value}
    />
  );
}