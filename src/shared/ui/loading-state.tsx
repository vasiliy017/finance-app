import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Spacing } from '@/shared/config';
import { useThemeColor } from '@/shared/hooks';
import { Card } from './card';
import { ThemedText } from './themed-text';

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