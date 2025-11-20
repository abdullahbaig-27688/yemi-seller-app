import PendingHeader from "@/components/Header";
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

const ReturnedOrder = () => {
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReturnedOrders = async () => {
    try {
      setLoading(true);
      setError("");
      // 🔑 Get token from AsyncStorage
      const token = await AsyncStorage.getItem("seller_token");
      if (!token) {
        Alert.alert("Error", "No auth token found. Please login again.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        "https://yemi.store/api/v2/seller/orders/vendor/returned",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data?.data) {
        setOrders(data.data);
      } else {
        setError("No returned orders found");
      }
    } catch (err) {
      setError("Failed to fetch returned orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturnedOrders();
  }, []);

  // 🔍 Filter list
  const filteredOrders = orders.filter(
    (item) =>
      item.code.toLowerCase().includes(search.toLowerCase()) ||
      item.customer_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <PendingHeader
        title="Returned Orders"
        leftIcon="arrow-back"
        onLeftPress={() => router.back()}
      />

      {/* Search */}
      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Search by Order ID or Customer..."
      />

      {/* Loading */}
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : error ? (
        <Text style={{ textAlign: "center", marginTop: 10 }}>{error}</Text>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.title}>Order #{item.code}</Text>
              <Text>Customer: {item.customer_name}</Text>
              <Text>Total: Rs {item.grand_total}</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

export default ReturnedOrder;

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
});
