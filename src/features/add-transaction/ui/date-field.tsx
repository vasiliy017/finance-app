import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { BackgroundColors, Colors, Spacing, TextColors } from '@/shared/config';
import { formatDateInput, parseDateInput } from '@/shared/lib/date';
import { ThemedText } from '@/shared/ui';

type DateFieldProps = {
  value: string;
  error?: string;
  onChange: (value: string) => void;
};

const fieldGap = Spacing.s + Spacing.xs / 2;
const chipInset = Spacing.m - Spacing.xs;
const panelInset = Spacing.m - Spacing.xs / 2;

function shiftDay(value: string, delta: number) {
  const base = parseDateInput(value) ?? Date.now();
  const date = new Date(base);
  date.setDate(date.getDate() + delta);

  return date.getTime();
}

function formatDateChip(timestamp: number) {
  const date = new Date(timestamp);
  const day = `${date.getDate()}`.padStart(2, '0');
  const month = `${date.getMonth() + 1}`.padStart(2, '0');

  return `${day}.${month}`;
}

export function DateField({ value, error, onChange }: DateFieldProps) {
  const [expanded, setExpanded] = useState(false);
  const chips = useMemo(
    () => [shiftDay(value, 0), shiftDay(value, -1), shiftDay(value, -2)],
    [value]
  );
  const selectedDate = useMemo(() => new Date(parseDateInput(value) ?? Date.now()), [value]);

  function handleNativeChange(event: DateTimePickerEvent, nextDate?: Date) {
    if (Platform.OS === 'android') {
      setExpanded(false);
    }

    if (event.type === 'dismissed' || !nextDate) {
      return;
    }

    const normalized = new Date(
      nextDate.getFullYear(),
      nextDate.getMonth(),
      nextDate.getDate(),
      12,
      0,
      0,
      0
    );

    onChange(formatDateInput(normalized.getTime()));
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {chips.map((timestamp, index) => {
          const chipValue = formatDateInput(timestamp);
          const active = chipValue === value;

          return (
            <Pressable
              key={chipValue}
              onPress={() => onChange(chipValue)}
              style={[styles.chip, active ? styles.activeChip : undefined]}>
              <ThemedText style={active ? styles.activeChipText : styles.chipText}>
                {formatDateChip(timestamp)}
              </ThemedText>
            </Pressable>
          );
        })}

        <Pressable onPress={() => setExpanded((current) => !current)} style={styles.calendarButton}>
          <MaterialIcons color={TextColors.body} name="calendar-today" size={24} />
        </Pressable>
      </View>

      {expanded ? (
        Platform.OS === 'web' ? (
          <View style={styles.editorWrap}>
            <ThemedText type="defaultSemiBold">Custom date</ThemedText>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="numbers-and-punctuation"
              onChangeText={onChange}
              placeholder="2026-04-26"
              placeholderTextColor={Colors.dark.muted}
              style={styles.input}
              value={value}
            />
          </View>
        ) : (
          <View style={styles.pickerWrap}>
            <ThemedText type="defaultSemiBold">Select date</ThemedText>
            <DateTimePicker
              accentColor={TextColors.tertiary}
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              mode="date"
              onChange={handleNativeChange}
              textColor={TextColors.body}
              value={selectedDate}
            />
          </View>
        )
      ) : null}

      {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  activeChip: {
    backgroundColor: BackgroundColors.window,
  },
  activeChipText: {
    color: TextColors.secondary,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  calendarButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  chip: {
    alignItems: 'center',
    borderRadius: 18,
    justifyContent: 'center',
    minWidth: 64,
    paddingHorizontal: chipInset,
    paddingVertical: Spacing.s - Spacing.xs / 2,
  },
  chipText: {
    color: TextColors.secondary,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 20,
  },
  container: {
    gap: fieldGap,
  },
  editorWrap: {
    gap: Spacing.s,
  },
  error: {
    color: BackgroundColors.red,
    fontSize: 13,
    lineHeight: 18,
  },
  input: {
    backgroundColor: Colors.dark.panel,
    borderColor: Colors.dark.border,
    borderRadius: 20,
    borderWidth: 1,
    color: TextColors.body,
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: Spacing.m,
    paddingVertical: chipInset,
  },
  pickerWrap: {
    backgroundColor: Colors.dark.panel,
    borderColor: Colors.dark.border,
    borderRadius: 20,
    borderWidth: 1,
    gap: fieldGap,
    overflow: 'hidden',
    padding: panelInset,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});