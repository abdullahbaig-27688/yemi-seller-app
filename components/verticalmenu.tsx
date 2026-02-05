import { useAuth } from "@/src/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface VerticalMenuProps {
  onSelect?: (menuItem: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  isLogout?: boolean;
}

/* ---------------- ANIMATED MENU ITEM COMPONENT ---------------- */
const AnimatedMenuItem: React.FC<{
  item: MenuItem;
  index: number;
  onPress: () => void;
}> = ({ item, index, onPress }) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
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
        opacity: fadeAnim,
        transform: [{ translateX: slideAnim }, { scale: scaleAnim }],
      }}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.menuItemContainer}
      >
        <View
          style={[
            styles.menuItem,
            item.isLogout && styles.logoutItem,
          ]}
        >
          <View style={[styles.iconCircle, item.isLogout && styles.logoutIconCircle]}>
            <Ionicons
              name={item.icon}
              size={22}
              color={item.isLogout ? "#FF4757" : "#FA8232"}
            />
          </View>
          <Text style={[styles.menuText, item.isLogout && styles.logoutText]}>
            {item.label}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={item.isLogout ? "#FF4757" : "rgba(255, 255, 255, 0.6)"}
          />
        </View>
      </Pressable>
    </Animated.View>
  );
};

const VerticalMenu: React.FC<VerticalMenuProps> = ({ onSelect }) => {
  const { userProfile, logout } = useAuth();
  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const profileScaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(profileScaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        delay: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const menuItems: MenuItem[] = [
    {
      id: "1",
      label: "Inbox",
      icon: "mail-outline",
      route: "/(tabs)/inboxList",
    },
    {
      id: "2",
      label: "Shipping Methods",
      icon: "cube-outline",
      route: "/(tabs)/shippingMethod",
    },
    {
      id: "3",
      label: "Withdraws",
      icon: "wallet-outline",
      route: "/(tabs)/withdraw",
    },
    {
      id: "4",
      label: "Bank Information",
      icon: "card-outline",
      route: "/(tabs)/bankInformation",
    },
    {
      id: "5",
      label: "Shop Settings",
      icon: "storefront-outline",
      route: "/(tabs)/shopSetting",
    },
    {
      id: "6",
      label: "Other Setups",
      icon: "settings-outline",
      route: "/(tabs)/otherSetup",
    },
  ];

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
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

  const handleMenuPress = (item: MenuItem) => {
    if (item.isLogout) {
      handleLogout();
    } else {
      router.push(item.route as any);
      onSelect?.(item.label);
    }
  };

  const displayName = userProfile
    ? `${userProfile.firstName || ""} ${userProfile.lastName || ""}`.trim() || "Vendor"
    : "Vendor";

  return (
    <LinearGradient
      colors={["#FA8232", "#FF6B35"]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Section */}
        <Animated.View
          style={[
            styles.profileSection,
            {
              opacity: headerFadeAnim,
              transform: [{ scale: profileScaleAnim }],
            },
          ]}
        >
          <Pressable
            onPress={() => {
              router.push("/(tabs)/profile");
              onSelect?.("Profile");
            }}
            style={styles.profileButton}
          >
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={["#FFF", "#F0F0F0"]}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>
                  {displayName.charAt(0).toUpperCase()}
                </Text>
              </LinearGradient>
              <View style={styles.onlineBadge} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName} numberOfLines={1}>
                {displayName}
              </Text>
              <View style={styles.viewProfileContainer}>
                <Text style={styles.viewProfile}>View Profile</Text>
                <Ionicons name="arrow-forward" size={14} color="rgba(255, 255, 255, 0.8)" />
              </View>
            </View>
          </Pressable>
        </Animated.View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Menu Section Header */}
        <Animated.View style={{ opacity: headerFadeAnim }}>
          <View style={styles.sectionHeader}>
            <Ionicons name="apps" size={18} color="#FFF" />
            <Text style={styles.sectionTitle}>Quick Access</Text>
          </View>
        </Animated.View>

        {/* Menu Items */}
        <View style={styles.menuList}>
          {menuItems.map((item, index) => (
            <AnimatedMenuItem
              key={item.id}
              item={item}
              index={index}
              onPress={() => handleMenuPress(item)}
            />
          ))}

          {/* Logout Item */}
          <AnimatedMenuItem
            item={{
              id: "logout",
              label: "Logout",
              icon: "log-out-outline",
              route: "",
              isLogout: true,
            }}
            index={menuItems.length}
            onPress={handleLogout}
          />
        </View>

        {/* Footer */}
        <Animated.View style={[styles.footer, { opacity: headerFadeAnim }]}>
          <View style={styles.footerContent}>
            <Ionicons name="shield-checkmark" size={16} color="rgba(255, 255, 255, 0.6)" />
            <Text style={styles.footerText}>Secured by Yemi Store</Text>
          </View>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    height: "100%",
    // width: 280,
  },
  scrollContent: {
    paddingTop: 10,
    paddingHorizontal: 10,
    paddingBottom: 40,
  },

  /* Profile Section */
  profileSection: {
    marginBottom: 20,
  },
  profileButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FA8232",
  },
  onlineBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  viewProfileContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewProfile: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },

  /* Divider */
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginVertical: 20,
  },

  /* Section Header */
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFF",
    textTransform: "uppercase",
    letterSpacing: 1,
    opacity: 0.9,
  },

  /* Menu Items */
  menuList: {
    gap: 4,
  },
  menuItemContainer: {
    marginBottom: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  logoutItem: {
    // backgroundColor: "rgba(255, 71, 87, 0.15)",
    borderColor: "rgba(255, 71, 87, 0.3)",
    marginTop: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutIconCircle: {
    backgroundColor: "#FFF",
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
    letterSpacing: -0.2,
  },
  logoutText: {
    color: "#FF4757",
    fontWeight: "700",
  },

  /* Footer */
  footer: {
    marginVertical: 28,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
  },
  footerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  footerText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "500",
  },
  versionText: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.5)",
    fontWeight: "400",
  },
});

export default VerticalMenu;