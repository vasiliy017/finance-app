import { DarkTheme, type Theme } from '@react-navigation/native';
import { Platform } from 'react-native';

export const TextColors = {
  primary: '#DD7426',
  brand: '#0F365B',
  black: '#010101',
  secondary: '#67C1B4',
  tertiary: '#DCB85C',
  body: '#F1F1F1',
} as const;

export const BackgroundColors = {
  bg: '#02294E',
  window: '#F1F1F1',
  black: '#0B0B0B',
  white: '#FBFCFD',
  tertiary: '#DCB85C',
  secondary: '#67C1B4',
  primary: '#C87436',
  red: '#E96161',
  green: '#79D38C',
  purpure: '#776B89',
  blue: '#5999E2',
  yellow: '#F0D463',
  orange: '#FFA953',
  violet: '#D63AD9',
  lightGray: '#B4B7B9',
  brown: '#784621',
  shadowScreen: 'rgba(16, 16, 16, 0.32)',
  pink: '#FE3FA8',
  lightPurpure: '#7F61AC',
  darkOrange: '#B76411',
  darkBlue: '#135DB2',
  darkGreen: '#15832D',
  darkBrown: '#4E280B',
} as const;

export const Spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
} as const;

const brandBackground = BackgroundColors.bg;
const brandPanel = TextColors.brand;
const brandPanelRaised = BackgroundColors.darkBlue;
const brandBorder = BackgroundColors.darkBlue;
const brandText = TextColors.body;
const brandMuted = BackgroundColors.lightGray;
const brandAccent = TextColors.tertiary;
const brandAccentSoft = TextColors.secondary;
const brandSuccess = BackgroundColors.green;
const brandDanger = BackgroundColors.red;

export const Colors = {
  light: {
    text: brandText,
    background: brandBackground,
    tint: brandAccent,
    icon: brandMuted,
    tabIconDefault: '#6F8CAA',
    tabIconSelected: brandAccent,
    panel: brandPanel,
    panelRaised: brandPanelRaised,
    border: brandBorder,
    muted: brandMuted,
    accentSoft: brandAccentSoft,
    success: brandSuccess,
    danger: brandDanger,
    chrome: brandPanel,
  },
  dark: {
    text: brandText,
    background: brandBackground,
    tint: brandAccent,
    icon: brandMuted,
    tabIconDefault: '#6F8CAA',
    tabIconSelected: brandAccent,
    panel: brandPanel,
    panelRaised: brandPanelRaised,
    border: brandBorder,
    muted: brandMuted,
    accentSoft: brandAccentSoft,
    success: brandSuccess,
    danger: brandDanger,
    chrome: brandPanel,
  },
};

export const AppNavigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.dark.tint,
    background: Colors.dark.background,
    card: Colors.dark.chrome,
    text: Colors.dark.text,
    border: Colors.dark.border,
    notification: Colors.dark.tint,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});