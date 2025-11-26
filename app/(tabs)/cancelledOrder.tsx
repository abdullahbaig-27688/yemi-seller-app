import CancelledHeader from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CancelledOrder = () => {
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // state for messages

  // 🔥 Fetch Cancelled Orders
  const fetchCancelledOrders = async () => {
    try {
      setLoading(true);
      setError(""); // reset error

      const token = await AsyncStorage.getItem("seller_token");
      if (!token) {
        Alert.alert("Error", "No auth token found. Please login again.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        "https://yemi.store/api/v2/seller/orders/vendor/cancelled",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      console.log("API Status:", response.status);
      const data = await response.json();
      console.log("Cancelled Orders:", data);

      if (!data || !data.orders?.data || data.orders.data.length === 0) {
        setError("No cancelled orders found");
        setOrders([]);
        return;
      }

      setOrders(data.orders.data); // ✅ set orders directly
    } catch (error) {
      setError("Something went wrong");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCancelledOrders();
  }, []);

  // 🔍 Search Filter
  const filteredOrders = orders.filter(
    (item) =>
      item.code?.toLowerCase().includes(search.toLowerCase()) ||
      item.customer?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <CancelledHeader
        title="Cancelled Orders"
        leftIcon="arrow-back"
        onLeftPress={() => router.back()}
      />

      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Search by Order ID or Customer..."
      />

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : error ? (
        <Text style={styles.message}>{error}</Text>
      ) : filteredOrders.length === 0 ? (
        <Text style={styles.message}>
          No cancelled orders match your search
        </Text>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.title}>Order #{item.code}</Text>
              <Text>Customer: {item.customer?.name}</Text>
              <Text>Total Amount: Rs {item.order_amount}</Text>
              <Text>Payment Status: {item.payment_status}</Text>
              <Text>Shipping Type: {item.shipping_type}</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

export default CancelledOrder;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f8f8" },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: { fontWeight: "bold", fontSize: 16 },
  message: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#888",
  },
});
