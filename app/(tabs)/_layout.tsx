import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
// import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from "@/hooks/use-color-scheme";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "black",

        tabBarStyle: {
          backgroundColor: "#FA8232",
          borderTopWidth: 0,
          borderTopLeftRadius: 20, // rounded top left
          borderTopRightRadius: 20, // rounded top right
          height: 70, // increase height of tab bar
          elevation: 0,
          overflow: "hidden", // ensure child content respects border radius
          position: "absolute", // remove any default background overlap
          left: 0,
          right: 0,
          bottom: 0,
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
        name="myProducts"
        options={{
          title: "Products",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bag-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="addProduct"
        options={{
          title: "Add Product",
          href: null,
          // tabBarIcon: ({ color, size }) => (
          //   <Ionicons name="add-circle-outline" size={size} color={color} />
          // ),
        }}
      />
      <Tabs.Screen
        name="editProduct"
        options={{
          title: "Edit Product",
          href: null,
          // tabBarIcon: ({ color, size }) => (
          //   <Ionicons name="add-circle-outline" size={size} color={color} />
          // ),
        }}
      />
      <Tabs.Screen
        name="refunds"
        options={{
          title: "Refund",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="refresh-outline" size={size} color={color} />
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
        name="profile"
        options={{
          title: "Account",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="pendingOrder"
        options={{
          // title: "Account",
          href: null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="confirmedOrder"
        options={{
          // title: "Account",
          href: null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="packagingOrder"
        options={{
          // title: "Account",
          href: null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="deliveryOrder"
        options={{
          // title: "Account",
          href: null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="deliveredOrder"
        options={{
          // title: "Account",
          href: null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="returnedOrder"
        options={{
          // title: "Account",
          href: null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cancelledOrder"
        options={{
          // title: "Account",
          href: null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="failedOrder"
        options={{
          // title: "Account",
          href: null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
