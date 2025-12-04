import React from "react";
import { View, StyleSheet } from "react-native";
import SetupHeader from "@/components/Header";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

const otherSetup = () => {
  return (
    <SafeAreaView style={styles.container}>
      <SetupHeader
        title="Other Setups"
        leftIcon="arrow-back"
        onLeftPress={() => router.back()}
      />
    </SafeAreaView>
  );
};

export default otherSetup;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
