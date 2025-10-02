import React from "react";
import { StyleSheet, TextInput } from "react-native";
type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};
const input = ({ value, onChangeText, placeholder }: Props) => {
  return (
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
    />
  );
};

export default input;

const styles = StyleSheet.create({
  input: {
    height: 50,
    backgroundColor: "#F8F8F8",
    borderRadius: 40,
  },
});
