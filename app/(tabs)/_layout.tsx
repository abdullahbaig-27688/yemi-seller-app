import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
// import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Ionicons from "react-native-vector-icons/Ionicons";


export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
  <Tabs
  screenOptions={{
    tabBarActiveTintColor: "black",
    tabBarInactiveTintColor: "black",
    tabBarStyle: {
      backgroundColor: "#fff",
      borderTopWidth: 0,
      elevation: 0,
    },
    headerShown: false,
    tabBarButton: HapticTab,
  }}
>
  <Tabs.Screen
    name="index"
    options={{
      title: "Dashboard",
      tabBarIcon: ({ color, size }) => (
        <Ionicons name="home-outline" size={size} color={color} />
      ),
    }}
  />
  <Tabs.Screen
    name="Product"
    options={{
      title: "Products",
      tabBarIcon: ({ color, size }) => (
        <Ionicons name="cart-outline" size={size} color={color} />
      ),
    }}
  />
  <Tabs.Screen
    name="incomingOrder"
    options={{
      title: "Orders",
      tabBarIcon: ({ color, size }) => (
        <Ionicons name="cube-outline" size={size} color={color} />
      ),
    }}
  />
  <Tabs.Screen
    name="Account"
    options={{
      title: "Account",
      tabBarIcon: ({ color, size }) => (
        <Ionicons name="person-circle-outline" size={size} color={color} />
      ),
    }}
  />
</Tabs>

  );
}
