import { router } from "expo-router";
import React from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface VerticalMenuProps {
  onSelect: (menuItem: string) => void;
}

const VerticalMenu: React.FC<VerticalMenuProps> = ({ onSelect }) => {
  // Logout handler
  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              // Clear all auth info
              await AsyncStorage.removeItem("seller_token");
              await AsyncStorage.removeItem("userProfile");

              // Navigate to login and remove all previous screens
              router.replace("/loginScreen");
            } catch (error) {
              console.log("Logout error:", error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };
  return (
    <View style={styles.container}>
      {/* <Text style={styles.menuHead}>Order Management</Text>
      <Text style={styles.menuHead}>Product Management</Text> */}
      <Text style={styles.menuHead}>Help & Support</Text>
      <Pressable onPress={() => onSelect("Home")} style={styles.menuItem}>
        <Text style={styles.menuText}>Inbox</Text>
      </Pressable>
      <Pressable
        onPress={() => router.push("/(tabs)/shippingMethod")}
        style={styles.menuItem}
      >
        <Text style={styles.menuText}>Shipping Methods</Text>
      </Pressable>
      <Pressable onPress={() => onSelect("Settings")} style={styles.menuItem}>
        <Text style={styles.menuText}>Wihdraws</Text>
      </Pressable>
      <Pressable
        onPress={() => router.push("/(tabs)/bankInformation")}
        style={styles.menuItem}
      >
        <Text style={styles.menuText}>Bank Information</Text>
      </Pressable>
      <Pressable
        onPress={() => router.push("/(tabs)/shopSetting")}
        style={styles.menuItem}
      >
        <Text style={styles.menuText}>Shop Setting</Text>
      </Pressable>
      <Pressable onPress={handleLogout} style={styles.menuItem}>
        <Text style={styles.menuText}>Logout</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: "100%", // full height
    backgroundColor: "#FA8232",
    paddingTop: "50%",
    paddingHorizontal: 30,
    width: 200,
  },
  menuItem: {
    paddingVertical: 15,
  },
  menuHead: {
    color: "#000",
    fontWeight: "500",
    fontSize: 22,
  },
  menuText: {
    color: "#fff",
    fontWeight: "300",
    fontSize: 20,
  },
});

export default VerticalMenu;
