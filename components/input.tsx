import React from "react";
import { StyleSheet, View, Text, TextInput } from "react-native";

type Props = {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
  inputStyle?: object;
  required?: boolean; // <-- New prop
  keyboardType?: "default" | "numeric";
};

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  numberOfLines = 1,
  inputStyle,
  required = false,
  keyboardType = "default",
}: Props) => {
  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label} {required && <Text style={styles.requiredStar}> *</Text>}
        </Text>
      )}
      <TextInput
        style={[
          styles.input,
          inputStyle,
          multiline && { textAlignVertical: "top" },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline={multiline}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType}
      />
    </View>
  );
};

export default Input;

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    // backgroundColor: "#FFD2B4",
  },
  requiredStar: {
    color: "red",
  },
});
