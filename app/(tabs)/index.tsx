import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import HomeHeader from "@/components/Header";
import VerticalMenu from "@/components/verticalmenu";

const icons = {
  pending: require("@/assets/images/icons/pending.png"),
  confirmed: require("@/assets/images/icons/confirmed.png"),
  packaging: require("@/assets/images/icons/packaging.png"),
  delivery: require("@/assets/images/icons/out-of-delivery.png"),
  deliverd: require("@/assets/images/icons/delivered.png"),
  cancelled: require("@/assets/images/icons/canceled.png"),
  returned: require("@/assets/images/icons/returned.png"),
  failed: require("@/assets/images/icons/failed-to-deliver.png"),
  withdraw: require("@/assets/images/icons/withdraw.png"),
  peningWithdraw: require("@/assets/images/icons/pw.png"),
  alreadyWithdrawn: require("@/assets/images/icons/aw.png"),
  delieveryCharges: require("@/assets/images/icons/tdce.png"),
  taxGiven: require("@/assets/images/icons/ttg.png"),
  collectedCash: require("@/assets/images/icons/cc.png"),
};

const statusCards = [
  { id: "1", title: "Pending", status: "20", icon: icons.pending },
  { id: "2", title: "Confirmed", status: "30", icon: icons.confirmed },
  { id: "3", title: "Packaging", status: "10", icon: icons.packaging },
  { id: "4", title: "Out for Delivery", status: "5", icon: icons.delivery },
  { id: "5", title: "Delivered", status: "30", icon: icons.deliverd },
  { id: "6", title: "Returned", status: "5", icon: icons.returned },
  { id: "7", title: "Failed to Deliver", status: "0", icon: icons.failed },
  { id: "8", title: "Cancelled", status: "40", icon: icons.cancelled },
];

const quickActions = [
  {
    id: "1",
    title: "Withdrawable Balance",
    ammount: "200$",
    icon: icons.withdraw,
  },
  {
    id: "2",
    title: "Pending Withdraw",
    ammount: "300$",
    icon: icons.peningWithdraw,
  },
  {
    id: "3",
    title: "Already Withdrawn",
    ammount: "400$",
    icon: icons.alreadyWithdrawn,
  },
  {
    id: "4",
    title: "Total Delievery Charge Earned",
    ammount: "100$",
    icon: icons.delieveryCharges,
  },
  { id: "5", title: "Total Tax Given", ammount: "60$", icon: icons.taxGiven },
  {
    id: "6",
    title: "Collected Cash",
    ammount: "500$",
    icon: icons.collectedCash,
  },
];

const gradients = [
  ["#F6F5F6", "#F2F4F5"],
  ["#F6F5F6", "#F2F4F5"],
  ["#F6F5F6", "#F2F4F5"],
  ["#F6F5F6", "#F2F4F5"],
  ["#F6F5F6", "#F2F4F5"],
  ["#F6F5F6", "#F2F4F5"],
  ["#F6F5F6", "#F2F4F5"],
  ["#F6F5F6", "#F2F4F5"],
];

const HomeScreen = () => {
  const [displayName, setDisplayName] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setDisplayName(parsedUser?.name || parsedUser?.username || "Vendor");
      } else setDisplayName("Vendor");
    };
    fetchUser();
  }, []);

  const toggleMenu = () => setMenuVisible((prev) => !prev);

  const handleMenuSelect = (screen) => {
    setMenuVisible(false);
    alert(`Navigate to ${screen}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Hamburger */}
      <View style={styles.header}>
        <Pressable onPress={toggleMenu} style={styles.hamburger}>
          <Ionicons name="menu" size={20} color="#fff" />
        </Pressable>
        <HomeHeader title="Dashboard" />
      </View>

      {/* Vertical Menu Overlay */}
      {menuVisible && (
        <Pressable
          style={styles.menuOverlay}
          onPress={() => setMenuVisible(false)} // click outside closes menu
        >
          <View style={styles.menuContainer}>
            <VerticalMenu
              onSelect={(screen) => {
                handleMenuSelect(screen);
              }}
            />
          </View>
        </Pressable>
      )}

      {/* Main Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: "30%" }}
      >
        <Text style={styles.greeting}>Hello, {displayName}</Text>
        <Text>
          Track and analyze your business performance with powerful insights and
          statistics.
        </Text>

        {/* Order Status */}
        <Text style={styles.sectionTitle}>Order Status</Text>
        <FlatList
          data={statusCards}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={({ item, index }) => (
            <Pressable
              onPress={() => {
                if (item.title === "Pending")
                  router.navigate("/(tabs)/pendingOrder");
                else if (item.title === "Confirmed")
                  router.navigate("/(tabs)/confirmedOrder");
                else if (item.title === "Packaging")
                  router.navigate("/(tabs)/packagingOrder");
                else if (item.title === "Out for Delivery")
                  router.navigate("/(tabs)/deliveryOrder");
                else if (item.title === "Delivered")
                  router.navigate("/(tabs)/deliveredOrder");
                else if (item.title === "Returned")
                  router.navigate("/(tabs)/returnedOrder");
                else if (item.title === "Failed to Deliver")
                  router.navigate("/(tabs)/failedOrder");
                else if (item.title === "Cancelled")
                  router.navigate("/cancelledOrder");
                else alert(`No screen set for ${item.title}`);
              }}
              activeOpacity={0.8}
              style={{ flex: 1 }}
            >
              <LinearGradient
                colors={gradients[index % gradients.length]}
                style={styles.statusCard}
              >
                <Image
                  source={item.icon}
                  style={{
                    width: 30,
                    height: 30,
                    marginBottom: 6,
                    resizeMode: "contain",
                  }}
                />
                <Text style={styles.statusText}>{item.title}</Text>
              </LinearGradient>
            </Pressable>
          )}
          columnWrapperStyle={{
            justifyContent: "space-between",
            marginBottom: 12,
          }}
          scrollEnabled={false}
        />

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <FlatList
          data={quickActions}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={({ item, index }) => (
            <LinearGradient
              colors={gradients[index % gradients.length]}
              style={styles.statusCard}
            >
              <Image
                source={item.icon}
                style={{
                  width: 25,
                  height: 25,
                  marginBottom: 6,
                  resizeMode: "contain",
                }}
              />
              <Text style={styles.statusAmmount}>{item.ammount}</Text>
              <Text style={styles.statusText}>{item.title}</Text>
            </LinearGradient>
          )}
          columnWrapperStyle={{
            justifyContent: "space-between",
            marginBottom: 12,
          }}
          scrollEnabled={false}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FA8232",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  hamburger: { marginRight: 5 },
  menuOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0, // cover full width
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)", // semi-transparent overlay
    zIndex: 10,
    flexDirection: "row",
  },

  menuContainer: {
    width: 250, // menu width
    height: "100%",
    backgroundColor: "#FA8232",
    paddingTop: 50,
    paddingHorizontal: 20,
  },

  content: { padding: 20 },
  greeting: { fontSize: 24, fontWeight: "600", marginBottom: 16 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 8,
  },
  statusCard: {
    flex: 1,
    marginHorizontal: 3,
    height: 100,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  statusAmmount: {
    color: "#FA8232",
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },
  statusText: {
    color: "#FA8232",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});
