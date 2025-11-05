import Heading from "@/components/Header";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Example order data
const incomingOrders = [
  {
    id: "1",
    name: "Liam Harper",
    order: "#12345",
    amount: "$45",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    status: "Pending",
    date: "2025-10-29",
  },
  {
    id: "2",
    name: "Olivia Bennett",
    order: "#12346",
    amount: "$60",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    status: "Processing",
    date: "2025-10-28",
  },
  {
    id: "3",
    name: "Noah Carter",
    order: "#12347",
    amount: "$25",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    status: "Completed",
    date: "2025-10-27",
  },
  {
    id: "4",
    name: "Ava Thompson",
    order: "#12348",
    amount: "$80",
    avatar: "https://randomuser.me/api/portraits/women/4.jpg",
    status: "Cancelled",
    date: "2025-10-26",
  },
];

const statusColors: Record<string, string> = {
  Pending: "#f1c40f",
  Processing: "#3498db",
  Completed: "#2ecc71",
  Cancelled: "#e74c3c",
};

const IncomingOrder = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("All");

  // Filtered orders based on search & status
  const filteredOrders = incomingOrders.filter((order) => {
    const matchesSearch =
      order.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.order.toLowerCase().includes(searchQuery.toLowerCase());

    if (filter === "All") return matchesSearch;
    return matchesSearch && order.status === filter;
  });

  const filters = ["All", "Pending", "Processing", "Completed", "Cancelled"];

  return (
    <SafeAreaView style={styles.container}>
      <Heading
        title="Incoming Orders"
        leftIcon="arrow-back"
        onLeftPress={() => router.back()}
      />
      <ScrollView style={styles.content}>
        {/* Search */}
        <TextInput
          style={styles.searchInput}
          placeholder="Search by buyer or order ID..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#888"
        />

        {/* Filter buttons */}
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

        {filteredOrders.length === 0 ? (
          <Text style={styles.emptyText}>No orders found.</Text>
        ) : (
          <FlatList
            showsVerticalScrollIndicator={false}
            data={filteredOrders}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
                <View style={styles.cardContent}>
                  <Text style={styles.buyerName}>{item.name}</Text>
                  <Text style={styles.orderId}>{item.order}</Text>
                  <Text style={styles.orderAmount}>{item.amount}</Text>
                  <Text style={styles.orderDate}>{item.date}</Text>
                </View>
                <View style={styles.cardActions}>
                  <Text
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusColors[item.status] || "#777" },
                    ]}
                  >
                    {item.status}
                  </Text>
                  {item.status === "Pending" && (
                    <Pressable
                      style={styles.actionButton}
                      onPress={() => console.log("Mark as Processing", item.id)}
                    >
                      <Text style={styles.actionText}>Process</Text>
                    </Pressable>
                  )}
                  {item.status !== "Cancelled" && (
                    <Pressable
                      style={[
                        styles.actionButton,
                        { backgroundColor: "#e74c3c" },
                      ]}
                      onPress={() => console.log("Cancel order", item.id)}
                    >
                      <Text style={styles.actionText}>Cancel</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            )}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default IncomingOrder;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
    content: { padding: 20 },
  searchInput: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
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
  actionButton: {
    backgroundColor: "#3498db",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  actionText: { color: "#fff", fontWeight: "600", fontSize: 12 },
});
