import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
type Props = {
  title: string;
  onPress: () => void;
};

const primaryButton = ({ title, onPress }: Props) => {
  return (
    <Pressable onPress={onPress} style={styles.button}>
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
};

export default primaryButton;
const styles = StyleSheet.create({
  button: {
    width: "100%",
    paddingVertical:10,
    backgroundColor: "#FA8232",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    // zIndex: 1,
    // marginBottom: 40,
  },
  text: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
});
