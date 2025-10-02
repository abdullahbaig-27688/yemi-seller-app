import React from "react";
import { View, Text, StyleSheet,FlatList,Image } from "react-native";
import Heading from "@/components/heading";


const Products = [
  { id: "1", name: "Handmade Soap", quantity: "10 in stock", avatar: "https://randomuser.me/api/portraits/men/1.jpg" },
  { id: "2", name: "Organic Candles", quantity: "25 in stock", avatar: "https://randomuser.me/api/portraits/women/2.jpg" },
  { id: "3", name: "Essential Oils",  quantity: "5 in stock", avatar: "https://randomuser.me/api/portraits/men/3.jpg" },
  { id: "4", name: "Bath Bombs", quantity: "15 in stock", avatar: "https://randomuser.me/api/portraits/women/4.jpg" },
  { id: "5", name: "Handmade Soap", quantity: "10 in stock", avatar: "https://randomuser.me/api/portraits/men/1.jpg" },
  { id: "6", name: "Organic Candles", quantity: "25 in stock", avatar: "https://randomuser.me/api/portraits/women/2.jpg" },
  { id: "7", name: "Essential Oils",  quantity: "5 in stock", avatar: "https://randomuser.me/api/portraits/men/3.jpg" },
  { id: "8", name: "Bath Bombs", quantity: "15 in stock", avatar: "https://randomuser.me/api/portraits/women/4.jpg" },
  { id: "9", name: "Handmade Soap", quantity: "10 in stock", avatar: "https://randomuser.me/api/portraits/men/1.jpg" },
  { id: "10", name: "Organic Candles", quantity: "25 in stock", avatar: "https://randomuser.me/api/portraits/women/2.jpg" },
  { id: "11", name: "Essential Oils",  quantity: "5 in stock", avatar: "https://randomuser.me/api/portraits/men/3.jpg" },
  { id: "12", name: "Bath Bombs", quantity: "15 in stock", avatar: "https://randomuser.me/api/portraits/women/4.jpg" },
  
  
]
const Product = () => {
  return (
    <View style={styles.container}>
      <Heading
        title="Inventory"
        leftIcon="arrow-back"
        onLeftPress={() => console.log("Back pressed")}
      />
      <Text style={styles.sectionTitle}>Products</Text>
      <FlatList showsVerticalScrollIndicator={false}
        data={Products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.orderRow}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.orderName}>{item.name}</Text>
              <Text>{item.quantity}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
};
export default Product;
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
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 8,
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
    fontWeight: "600"
  }
});
 
