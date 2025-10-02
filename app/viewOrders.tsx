import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Heading from "@/components/heading";

const viewOrders = () => {
  return (
    <View style={styles.container}>
      <Heading
        title="Incomiing Orders"
        leftIcon="arrow-back"
        onLeftPress={() => console.log("Back pressed")}
      />
      <Text>This is Add Product Page</Text>
    </View>
  );
};

export default viewOrders
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16, paddingTop: 50 },
});
