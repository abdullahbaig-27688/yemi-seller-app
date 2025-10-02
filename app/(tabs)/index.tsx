import React from "react";
import { View, Text, StyleSheet, FlatList, Image } from "react-native";

import Heading from "@/components/heading";
import { Ionicons } from "@expo/vector-icons";

const orders = [
  { id: "1", name: "Liam Harper", order: "#12345", amount: "$45", avatar: "https://randomuser.me/api/portraits/men/1.jpg" },
  { id: "2", name: "Olivia Bennett", order: "#12346", amount: "$60", avatar: "https://randomuser.me/api/portraits/women/2.jpg" },
  { id: "3", name: "Noah Carter", order: "#12347", amount: "$25", avatar: "https://randomuser.me/api/portraits/men/3.jpg" },
  { id: "4", name: "Ava Thompson", order: "#12348", amount: "$80", avatar: "https://randomuser.me/api/portraits/women/4.jpg" },
  { id: "5", name: "Liam Harper", order: "#12345", amount: "$45", avatar: "https://randomuser.me/api/portraits/men/1.jpg" },
  { id: "6", name: "Olivia Bennett", order: "#12346", amount: "$60", avatar: "https://randomuser.me/api/portraits/women/2.jpg" },
  { id: "7", name: "Noah Carter", order: "#12347", amount: "$25", avatar: "https://randomuser.me/api/portraits/men/3.jpg" },
  { id: "8", name: "Ava Thompson", order: "#12348", amount: "$80", avatar: "https://randomuser.me/api/portraits/women/4.jpg" },
]

const DashBoard = () => {
  return (
    <View style={styles.container}>
      {/* Custom Heading */}
      <Heading
        title="Dashboard"
        rightIcon="notifications-outline"
        onRightPress={() => console.log("Notifications pressed")}
      />

      {/* Earnings Card */}
      <View style={styles.earningsCard}>
        <Text style={styles.cardLabel}>Total Earnings</Text>
        <Text style={styles.cardValue}>$12,500</Text>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statsBox}>
          <Text style={styles.statLabel}>Daily Sales</Text>
          <Text style={styles.statValue}>$350</Text>
        </View>
        <View style={styles.statsBox}>
          <Text style={styles.statLabel}>Orders Today</Text>
          <Text style={styles.statValue}>12</Text>
        </View>
      </View>

      {/* Recent Orders */}
      <Text style={styles.sectionTitle}>Recent Orders</Text>
      <FlatList showsVerticalScrollIndicator={false}
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.orderRow}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.orderName}>{item.name}</Text>
              <Text style={styles.orderId}>Order {item.order}</Text>
            </View>
            <Text style={styles.orderAmount}>{item.amount}</Text>
          </View>
        )}
      />
            {/* Bottom Nav */}
      {/* <View style={styles.bottomNav}>
        <Ionicons name="home" size={24} color="black" />
        <Ionicons name="pricetag-outline" size={24} color="gray" />
        <Ionicons name="cart-outline" size={24} color="gray" />
        <Ionicons name="chatbubble-outline" size={24} color="gray" />
        <Ionicons name="person-outline" size={24} color="gray" />
      </View> */}

    </View>
  );
};

export default DashBoard;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16, paddingTop: 50 },

  earningsCard: {
    backgroundColor: '#FFD2B4',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  cardLabel: {
    fontSize: 14,
    color: "#555",
  },
  cardValue: {
    fontSize: 22,
    fontWeight: "bold",
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
   
  },
  statsBox: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 5,
    alignItems: "center",
    borderWidth: 1,
    borderColor: '#304D69'
  },
  statLabel: {
    fontSize: 14,
    color: "#555",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },

  orderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  orderName: {
    fontSize: 16,
    fontWeight: "600",
  },
  orderId: {
    fontSize: 13,
    color: "#777",
  },
  orderAmount: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
  },
   bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderTopWidth: 0.5,
    borderTopColor: "#ddd",
    marginTop: 10,
  },
});
