import React, { useState } from "react";
import { View, FlatList, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ConfirmedHeader from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import { router } from "expo-router";
const confirmedOrder = () => {
  const [search, setSearch] = useState("");
  const orders = [
    { id: "1", name: "Order #1001", customer: "Ali Khan", total: 1200 },
    { id: "2", name: "Order #1002", customer: "Sara Ahmed", total: 950 },
  ];
  const filteredOrders = orders.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.customer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* <Text style={styles.header}>Pending Orders</Text> */}
      <ConfirmedHeader
        title="Delivered  Orders"
        leftIcon="arrow-back"
        onLeftPress={() => router.back()}
      />
      {/* 🔍 Reusable Search Bar */}
      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Search by Order ID or Customer..."
      />
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.name}</Text>
            <Text>Customer: {item.customer}</Text>
            <Text>Total: Rs {item.total}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default confirmedOrder;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f8f8" },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
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
