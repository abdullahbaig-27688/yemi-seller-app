import React from "react";
import { View, StyleSheet } from "react-native";
import Heading from "@/components/heading";

const Account = () => {
  return (
    <View style={styles.container}>
      <Heading
        title="Account"
        leftIcon="arrow-back"
        onLeftPress={() => console.log("Back pressed")}
      />
    </View>
  );
};

export default Account;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    paddingTop: 50,
  },
});
