import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Card } from '@/src/shared/ui/card';

type LoadingStateProps = {
  label?: string;
};

export function LoadingState({ label = 'Loading your data...' }: LoadingStateProps) {
  const tint = useThemeColor({}, 'tint');

  return (
    <Card>
      <View style={styles.container}>
        <ActivityIndicator color={tint} />
        <ThemedText>{label}</ThemedText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.m - Spacing.xs,
    justifyContent: 'center',
    minHeight: 140,
  },
});