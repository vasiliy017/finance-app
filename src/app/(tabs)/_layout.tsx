import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';

import { HapticTab } from '@/app/components/haptic-tab';
import { IconSymbol } from '@/app/components/ui/icon-symbol';
import { BackgroundColors, Colors, Spacing, Strings } from '@/shared/config';
import { useColorScheme } from '@/shared/hooks';

const tabBarBorderColor = `${BackgroundColors.lightGray}24`;

// `chrome` resolves to the same brand panel in both schemes; hoisting avoids
// re-creating a fresh style object on every render of `TabLayout`.
const tabBarStyle = {
  backgroundColor: Colors.light.chrome,
  borderTopColor: tabBarBorderColor,
  borderTopWidth: StyleSheet.hairlineWidth,
  elevation: 0,
  height: 56,
  paddingBottom: Spacing.xs / 2,
  paddingTop: Spacing.xs / 2,
} as const;

const tabBarLabelStyle = {
  fontSize: 9,
  fontWeight: '700',
} as const;

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        sceneStyle: { backgroundColor: Colors[colorScheme ?? 'light'].background },
        tabBarStyle,
        tabBarLabelStyle,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: Strings.tabs.home,
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: Strings.tabs.transactions,
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="list.bullet.rectangle" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}