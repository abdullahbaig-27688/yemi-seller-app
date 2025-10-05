import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
type Props = {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "numeric" | "email-address";
};
const inputFields = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType = "default",
}: Props) => {
  return (
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
    />
  );
};

export default inputFields;

const styles = StyleSheet.create({
  input: {
    height: 50,
    backgroundColor: "#F8F8F8",
    borderRadius: 40,
    // paddingHorizontal: 20,
    paddingVertical: 10,
  },
});
