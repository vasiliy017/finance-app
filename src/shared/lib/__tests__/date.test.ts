import {
    formatDateInput,
    formatDayLabel,
    getDayKey,
    parseDateInput,
} from '../date';

describe('parseDateInput', () => {
  test.each([
    ['2025-01-15', true],
    ['2024-02-29', true], // leap year
    ['2024-12-31', true],
    ['1999-06-01', true],
  ])('accepts valid %s', (value, _) => {
    expect(parseDateInput(value)).not.toBeNull();
  });

  test.each([
    '',
    '2025-1-15',
    '2025-01-1',
    'yyyy-mm-dd',
    '2025/01/15',
    '2025-13-01', // month > 12
    '2025-00-15', // month < 1
    '2025-01-32', // day > 31
    '2025-01-00', // day < 1
    '2025-02-30', // Feb 30 invalid
    '2023-02-29', // non-leap year
    '2025-04-31', // April has 30 days
  ])('rejects invalid %s', (value) => {
    expect(parseDateInput(value)).toBeNull();
  });

  test('trims surrounding whitespace', () => {
    expect(parseDateInput('  2025-01-15  ')).not.toBeNull();
  });

  test('round-trips with formatDateInput', () => {
    const original = new Date(2025, 5, 17, 12, 0, 0).getTime();
    const formatted = formatDateInput(original);
    const parsed = parseDateInput(formatted);
    expect(formatted).toBe('2025-06-17');
    expect(parsed).not.toBeNull();
    expect(getDayKey(parsed!)).toBe('2025-06-17');
  });
});

describe('formatDateInput', () => {
  test('pads month and day with leading zeros', () => {
    const ts = new Date(2025, 0, 5, 9, 30).getTime(); // Jan 5
    expect(formatDateInput(ts)).toBe('2025-01-05');
  });
});

describe('formatDayLabel', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date(2025, 5, 17, 10, 0, 0));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('returns "Today" for current day key', () => {
    expect(formatDayLabel('2025-06-17')).toBe('Today');
  });

  test('returns "Yesterday" for previous day key', () => {
    expect(formatDayLabel('2025-06-16')).toBe('Yesterday');
  });

  test('returns locale-formatted date for other days', () => {
    const result = formatDayLabel('2025-01-15');
    expect(result).not.toBe('Today');
    expect(result).not.toBe('Yesterday');
    expect(result).toMatch(/15/);
    expect(result).toMatch(/2025/);
  });

  test('returns the original key if unparseable', () => {
    expect(formatDayLabel('not-a-date')).toBe('not-a-date');
  });
});
