import HomeHeader from "@/components/Header";
import VerticalMenu from "@/components/verticalmenu";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

  // ✅ NEW: Withdraw modal state
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawNote, setWithdrawNote] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Calculate withdrawable balance
  const withdrawableBalance = earnings.totalEarning - earnings.withdrawn - earnings.pendingWithdraw;

  // --- Quick Actions dynamically using API values ---
  const quickActions = [
    {
      id: "1",
      title: "Withdrawable Balance",
      ammount: `${withdrawableBalance}$`,
      icon: icons.withdraw,
      onPress: () => setWithdrawModalVisible(true), // ✅ Open withdraw modal
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

  useEffect(() => {
    fetchEarnings();
  }, []);

  // ✅ NEW: Handle withdraw balance
  const handleWithdraw = async () => {
    // Validation
    const amount = parseFloat(withdrawAmount);

    if (!withdrawAmount || isNaN(amount)) {
      Alert.alert("Invalid Amount", "Please enter a valid amount to withdraw");
      return;
    }

    if (amount <= 0) {
      Alert.alert("Invalid Amount", "Withdrawal amount must be greater than 0");
      return;
    }

    if (amount > withdrawableBalance) {
      Alert.alert(
        "Insufficient Balance",
        `You can only withdraw up to $${withdrawableBalance.toFixed(2)}`
      );
      return;
    }

    if (!withdrawNote.trim()) {
      Alert.alert("Note Required", "Please add a transaction note");
      return;
    }

    try {
      setIsWithdrawing(true);

      const token = await AsyncStorage.getItem("seller_token");
      if (!token) {
        Alert.alert("Error", "Authentication token not found. Please login again.");
        return;
      }

      console.log("🔄 Initiating withdrawal...");
      console.log("Amount:", amount);
      console.log("Note:", withdrawNote.trim());

      const response = await fetch(
        `https://yemi.store/api/v2/seller/balance-withdraw?amount=${amount}&transaction_note=${encodeURIComponent(withdrawNote.trim())}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      const responseText = await response.text();
      console.log("📥 Withdraw Response:", responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch {
        result = { message: responseText };
      }

      if (response.ok || result.success) {
        Alert.alert(
          "Success",
          result.message || "Withdrawal request submitted successfully!",
          [
            {
              text: "OK",
              onPress: () => {
                setWithdrawModalVisible(false);
                setWithdrawAmount("");
                setWithdrawNote("");
                // Refresh earnings
                fetchEarnings();
              },
            },
          ]
        );
      } else {
        Alert.alert(
          "Withdrawal Failed",
          result.message || "Failed to process withdrawal request"
        );
      }
    } catch (error) {
      console.error("❌ Withdrawal error:", error);
      Alert.alert("Error", "An error occurred while processing your withdrawal");
    } finally {
      setIsWithdrawing(false);
    }
  };

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

      {/* ✅ NEW: Withdraw Balance Modal */}
      <Modal
        visible={withdrawModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setWithdrawModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setWithdrawModalVisible(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Withdraw Balance</Text>
              <Pressable onPress={() => setWithdrawModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </Pressable>
            </View>

            <View style={styles.balanceInfo}>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.balanceAmount}>${withdrawableBalance.toFixed(2)}</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Withdrawal Amount ($)</Text>
              <TextInput
                style={styles.input}
                value={withdrawAmount}
                onChangeText={setWithdrawAmount}
                placeholder="Enter amount"
                keyboardType="decimal-pad"
                editable={!isWithdrawing}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Transaction Note</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={withdrawNote}
                onChangeText={setWithdrawNote}
                placeholder="Add a note for this transaction"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                editable={!isWithdrawing}
              />
            </View>

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setWithdrawModalVisible(false)}
                disabled={isWithdrawing}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[
                  styles.modalButton,
                  styles.withdrawButton,
                  isWithdrawing && styles.withdrawButtonDisabled,
                ]}
                onPress={handleWithdraw}
                disabled={isWithdrawing}
              >
                <Text style={styles.withdrawButtonText}>
                  {isWithdrawing ? "Processing..." : "Withdraw"}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

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
            <Pressable
              onPress={item.onPress || undefined}
              style={{ flex: 1 }}
            >
              <LinearGradient
                colors={gradients[index % gradients.length]}
                style={styles.statusCard}
              >
                <Image
                  source={item.icon}
                  style={{
                    width: 30, // 🔥 same as order status
                    height: 30,
                    marginBottom: 6,
                    resizeMode: "contain",
                  }}
                />
                <Text style={styles.statusText}>{item.title}</Text>
                <Text style={styles.statusNumber}>{item.ammount}</Text>
              </LinearGradient>
            </Pressable>
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
  // ✅ NEW: Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  balanceInfo: {
    backgroundColor: "#F6F5F6",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FA8232",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F6F5F6",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#F0F0F0",
  },
  cancelButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
  withdrawButton: {
    backgroundColor: "#FA8232",
  },
  withdrawButtonDisabled: {
    backgroundColor: "#FFC09F",
  },
  withdrawButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});