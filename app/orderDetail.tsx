import Heading from "@/components/Header";
import PrimaryButton from "@/components/primaryButton";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const OrderDetail = () => {
  const { id, name, order, amount, avatar } = useLocalSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState("Pending");

  const statuses = ["Pending", "Shipped", "Delivered", "Canceled"];

  return (
    <View style={styles.container}>
      <Heading
        title="Order Detail"
        leftIcon="arrow-back"
        onLeftPress={() => router.back()}
      />

      {/* Order Info */}
      <View style={styles.infoBox}>
        <Image source={{ uri: avatar }} style={styles.avatar} />
        <View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.order}>Order {order}</Text>
        </View>
        <Text style={styles.amount}>{amount}</Text>
      </View>

      <Text style={styles.sectionTitle}>Order Status</Text>
      {statuses.map((item) => (
        <TouchableOpacity
          key={item}
          style={styles.radioRow}
          onPress={() => setStatus(item)}
        >
          <Text style={styles.radioLabel}>{item}</Text>
          <View
            style={[
              styles.radioOuter,
              status === item && styles.radioOuterActive,
            ]}
          >
            {status === item && <View style={styles.radioInner} />}
          </View>
        </TouchableOpacity>
      ))}
      <PrimaryButton
        title="Update Status"
        onPress={() => router.back()}
      />
    </View>
  );
};
export default  OrderDetail;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16, paddingTop: 50 },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  name: { fontSize: 18, fontWeight: "600" },
  order: { fontSize: 14, color: "#777" },
  amount: { marginLeft: "auto", fontWeight: "bold", fontSize: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  radioRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginTop: 10,
    paddingHorizontal: 15,
  },
  radioLabel: { fontSize: 15, color: "#333" },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  radioOuterActive: { borderColor: "#ff6600" },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#ff6600",
  },
  button: {
    marginTop: 25,
    backgroundColor: "#ff6600",
    paddingVertical: 14,
    borderRadius: 8,
  },
  buttonText: {
    textAlign: "center",
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
