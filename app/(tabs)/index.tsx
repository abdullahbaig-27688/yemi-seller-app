import HomeHeader from "@/components/Header";
import VerticalMenu from "@/components/verticalmenu";
import { useAuth } from "@/src/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 52) / 2;

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
  { id: "1", title: "Pending", icon: icons.pending, color: "#FFF4E6" },
  { id: "2", title: "Confirmed", icon: icons.confirmed, color: "#E8F5E9" },
  { id: "3", title: "Packaging", icon: icons.packaging, color: "#F3E5F5" },
  { id: "4", title: "Out for Delivery", icon: icons.delivery, color: "#E3F2FD" },
  { id: "5", title: "Delivered", icon: icons.deliverd, color: "#E8F5E9" },
  { id: "6", title: "Returned", icon: icons.returned, color: "#FFF9C4" },
  { id: "7", title: "Failed to Deliver", icon: icons.failed, color: "#FFEBEE" },
  { id: "8", title: "Cancelled", icon: icons.cancelled, color: "#ECEFF1" },
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

/* ---------------- ANIMATED STATUS CARD ---------------- */
const AnimatedStatusCard = ({ item, index, onPress, count }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        delay: index * 60,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    setPressed(true);
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    setPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={{
        flex: 1,
        transform: [{ scale: scaleAnim }],
        opacity: fadeAnim,
        marginHorizontal: 6,
        marginBottom: 12,
      }}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <LinearGradient
          colors={[item.color, "#FFFFFF"]}
          style={styles.statusCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={[styles.iconCircle, { backgroundColor: item.color }]}>
            <Image source={item.icon} style={styles.cardIcon} />
          </View>
          <Text style={styles.statusText} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{count}</Text>
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

/* ---------------- ANIMATED FINANCIAL CARD ---------------- */
const AnimatedFinancialCard = ({ item, index, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        delay: index * 60,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 60,
        useNativeDriver: true,
      }),
    ]).start();

    if (item.highlight) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={{
        flex: 1,
        transform: [{ scale: item.highlight ? pulseAnim : scaleAnim }],
        opacity: fadeAnim,
        marginHorizontal: 6,
        marginBottom: 12,
      }}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={!onPress}
      >
        <LinearGradient
          colors={
            item.highlight
              ? ["#FA8232", "#FF6B35"]
              : ["#FFFFFF", "#F8F9FA"]
          }
          style={[
            styles.financialCard,
            item.highlight && styles.highlightCard,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {item.highlight && (
            <View style={styles.primaryBadge}>
              <Ionicons name="star" size={10} color="#FFF" />
              <Text style={styles.primaryBadgeText}>PRIMARY</Text>
            </View>
          )}
          <View style={[styles.finIconCircle, item.highlight && styles.highlightIconCircle]}>
            <Image source={item.icon} style={styles.finCardIcon} />
          </View>
          <Text
            style={[styles.finCardTitle, item.highlight && styles.highlightText]}
            numberOfLines={2}
          >
            {item.title}
          </Text>
          <Text
            style={[styles.finCardAmount, item.highlight && styles.highlightAmountText]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {item.ammount}
          </Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

const HomeScreen = () => {
  const { token, userProfile } = useAuth();


  // const [displayName, setDisplayName] = useState("");


  const [menuVisible, setMenuVisible] = useState(false);
  const [orderCounts, setOrderCounts] = useState({});
  const [earnings, setEarnings] = useState({
    totalEarning: 0,
    withdrawn: 0,
    pendingWithdraw: 0,
    adminCommission: 0,
    deliveryManChargeEarned: 0,
    collectedCash: 0,
    collectedTotalTax: 0,
  });

  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawNote, setWithdrawNote] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const menuSlideAnim = useRef(new Animated.Value(-260)).current;
  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const greetingSlideAnim = useRef(new Animated.Value(-50)).current;

  const withdrawableBalance = earnings.totalEarning || 0;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(greetingSlideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (menuVisible) {
      Animated.timing(menuSlideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(menuSlideAnim, {
        toValue: -260,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [menuVisible]);

  const quickActions = [
    {
      id: "1",
      title: "Withdrawable Balance",
      ammount: `$${withdrawableBalance.toFixed(2)}`,
      icon: icons.withdraw,
      onPress: () => {
        setWithdrawModalVisible(true);
      },
      highlight: true,
    },
    {
      id: "2",
      title: "Pending Withdraw",
      ammount: `$${(earnings.pendingWithdraw || 0).toFixed(2)}`,
      icon: icons.peningWithdraw,
    },
    {
      id: "3",
      title: "Already Withdrawn",
      ammount: `$${(earnings.withdrawn || 0).toFixed(2)}`,
      icon: icons.alreadyWithdrawn,
    },
    {
      id: "4",
      title: "Total Commission Given",
      ammount: `$${(earnings.adminCommission || 0).toFixed(2)}`,
      icon: icons.alreadyWithdrawn,
    },
    {
      id: "5",
      title: "Total Delivery Charge Earned",
      ammount: `$${(earnings.deliveryManChargeEarned || 0).toFixed(2)}`,
      icon: icons.delieveryCharges,
    },
    {
      id: "6",
      title: "Total Tax Given",
      ammount: `$${(earnings.collectedTotalTax || 0).toFixed(2)}`,
      icon: icons.taxGiven,
    },
    {
      id: "7",
      title: "Collected Cash",
      ammount: `$${(earnings.collectedCash || 0).toFixed(2)}`,
      icon: icons.collectedCash,
    },
  ];

  // --- Fetch user info ---
  // useEffect(() => {
  //   const fetchUser = async () => {
  //     try {
  //       const savedProfile = await AsyncStorage.getItem("userProfile");
  //       if (savedProfile) {
  //         const profile = JSON.parse(savedProfile);
  //         const name =
  //           profile?.firstName || profile?.lastName
  //             ? `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim()
  //             : "Vendor";
  //         if (name !== "Vendor") {
  //           setDisplayName(name);
  //           return;
  //         }
  //       }

  //       // const token = await AsyncStorage.getItem("seller_token");
  //       if (!token) {
  //         setDisplayName("Vendor");
  //         return;
  //       }

  //       const response = await fetch(
  //         "https://yemi.store/api/v2/seller/seller-info",
  //         {
  //           headers: {
  //             Accept: "application/json",
  //             Authorization: `Bearer ${token}`,
  //           },
  //         }
  //       );

  //       if (response.ok) {
  //         const data = await response.json();
  //         const name =
  //           data.f_name || data.l_name
  //             ? `${data.f_name || ""} ${data.l_name || ""}`.trim()
  //             : "Vendor";
  //         setDisplayName(name);

  //         const profile = {
  //           firstName: data.f_name || "",
  //           lastName: data.l_name || "",
  //           email: data.email || "",
  //           phone: data.phone || "",
  //           profileImage: data.image_full_url?.path || "",
  //         };
  //         await AsyncStorage.setItem("userProfile", JSON.stringify(profile));
  //       } else {
  //         setDisplayName("Vendor");
  //       }
  //     } catch (error) {
  //       console.log("fetchUser error:", error);
  //       setDisplayName("Vendor");
  //     }
  //   };
  //   fetchUser();
  // }, []);

  const displayName = React.useMemo(() => {
    if (!userProfile) return "Vendor";

    const name = [userProfile.firstName, userProfile.lastName]
      .filter(Boolean)
      .join(" ");

    return name || "Vendor";
  }, [userProfile]);


  // --- Fetch order counts ---
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
        console.log(`Failed to fetch ${title} orders:`, error);
        counts[title] = 0;
      }
    }
    setOrderCounts(counts);
  };

  useEffect(() => {
    fetchOrderCounts();
  }, []);

  // --- Fetch earnings ---
  const fetchEarnings = async () => {
    try {
      // const token = await AsyncStorage.getItem("seller_token");
      const response = await fetch(
        "https://yemi.store/api/v2/seller/earning-info",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );


      const text = await response.text();
      console.log("📥 Raw earnings response:", text);

      try {
        const json = JSON.parse(text);

        if (json.success && json.data) {
          const earningsData = {
            totalEarning: parseFloat(json.data.totalEarning || 0),
            withdrawn: parseFloat(json.data.withdrawn || 0),
            pendingWithdraw: parseFloat(json.data.pendingWithdraw || 0),
            adminCommission: parseFloat(json.data.adminCommission || 0),
            deliveryManChargeEarned: parseFloat(json.data.deliveryManChargeEarned || 0),
            collectedCash: parseFloat(json.data.collectedCash || 0),
            collectedTotalTax: parseFloat(json.data.collectedTotalTax || 0),
          };

          console.log("✅ Converted earnings data:", earningsData);
          setEarnings(earningsData);
        }
      } catch (parseError) {
        console.log("Earnings API did not return JSON:", text);
      }
    } catch (error) {
      console.log("Failed to fetch earnings:", error);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchEarnings(), fetchOrderCounts()]);
    setRefreshing(false);
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);

    if (!withdrawAmount || isNaN(amount)) {
      Alert.alert("Invalid Amount", "Please enter a valid amount to withdraw");
      return;
    }

    if (amount <= 0) {
      Alert.alert("Invalid Amount", "Withdrawal amount must be greater than 0");
      return;
    }

    const currentWithdrawable = earnings.totalEarning || 0;

    if (amount > currentWithdrawable) {
      Alert.alert(
        "Insufficient Balance",
        `You can only withdraw up to $${currentWithdrawable.toFixed(2)}.\n\n` +
        `Current Status:\n` +
        `• Current Balance: $${(earnings.totalEarning || 0).toFixed(2)}\n` +
        `• Pending Withdrawals: $${(earnings.pendingWithdraw || 0).toFixed(2)}\n` +
        `• Available to Withdraw: $${currentWithdrawable.toFixed(2)}`
      );
      return;
    }

    if (!withdrawNote.trim()) {
      Alert.alert("Note Required", "Please add a transaction note");
      return;
    }

    try {
      setIsWithdrawing(true);

      // const token = await AsyncStorage.getItem("seller_token");
      if (!token) {
        Alert.alert("Error", "Authentication token not found. Please login again.");
        return;
      }

      console.log("=".repeat(60));
      console.log("🔄 Initiating withdrawal...");
      console.log("Amount:", amount);
      console.log("Note:", withdrawNote.trim());
      console.log("Current Withdrawable:", currentWithdrawable);
      console.log("=".repeat(60));

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

      if (response.ok || result.success || responseText.includes("successfully")) {
        setEarnings(prev => ({
          ...prev,
          pendingWithdraw: parseFloat(prev.pendingWithdraw || 0) + amount
        }));

        Alert.alert(
          "Success",
          result.message || "Withdrawal request submitted successfully!",
          [
            {
              text: "OK",
              onPress: async () => {
                setWithdrawModalVisible(false);
                setWithdrawAmount("");
                setWithdrawNote("");
                await fetchEarnings();
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
      console.log("❌ Withdrawal error:", error);
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
      <Animated.View style={{ opacity: headerFadeAnim }}>
        <LinearGradient
          colors={["#FA8232", "#FF6B35"]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Pressable
            onPress={toggleMenu}
            style={styles.hamburger}
            android_ripple={{ color: "#FFFFFF40", radius: 20 }}
          >
            <Ionicons name="menu" size={26} color="#fff" />
          </Pressable>
          <HomeHeader title="Dashboard" />
        </LinearGradient>
      </Animated.View>

      {/* Menu Overlay */}
      {menuVisible && (
        <Pressable
          style={styles.menuOverlay}
          onPress={() => setMenuVisible(false)}
        >
          <Animated.View
            style={[
              styles.menuContainer,
              { transform: [{ translateX: menuSlideAnim }] },
            ]}
          >
            <VerticalMenu onSelect={handleMenuSelect} />
          </Animated.View>
        </Pressable>
      )}

      {/* Withdraw Balance Modal */}
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
            <LinearGradient
              colors={["#FFFFFF", "#F8F9FA"]}
              style={styles.modalGradient}
            >
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleContainer}>
                  <Ionicons name="wallet" size={24} color="#FA8232" />
                  <Text style={styles.modalTitle}>Withdraw Balance</Text>
                </View>
                <Pressable
                  onPress={() => setWithdrawModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close-circle" size={28} color="#666" />
                </Pressable>
              </View>

              <View style={styles.balanceBreakdown}>
                <LinearGradient
                  colors={["#FA8232", "#FF6B35"]}
                  style={styles.currentBalanceCard}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.currentBalanceLabel}>Current Balance</Text>
                  <Text style={styles.currentBalanceAmount}>
                    ${(earnings.totalEarning || 0).toFixed(2)}
                  </Text>
                </LinearGradient>

                <View style={styles.breakdownGrid}>
                  <View style={styles.breakdownItem}>
                    <Ionicons name="hourglass-outline" size={18} color="#FA8232" />
                    <Text style={styles.breakdownLabel}>Pending</Text>
                    <Text style={styles.breakdownValue}>
                      ${(earnings.pendingWithdraw || 0).toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.breakdownItem}>
                    <Ionicons name="checkmark-circle-outline" size={18} color="#4CAF50" />
                    <Text style={styles.breakdownLabel}>Withdrawn</Text>
                    <Text style={styles.breakdownValue}>
                      ${(earnings.withdrawn || 0).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  <Ionicons name="cash-outline" size={16} color="#333" /> Withdrawal Amount
                </Text>
                <TextInput
                  style={styles.input}
                  value={withdrawAmount}
                  onChangeText={setWithdrawAmount}
                  placeholder={`Max: $${withdrawableBalance.toFixed(2)}`}
                  placeholderTextColor="#999"
                  keyboardType="decimal-pad"
                  editable={!isWithdrawing}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  <Ionicons name="document-text-outline" size={16} color="#333" /> Transaction Note
                </Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={withdrawNote}
                  onChangeText={setWithdrawNote}
                  placeholder="Add a note for this transaction"
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  editable={!isWithdrawing}
                />
              </View>

              <View style={styles.modalButtons}>
                <Pressable
                  style={styles.cancelButton}
                  onPress={() => {
                    setWithdrawModalVisible(false);
                    setWithdrawAmount("");
                    setWithdrawNote("");
                  }}
                  disabled={isWithdrawing}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.withdrawButton,
                    isWithdrawing && styles.withdrawButtonDisabled,
                  ]}
                  onPress={handleWithdraw}
                  disabled={isWithdrawing}
                >
                  <LinearGradient
                    colors={isWithdrawing ? ["#FFC09F", "#FFB088"] : ["#FA8232", "#FF6B35"]}
                    style={styles.withdrawButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {isWithdrawing && (
                      <Ionicons name="hourglass-outline" size={18} color="#FFF" />
                    )}
                    <Text style={styles.withdrawButtonText}>
                      {isWithdrawing ? "Processing..." : "Withdraw Now"}
                    </Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </LinearGradient>
          </Pressable>
        </Pressable>
      </Modal>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FA8232"]}
            tintColor="#FA8232"
          />
        }
      >
        {/* Greeting Section */}
        <Animated.View
          style={[
            styles.greetingContainer,
            { transform: [{ translateY: greetingSlideAnim }] },
          ]}
        >
          <Text style={styles.greeting}>
            Hello, <Text style={styles.greetingName}>{displayName}</Text> 👋
          </Text>
          <Text style={styles.subtitle}>
            Track and analyze your business performance with powerful insights
          </Text>
        </Animated.View>

        {/* Order Status */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cube-outline" size={22} color="#FA8232" />
            <Text style={styles.sectionTitle}>Order Status</Text>
          </View>
          <FlatList
            data={statusCards}
            keyExtractor={(item) => item.id}
            numColumns={2}
            renderItem={({ item, index }) => (
              <AnimatedStatusCard
                item={item}
                index={index}
                onPress={() => navigateToStatusScreen(item.title)}
                count={orderCounts[item.title] ?? 0}
              />
            )}
            scrollEnabled={false}
          />
        </View>

        {/* Financial Overview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="wallet-outline" size={22} color="#FA8232" />
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>
          <FlatList
            data={quickActions}
            keyExtractor={(item) => item.id}
            numColumns={2}
            renderItem={({ item, index }) => (
              <AnimatedFinancialCard
                item={item}
                index={index}
                onPress={item.onPress}
              />
            )}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    paddingVertical: 16,
    paddingTop: Platform.OS === "ios" ? 0 : 16,
    alignItems: "center",
    elevation: 8,
    shadowColor: "#FA8232",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  hamburger: {
    position: "absolute",
    left: 16,
    top: Platform.OS === "ios" ? 10 : 45,
    padding: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    zIndex: 20,
  },
  menuOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    zIndex: 999,
  },
  menuContainer: {
    width: 260,
    height: "100%",
    backgroundColor: "#FA8232",
    paddingTop: 60,
    paddingHorizontal: 20,
    elevation: 16,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  greetingContainer: {
    marginBottom: 28,
    paddingTop: 8,
  },
  greeting: {
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 8,
    color: "#1A1A1A",
    letterSpacing: -0.5,
  },
  greetingName: {
    color: "#FA8232",
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    letterSpacing: -0.3,
  },

  /* Status Cards */
  statusCard: {
    height: 135,
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardIcon: {
    width: 32,
    height: 32,
    resizeMode: "contain",
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 8,
  },
  countBadge: {
    backgroundColor: "#FA8232",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 50,
    alignItems: "center",
  },
  countText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800",
  },

  /* Financial Cards */
  financialCard: {
    height: 145,
    borderRadius: 20,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  highlightCard: {
    borderWidth: 3,
    borderColor: "#FFD700",
    elevation: 10,
    shadowOpacity: 0.3,
  },
  primaryBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  primaryBadgeText: {
    color: "#FFF",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  finIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(250, 130, 50, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  highlightIconCircle: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  finCardIcon: {
    width: 28,
    height: 28,
    resizeMode: "contain",
  },
  finCardTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    lineHeight: 16,
    marginBottom: 8,
    height: 32,
  },
  highlightText: {
    color: "#FFF",
  },
  finCardAmount: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FA8232",
    letterSpacing: -0.5,
  },
  highlightAmountText: {
    fontSize: 22,
    color: "#FFF",
  },

  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalGradient: {
    padding: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1A1A1A",
    letterSpacing: -0.5,
  },
  closeButton: {
    padding: 4,
  },
  balanceBreakdown: {
    marginBottom: 24,
  },
  currentBalanceCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#FA8232",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  currentBalanceLabel: {
    fontSize: 14,
    color: "#FFF",
    opacity: 0.9,
    marginBottom: 8,
    fontWeight: "600",
  },
  currentBalanceAmount: {
    fontSize: 36,
    fontWeight: "900",
    color: "#FFF",
    letterSpacing: -1,
  },
  breakdownGrid: {
    flexDirection: "row",
    gap: 12,
  },
  breakdownItem: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  breakdownLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 6,
    marginBottom: 4,
    fontWeight: "500",
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  input: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 2,
    borderColor: "#E8E8E8",
    color: "#1A1A1A",
  },
  textArea: {
    height: 90,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8E8E8",
  },
  cancelButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "700",
  },
  withdrawButton: {
    flex: 1.5,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#FA8232",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  withdrawButtonGradient: {
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  withdrawButtonDisabled: {
    opacity: 0.6,
  },
  withdrawButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});