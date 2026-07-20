import { fireEvent, render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { logCrash } from '@/shared/lib/crash-logger';
import { ErrorBoundary } from '../error-boundary';

jest.mock('@/shared/lib/crash-logger', () => ({
  __esModule: true,
  logCrash: jest.fn(),
}));

const logCrashMock = logCrash as jest.MockedFunction<typeof logCrash>;

function Bomb({ explode }: { explode: boolean }) {
  if (explode) throw new Error('kaboom');
  return <Text>safe</Text>;
}

describe('ErrorBoundary', () => {
  let errorSpy: jest.SpyInstance;
  beforeEach(() => {
    logCrashMock.mockReset();
    // React logs caught errors to console.error — silence for clean output.
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    errorSpy.mockRestore();
  });

  test('renders children when no error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <Bomb explode={false} />
      </ErrorBoundary>
    );
    expect(getByText('safe')).toBeTruthy();
  });

  test('renders fallback and reports via logCrash on error', () => {
    const { getByRole, getByText } = render(
      <ErrorBoundary>
        <Bomb explode />
      </ErrorBoundary>
    );

    expect(getByText('kaboom')).toBeTruthy();
    expect(getByRole('button')).toBeTruthy();
    expect(logCrashMock).toHaveBeenCalledTimes(1);
    expect(logCrashMock.mock.calls[0]![1]).toMatchObject({ scope: 'ErrorBoundary' });
  });

  test('Try again resets the boundary', () => {
    const { getByRole, getByText, rerender, queryByText } = render(
      <ErrorBoundary>
        <Bomb explode />
      </ErrorBoundary>
    );
    expect(getByText('kaboom')).toBeTruthy();

    // Swap children first so the next render after reset doesn't re-throw.
    rerender(
      <ErrorBoundary>
        <Bomb explode={false} />
      </ErrorBoundary>
    );
    fireEvent.press(getByRole('button'));

    expect(queryByText('kaboom')).toBeNull();
    expect(getByText('safe')).toBeTruthy();
  });
});
