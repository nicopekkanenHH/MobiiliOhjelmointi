import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {},
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Laskin',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="guess" 
        options={{
         title: 'Arvaus',
         tabBarIcon: ({ color }) => (
          <IconSymbol size={28} name="gamecontroller.fill" color={color} />
    ),
  }}
/>
<Tabs.Screen
        name="shopping"
        options={{
          title: 'Ostokset',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="cart.fill" color={color} />,
        }}
      />
      <Tabs.Screen
  name="history"
  options={{
    href: null,
    title: 'History',
  }}
/>
<Tabs.Screen
  name="recipes"
  options={{
    title: 'Reseptit',
    tabBarIcon: ({ color }) => <IconSymbol size={28} name="book.fill" color={color} />,
  }}
/>
<Tabs.Screen
    name="recipes/[id]"
    options={{
      href: null, 
    }}
  />
  <Tabs.Screen
  name="converter"
  options={{
    title: 'Valuutta',
    tabBarIcon: ({ color }) => <IconSymbol size={28} name="eurosign.circle.fill" color={color} />,
  }}
/>
    </Tabs>
  );
}
