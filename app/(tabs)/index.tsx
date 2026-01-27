import HomeHeader from "@/components/Header";
import VerticalMenu from "@/components/verticalmenu";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
  { id: "1", title: "Pending", icon: icons.pending },
  { id: "2", title: "Confirmed", icon: icons.confirmed },
  { id: "3", title: "Packaging", icon: icons.packaging },
  { id: "4", title: "Out for Delivery", icon: icons.delivery },
  { id: "5", title: "Delivered", icon: icons.deliverd },
  { id: "6", title: "Returned", icon: icons.returned },
  { id: "7", title: "Failed to Deliver", icon: icons.failed },
  { id: "8", title: "Cancelled", icon: icons.cancelled },
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

const statusEndpoints = {
  Pending: "pending",
  Confirmed: "confirmed",
  Packaging: "packaging",
  "Out for Delivery": "out-of-delivery",
  Delivered: "delivered",
  Returned: "returned",
  "Failed to Deliver": "failed-to-deliver",
  Cancelled: "canceled",
};

const HomeScreen = () => {
  const [displayName, setDisplayName] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const [orderCounts, setOrderCounts] = useState({}); // dynamic counts
  const [earnings, setEarnings] = useState({
    totalEarning: 0,
    withdrawn: 0,
    pendingWithdraw: 0,
    adminCommission: 0,
    deliveryManChargeEarned: 0,
    collectedCash: 0,
    collectedTotalTax: 0,
  });

  // --- Quick Actions dynamically using API values ---
  const quickActions = [
    {
      id: "1",
      title: "Withdrawable Balance",
      ammount: `${earnings.totalEarning - earnings.withdrawn - earnings.pendingWithdraw}$`,
      icon: icons.withdraw,
    },
    {
      id: "2",
      title: "Pending Withdraw",
      ammount: `${earnings.pendingWithdraw}$`,
      icon: icons.peningWithdraw,
    },
    {
      id: "3",
      title: "Already Withdrawn",
      ammount: `${earnings.withdrawn}$`,
      icon: icons.alreadyWithdrawn,
    },
    {
      id: "4",
      title: "Total Commission Given",
      ammount: `${earnings.adminCommission}$`,
      icon: icons.alreadyWithdrawn,
    },
    {
      id: "5",
      title: "Total Delivery Charge Earned",
      ammount: `${earnings.deliveryManChargeEarned}$`,
      icon: icons.delieveryCharges,
    },
    {
      id: "6",
      title: "Total Tax Given",
      ammount: `${earnings.collectedTotalTax}$`,
      icon: icons.taxGiven,
    },
    {
      id: "7",
      title: "Collected Cash",
      ammount: `${earnings.collectedCash}$`,
      icon: icons.collectedCash,
    },
  ];

  // --- Fetch user info ---
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // 1. First try to get from saved profile
        const savedProfile = await AsyncStorage.getItem("userProfile");
        if (savedProfile) {
          const profile = JSON.parse(savedProfile);
          const name =
            profile?.firstName || profile?.lastName
              ? `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim()
              : "Vendor";
          if (name !== "Vendor") {
            setDisplayName(name);
            return;
          }
        }

        // 2. If no saved profile, fetch from API
        const token = await AsyncStorage.getItem("seller_token");
        if (!token) {
          setDisplayName("Vendor");
          return;
        }

        const response = await fetch(
          "https://yemi.store/api/v2/seller/seller-info",
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const name =
            data.f_name || data.l_name
              ? `${data.f_name || ""} ${data.l_name || ""}`.trim()
              : "Vendor";
          setDisplayName(name);

          // Save to AsyncStorage for future use
          const profile = {
            firstName: data.f_name || "",
            lastName: data.l_name || "",
            email: data.email || "",
            phone: data.phone || "",
            profileImage: data.image_full_url?.path || "",
          };
          await AsyncStorage.setItem("userProfile", JSON.stringify(profile));
        } else {
          setDisplayName("Vendor");
        }
      } catch (error) {
        console.log("fetchUser error:", error);
        setDisplayName("Vendor");
      }
    };
    fetchUser();
  }, []);

  // --- Fetch order counts ---
  useEffect(() => {
    const fetchOrderCounts = async () => {
      const counts = {};
      for (const [title, status] of Object.entries(statusEndpoints)) {
        try {
          const response = await fetch(
            `https://yemi.store/api/v2/seller/orders/vendor/${status}?order_status=${status}&seller_id=29&seller_is=seller&page=1`
          );
          const data = await response.json();
          counts[title] = data.total || 0;
        } catch (error) {
          console.error(`Failed to fetch ${title} orders:`, error);
          counts[title] = 0;
        }
      }
      setOrderCounts(counts);
    };
    fetchOrderCounts();
  }, []);

  // --- Fetch earnings ---
  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const token = await AsyncStorage.getItem("seller_token");
        const response = await fetch(
          "https://yemi.store/api/v2/seller/earning-info",
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
              Accept: "application/json",
            },
          }
        );
        const text = await response.text();
        try {
          const json = JSON.parse(text);
          if (json.success && json.data) setEarnings(json.data);
        } catch {
          console.error("Earnings API did not return JSON:", text);
        }
      } catch (error) {
        console.error("Failed to fetch earnings:", error);
      }
    };
    fetchEarnings();
  }, []);

  const toggleMenu = () => setMenuVisible((prev) => !prev);

  const handleMenuSelect = (screen) => {
    setMenuVisible(false);
    alert(`Navigate to ${screen}`);
  };

  const navigateToStatusScreen = (title) => {
    const screens = {
      Pending: "/(tabs)/pendingOrder",
      Confirmed: "/(tabs)/confirmedOrder",
      Packaging: "/(tabs)/packagingOrder",
      "Out for Delivery": "/(tabs)/deliveryOrder",
      Delivered: "/(tabs)/deliveredOrder",
      Returned: "/(tabs)/returnedOrder",
      "Failed to Deliver": "/(tabs)/failedOrder",
      Cancelled: "/cancelledOrder",
    };
    router.navigate(screens[title] || "/");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={toggleMenu} style={styles.hamburger}>
          <Ionicons name="menu" size={20} color="#fff" />
        </Pressable>
        <HomeHeader title="Dashboard" />
      </View>

      {/* Menu Overlay */}
      {menuVisible && (
        <Pressable
          style={styles.menuOverlay}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <VerticalMenu onSelect={handleMenuSelect} />
          </View>
        </Pressable>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: "30%" }}
      >
        <Text style={styles.greeting}>Hello, {displayName}</Text>
        <Text>
          Track and analyze your business performance with powerful insights
          and statistics.
        </Text>

        {/* Order Status */}
        <Text style={styles.sectionTitle}>Order Status</Text>
        <FlatList
          data={statusCards}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={({ item, index }) => (
            <Pressable
              onPress={() => navigateToStatusScreen(item.title)}
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
                <Text style={styles.statusNumber}>
                  {orderCounts[item.title] ?? 0}
                </Text>
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FA8232",
    paddingVertical: 10,
    position: "relative",
  },
  hamburger: { position: "absolute", left: 10, top: 45, padding: 5, zIndex: 20 },
  menuOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 10,
    flexDirection: "row",
  },
  menuContainer: {
    width: 250,
    height: "100%",
    backgroundColor: "#FA8232",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  greeting: { fontSize: 24, fontWeight: "600", marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginTop: 20, marginBottom: 8 },
  statusCard: {
    flex: 1,
    marginHorizontal: 3,
    height: 100,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  statusNumber: {
    color: "#FA8232",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 4,
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