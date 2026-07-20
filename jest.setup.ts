/* eslint-disable @typescript-eslint/no-require-imports */
// Global mocks for Jest. Loaded via the "setupFiles" entry in package.json#jest.

// --- @expo/vector-icons --------------------------------------------------
// The real implementation lazy-loads icon fonts via async setState, which
// leaks past the test boundary and floods the console with act() warnings.
// Replace each icon set with a static text stub that captures the name prop.
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  const makeIcon = (family: string) =>
    React.forwardRef(function Icon(
      { name, ...rest }: { name?: string } & Record<string, unknown>,
      ref: React.Ref<unknown>,
    ) {
      return React.createElement(
        Text,
        { ref, accessibilityLabel: `${family}-${name ?? ''}`, ...rest },
        name ?? '',
      );
    });
  return new Proxy(
    {},
    {
      get: (_target, prop: string) => {
        if (prop === '__esModule') return true;
        return makeIcon(prop);
      },
    },
  );
});
jest.mock('@expo/vector-icons/MaterialIcons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  const Icon = React.forwardRef(function MaterialIcons(
    { name, ...rest }: { name?: string } & Record<string, unknown>,
    ref: React.Ref<unknown>,
  ) {
    return React.createElement(
      Text,
      { ref, accessibilityLabel: `material-${name ?? ''}`, ...rest },
      name ?? '',
    );
  });
  // Match the real module's default-export + named glyphMap shape.
  return { __esModule: true, default: Icon, glyphMap: {} };
});

// --- AsyncStorage ---------------------------------------------------------
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// --- expo-file-system (legacy) -------------------------------------------
jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///mock-documents/',
  cacheDirectory: 'file:///mock-cache/',
  EncodingType: { UTF8: 'utf8', Base64: 'base64' },
  getInfoAsync: jest.fn(async () => ({ exists: true, size: 1024, isDirectory: false })),
  makeDirectoryAsync: jest.fn(async () => undefined),
  copyAsync: jest.fn(async () => undefined),
  deleteAsync: jest.fn(async () => undefined),
  readAsStringAsync: jest.fn(async () => ''),
  writeAsStringAsync: jest.fn(async () => undefined),
}));

// --- expo-image-picker ---------------------------------------------------
jest.mock('expo-image-picker', () => ({
  MediaTypeOptions: { Images: 'Images', Videos: 'Videos', All: 'All' },
  PermissionStatus: { UNDETERMINED: 'undetermined', DENIED: 'denied', GRANTED: 'granted' },
  requestMediaLibraryPermissionsAsync: jest.fn(async () => ({ granted: true, status: 'granted' })),
  launchImageLibraryAsync: jest.fn(async () => ({ canceled: true, assets: null })),
}));

// --- expo-haptics --------------------------------------------------------
jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
  impactAsync: jest.fn(async () => undefined),
  notificationAsync: jest.fn(async () => undefined),
  selectionAsync: jest.fn(async () => undefined),
}));

// --- expo-image ----------------------------------------------------------
jest.mock('expo-image', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Image: React.forwardRef((props: Record<string, unknown>, ref: unknown) =>
      React.createElement(View, { ...props, ref })
    ),
  };
});

// --- expo-router ---------------------------------------------------------
jest.mock('expo-router', () => {
  const React = require('react');
  const { View } = require('react-native');
  const PassThrough = ({ children }: { children?: unknown }) =>
    React.createElement(View, null, children as never);
  const router = {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
    dismiss: jest.fn(),
    setParams: jest.fn(),
  };
  return {
    router,
    useRouter: () => router,
    useLocalSearchParams: jest.fn(() => ({})),
    useSegments: jest.fn(() => []),
    usePathname: jest.fn(() => '/'),
    useFocusEffect: (effect: () => void | (() => void)) => {
      const cleanup = effect();
      if (typeof cleanup === 'function') cleanup();
    },
    Link: PassThrough,
    Stack: Object.assign(PassThrough, { Screen: PassThrough }),
    Tabs: Object.assign(PassThrough, { Screen: PassThrough }),
    Slot: PassThrough,
    Redirect: () => null,
  };
});

// --- @react-navigation/native --------------------------------------------
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: jest.fn(() => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      dispatch: jest.fn(),
      setOptions: jest.fn(),
      addListener: jest.fn(() => () => undefined),
    })),
    useFocusEffect: (effect: () => void | (() => void)) => {
      const cleanup = effect();
      if (typeof cleanup === 'function') cleanup();
    },
    usePreventRemove: jest.fn(),
  };
});

// --- Alert ---------------------------------------------------------------
// Spy installed per-test in jest.setup via beforeEach so tests can inspect calls.
// (jest-expo + RN 0.81 doesn't expose Alert at the legacy module path,
//  so we leave Alert intact and tests spy on it directly.)

// --- Silence noisy console warnings during tests -------------------------
// (Opt-in: leave commented unless tests prove too chatty.)
// const originalWarn = console.warn;
// console.warn = (...args: unknown[]) => {
//   const msg = String(args[0] ?? '');
//   if (msg.includes('Animated:')) return;
//   originalWarn(...args);
// };
