import { DarkTheme, type Theme } from '@react-navigation/native';
import { Platform } from 'react-native';

const brandBackground = '#0B2E57';
const brandPanel = '#113B68';
const brandPanelRaised = '#184676';
const brandBorder = '#2A5A86';
const brandText = '#F5F7FB';
const brandMuted = '#A9C2DD';
const brandAccent = '#E0B84E';
const brandAccentSoft = '#61C2B1';
const brandSuccess = '#7ED2A1';
const brandDanger = '#FF9085';

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
    chrome: '#082748',
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
    chrome: '#082748',
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
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
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
