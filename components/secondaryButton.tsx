import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
type Props = {
  title: string;
  onPress: () => void;
};
const secondaryButton = ({ title, onPress }: Props) => {
  return (
    <Pressable onPress={onPress} style={styles.button}>
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
};

export default secondaryButton;
const styles = StyleSheet.create({
  button: {
    justifyContent: "center",
    zIndex: 1,
    alignSelf: "center",
    marginTop: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: "300",
  },
});
