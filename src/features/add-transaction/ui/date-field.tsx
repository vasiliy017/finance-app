import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { formatDateInput, parseDateInput } from '@/src/shared/lib/date';

type DateFieldProps = {
  value: string;
  error?: string;
  onChange: (value: string) => void;
};

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
          <MaterialIcons color="#F5F7FB" name="calendar-today" size={24} />
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
              placeholderTextColor="#A9C2DD"
              style={styles.input}
              value={value}
            />
          </View>
        ) : (
          <View style={styles.pickerWrap}>
            <ThemedText type="defaultSemiBold">Select date</ThemedText>
            <DateTimePicker
              accentColor="#E0B84E"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              mode="date"
              onChange={handleNativeChange}
              textColor="#F5F7FB"
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
    backgroundColor: '#F5F7FB',
  },
  activeChipText: {
    color: '#61C2B1',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  calendarButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  chip: {
    alignItems: 'center',
    borderRadius: 18,
    justifyContent: 'center',
    minWidth: 68,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  chipText: {
    color: '#00A79D',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
  },
  container: {
    gap: 10,
  },
  editorWrap: {
    gap: 8,
  },
  error: {
    color: '#FF9085',
    fontSize: 13,
    lineHeight: 18,
  },
  input: {
    backgroundColor: '#113B68',
    borderColor: '#2A5A86',
    borderRadius: 20,
    borderWidth: 1,
    color: '#F5F7FB',
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pickerWrap: {
    backgroundColor: '#113B68',
    borderColor: '#2A5A86',
    borderRadius: 20,
    borderWidth: 1,
    gap: 10,
    overflow: 'hidden',
    padding: 14,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});