import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/shared/config';
import { Button } from './button';
import { Card } from './card';
import { ThemedText } from './themed-text';

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <Card>
      <View style={styles.content}>
        <ThemedText type="subtitle">{title}</ThemedText>
        <ThemedText>{description}</ThemedText>
      </View>
      {actionLabel && onAction ? <Button label={actionLabel} onPress={onAction} /> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.s - Spacing.xs / 2,
  },
});