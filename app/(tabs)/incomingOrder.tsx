import Heading from "@/components/Header";
import { useAuth } from "@/src/context/AuthContext";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const statusColors: Record<string, string> = {
  pending: "#f1c40f",
  confirmed: "#3498db",
  completed: "#2ecc71",
  canceled: "#e74c3c",
};

const IncomingOrder = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const filters = ["all", "pending", "confirmed", "completed", "canceled"];

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      if (!token) {
        Alert.alert("Error", "No auth token found. Please login again.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        "https://yemi.store/api/v2/seller/orders/list",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();
      console.log("Fetched Orders:", data);

      if (data && data.data) {
        setOrders(data.data);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.log("API Fetch Error:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter logic
  const filteredOrders = orders.filter((order) => {
    const search =
      order.customer?.f_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      order.id?.toString().includes(searchQuery);

    if (filter === "all") return search;
    return search && order.order_status === filter;
  });

  return (
    <SafeAreaView style={styles.container}>
      <Heading
        title="Incoming Orders"
        leftIcon="arrow-back"
        onLeftPress={() => router.back()}
      />

      {/* Search */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search by buyer or order ID..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor="#888"
      />

      {/* Filters */}
      <View style={styles.filterRow}>
        {filters.map((status) => (
          <Pressable
            key={status}
            style={[
              styles.filterButton,
              filter === status && styles.activeFilterButton,
            ]}
            onPress={() => setFilter(status)}
          >
            <Text
              style={[
                styles.filterText,
                filter === status && styles.activeFilterText,
              ]}
            >
              {status}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Loading */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#FA8232"
          style={{ marginTop: 40 }}
        />
      ) : filteredOrders.length === 0 ? (
        <Text style={styles.emptyText}>No orders found.</Text>
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={filteredOrders}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image
                source={{
                  uri:
                    item.customer?.image ||
                    "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                }}
                style={styles.avatar}
              />

              <View style={styles.cardContent}>
                <Text style={styles.buyerName}>
                  {item.customer?.f_name} {item.customer?.l_name}
                </Text>
                <Text style={styles.orderId}>Order #{item.id}</Text>
                <Text style={styles.orderAmount}>${item.order_amount}</Text>
                <Text style={styles.orderDate}>{item.created_at}</Text>
              </View>

              <View style={styles.cardActions}>
                <Text
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        statusColors[item.order_status] || "#777",
                    },
                  ]}
                >
                  {item.order_status}
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

export default IncomingOrder;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  searchInput: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 10,
    marginBottom: 12,
    fontSize: 16,
    color: "#000",
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  filterButton: {
    backgroundColor: "#eee",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  activeFilterButton: { backgroundColor: "#FA8232" },
  filterText: { color: "#555", fontWeight: "600" },
  activeFilterText: { color: "#fff" },

  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#888",
  },

  card: {
    flexDirection: "row",
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#fefefe",
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    alignItems: "center",
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  cardContent: { flex: 1 },
  buyerName: { fontSize: 16, fontWeight: "700" },
  orderId: { fontSize: 14, color: "#555" },
  orderAmount: { fontSize: 14, fontWeight: "600", marginTop: 2 },
  orderDate: { fontSize: 12, color: "#888", marginTop: 2 },

  cardActions: { alignItems: "flex-end" },

  statusBadge: {
    color: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 4,
    fontSize: 12,
    textAlign: "center",
  },
});
