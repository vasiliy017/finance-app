import { StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, TextColors } from '../config/theme';
import { useThemeColor } from '../hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    fontFamily: Fonts?.sans,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontFamily: Fonts?.sans,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontFamily: Fonts?.rounded,
    fontSize: 34,
    fontWeight: 'bold',
    letterSpacing: 0.4,
    lineHeight: 40,
  },
  subtitle: {
    fontFamily: Fonts?.rounded,
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 0.2,
    lineHeight: 28,
  },
  link: {
    color: TextColors.secondary,
    fontFamily: Fonts?.sans,
    fontSize: 16,
    lineHeight: 24,
  },
});