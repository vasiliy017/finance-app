import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';

import { HapticTab } from '@/app/components/haptic-tab';
import { IconSymbol } from '@/app/components/ui/icon-symbol';
import { BackgroundColors, Colors, Spacing } from '@/shared/config';
import { useColorScheme } from '@/shared/hooks';

const tabBarBorderColor = `${BackgroundColors.lightGray}24`;

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
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].chrome,
          borderTopColor: tabBarBorderColor,
          borderTopWidth: StyleSheet.hairlineWidth,
          elevation: 0,
          height: 56,
          paddingBottom: Spacing.xs / 2,
          paddingTop: Spacing.xs / 2,
        },
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: '700',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="list.bullet.rectangle" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}