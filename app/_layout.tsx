import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AppNavigationTheme } from '@/constants/theme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <ThemeProvider value={AppNavigationTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="transaction"
          options={{
            presentation: 'modal',
            headerStyle: { backgroundColor: AppNavigationTheme.colors.card },
            headerTintColor: AppNavigationTheme.colors.text,
            headerShadowVisible: false,
            contentStyle: { backgroundColor: AppNavigationTheme.colors.background },
          }}
        />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
