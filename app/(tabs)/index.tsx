import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
} from "react-native";
import { router, Router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import HomeHeader from "@/components/Header";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
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

const recentOrders = [
  { id: "1", customer: "John Doe", amount: "₦20,000", status: "Pending" },
  { id: "2", customer: "Jane Smith", amount: "₦15,000", status: "Delivered" },
  { id: "3", customer: "Mike Johnson", amount: "₦8,000", status: "Shipped" },
];

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
    // icon: "wallet-outline",
    icon: icons.withdraw,
  },
  {
    id: "2",
    title: "Pending Withdraw",
    ammount: "300$",
    // icon: "hourglass-outline",
    icon: icons.peningWithdraw,
  },
  {
    id: "3",
    title: "Already Withdrawn",
    ammount: "400$",
    // icon: "checkmark-circle-outline",
    icon: icons.alreadyWithdrawn,
  },
  {
    id: "4",
    title: "Total Delievery Charge Earned",
    ammount: "100$",
    // icon: "cash-outline",
    icon: icons.delieveryCharges,
  },
  {
    id: "5",
    title: "Total Tax Given",
    ammount: "60$",
    // icon: "receipt-outline",
    icon: icons.taxGiven,
  },
  {
    id: "6",
    title: "Collected Cash",
    ammount: "500$",
    // icon: "pricetag-outline",
    icon: icons.collectedCash,
  },
  // { id: "7", title: "View Analytics" },
  // { id: "8", title: "View Analytics" },
];

// Array of different orange gradients
// const gradients = [
//   ["#FFA500", "#FF8C00"],
//   ["#FF9A3C", "#FF7F50"],
//   ["#FFB347", "#FF8C00"],
//   ["#FF9966", "#FF6600"],
//   ["#FFA64D", "#FF8000"],
//   ["#FFAD5C", "#FF7518"],
//   ["#FFAA33", "#FF8800"],
//   ["#FF8C42", "#FF5722"],
// ];
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
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        console.log("📦 Stored User Data:", userData);
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setDisplayName(
            parsedUser?.name ||
              parsedUser?.username ||
              parsedUser?.email ||
              "Vendor"
          );
        } else {
          setDisplayName("Vendor");
        }
      } catch (err) {
        console.error("⚠️ Error loading user:", err);
        setDisplayName("Vendor");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <HomeHeader title="Dashboard" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.content}
        contentContainerStyle={{ paddingBottom: "30%" }}
      >
        <Text style={styles.greeting}>Hello, {displayName}</Text>
        <Text>Track and analyze your business performance with powerful insights and statistics..</Text>

        {/* Order Status Cards */}
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
                {/* <Text style={styles.statusAmmount}>{item.status}</Text> */}
              </LinearGradient>
            </Pressable>
          )}
          columnWrapperStyle={{
            justifyContent: "space-between",
            marginBottom: 12,
          }}
          scrollEnabled={false}
        />

        {/* Recent Orders */}
        {/* <Text style={styles.sectionTitle}>Recent Orders</Text>
        <FlatList
          data={recentOrders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.orderCard}>
              <Text style={styles.orderCustomer}>{item.customer}</Text>
              <Text style={styles.orderAmount}>{item.amount}</Text>
              <Text style={styles.orderStatus}>{item.status}</Text>
            </View>
          )}
        /> */}

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
              {/* <Ionicons
                name={item.icon}
                size={26}
                color="#FA8232"
                style={{ marginBottom: 6 }}
              /> */}
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
    // borderWidth:1,
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
  orderCard: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  orderCustomer: { fontSize: 16, fontWeight: "500" },
  orderAmount: { fontSize: 14, color: "#333" },
  orderStatus: { fontSize: 14, color: "#FA8232", marginTop: 4 },
});
