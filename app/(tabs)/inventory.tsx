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
import { useProducts } from "@/src/context/ProductContext"; // 👈 import context

const Inventory = () => {
  const { products } = useProducts(); // 👈 get products from context

  return (
    <View style={styles.container}>
      <Heading
        title="Inventory"
        leftIcon="arrow-back"
        onLeftPress={() => router.back()}
      />

      <Text style={styles.sectionTitle}>Products</Text>

      {products.length === 0 ? (
        <Text style={styles.emptyText}>No products yet. Add one!</Text>
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.orderRow}>
              {/* ✅ Use first image if available */}
              {item.images && item.images.length > 0 ? (
                <Image source={{ uri: item.images[0] }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.placeholderAvatar]}>
                  <Text style={{ color: "#888" }}>📦</Text>
                </View>
              )}

              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.orderName}>{item.name}</Text>
                <Text>{item.minimum_order_qty} in stock</Text>
                <Text>${item.unit_price}</Text>
              </View>

              <View style={styles.buttonGap}>
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: "/editProduct",
                      params: { id: item.id },
                    })
                  }
                >
                  <Text style={styles.editButton}>Edit</Text>
                </Pressable>
                <Pressable onPress={() => console.log("Delete pressed")}>
                  <Text style={styles.deleteButton}>Delete</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default Inventory;

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
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#888",
    fontSize: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 8,
  },
  placeholderAvatar: {
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
  },
  orderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
  },
  orderName: {
    fontSize: 16,
    fontWeight: "600",
  },
  buttonGap: {
    flexDirection: "row",
    gap: 5,
  },
  editButton: {
    fontWeight: "600",
    backgroundColor: "#FA8232",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  deleteButton: {
    fontWeight: "600",
    backgroundColor: "#eb3b5a",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
});
