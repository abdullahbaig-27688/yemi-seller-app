import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
} from "react-native";
import Heading from "@/components/heading";
import { router } from "expo-router";

const incomingOrders = [
  {
    id: "1",
    name: "Liam Harper",
    order: "#12345",
    amount: "$45",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
  },
  {
    id: "2",
    name: "Olivia Bennett",
    order: "#12346",
    amount: "$60",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
  },
  {
    id: "3",
    name: "Noah Carter",
    order: "#12347",
    amount: "$25",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg",
  },
  {
    id: "4",
    name: "Ava Thompson",
    order: "#12348",
    amount: "$80",
    avatar: "https://randomuser.me/api/portraits/women/4.jpg",
  },
  {
    id: "5",
    name: "Liam Harper",
    order: "#12345",
    amount: "$45",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
  },
  {
    id: "6",
    name: "Olivia Bennett",
    order: "#12346",
    amount: "$60",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
  },
  {
    id: "7",
    name: "Noah Carter",
    order: "#12347",
    amount: "$25",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg",
  },
  {
    id: "8",
    name: "Ava Thompson",
    order: "#12348",
    amount: "$80",
    avatar: "https://randomuser.me/api/portraits/women/4.jpg",
  },
];

const incomingOrder = () => {
  return (
    <View style={styles.container}>
      <Heading
        title="Incoming Order"
        leftIcon="arrow-back"
        onLeftPress={() => router.back()}
      />
      <Text style={styles.sectionTitle}>Orders</Text>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={incomingOrders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              router.push({
                pathname: "/orderDetail",
                params: {
                  ...item,
                },
              });
            }}
          >
            <View style={styles.orderRow}>
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.orderName}>{item.name}</Text>
                <Text style={styles.orderId}>Order {item.order}</Text>
              </View>
              <Text style={styles.orderAmount}>{item.amount}</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
};

export default incomingOrder;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    paddingTop: 50,
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
});
