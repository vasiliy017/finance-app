import type { PropsWithChildren } from 'react';
import type { ScrollViewProps, StyleProp, ViewStyle } from 'react-native';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Spacing } from '@/shared/config';
import { useThemeColor } from '@/shared/hooks';

type ScreenProps = PropsWithChildren<{
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: ScrollViewProps['contentContainerStyle'];
}>;

const screenGap = Spacing.m + Spacing.xs;
const screenHorizontalInset = Spacing.m;
const screenBottomInset = Spacing.xl + Spacing.s;
const screenTopInset = Spacing.m + Spacing.xs / 2;

export function Screen({ children, scroll = true, style, contentContainerStyle }: ScreenProps) {
  const backgroundColor = useThemeColor({}, 'background');

  if (scroll) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeArea, { backgroundColor }]}> 
        <ScrollView
          contentContainerStyle={[styles.content, contentContainerStyle]}
          style={styles.scroll}
          keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeArea, { backgroundColor }]}> 
      <View style={[styles.content, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    gap: screenGap,
    paddingHorizontal: screenHorizontalInset,
    paddingBottom: screenBottomInset,
    paddingTop: screenTopInset,
  },
});