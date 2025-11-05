import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RefundHeader from "@/components/Header";
import { router } from "expo-router";

const refunds = () => {
  return (
    <SafeAreaView style={styles.container}>
      <RefundHeader
        title="Refund Requests"
        leftIcon="arrow-back"
        onLeftPress={() => router.back()}
      />
    </SafeAreaView>
  );
};

export default refunds;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
});
