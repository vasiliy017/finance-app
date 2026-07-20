import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppNavigationTheme, Spacing, Strings } from '@/shared/config';
import { logCrash } from '@/shared/lib/crash-logger';

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

type ErrorBoundaryState = {
  error: Error | null;
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logCrash(error, {
      scope: 'ErrorBoundary',
      extra: { componentStack: info.componentStack },
    });
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;

    if (!error) {
      return this.props.children;
    }

    return (
      <View style={styles.container}>
        <Text style={styles.title}>{Strings.errorBoundary.title}</Text>
        <Text style={styles.message}>{error.message || Strings.errorBoundary.fallbackMessage}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={Strings.common.tryAgain}
          onPress={this.handleReset}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Text style={styles.buttonLabel}>{Strings.common.tryAgain}</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.l,
    backgroundColor: AppNavigationTheme.colors.background,
  },
  title: {
    color: AppNavigationTheme.colors.text,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: Spacing.s,
    textAlign: 'center',
  },
  message: {
    color: AppNavigationTheme.colors.text,
    opacity: 0.7,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: Spacing.l,
  },
  button: {
    paddingHorizontal: Spacing.l,
    paddingVertical: Spacing.s,
    borderRadius: 12,
    backgroundColor: AppNavigationTheme.colors.primary,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
