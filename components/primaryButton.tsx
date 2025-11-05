import React from "react";
import { Text, StyleSheet, Pressable } from "react-native";

type Props = {
  title: string;
  onPress: () => void;
  style?: object;
  variant?: "primary" | "outline";
  fullWidth?: boolean; // ✅ new prop for flexibility
};

const PrimaryButton = ({
  title,
  onPress,
  style,
  variant = "primary",
  fullWidth = false,
}: Props) => {
  const isOutline = variant === "outline";

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.button,
        isOutline ? styles.outlineButton : styles.primaryButton,
        fullWidth && styles.fullWidth, // ✅ only full width when needed
        style,
      ]}
    >
      <Text style={[styles.text, isOutline && styles.outlineText]}>
        {title}
      </Text>
    </Pressable>
  );
};

export default PrimaryButton;

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    flex: 1, // ✅ behaves well inside horizontal flex rows
  },
  fullWidth: {
    width: "100%", // ✅ for single-column layouts
    flex: 0,
  },
  primaryButton: {
    backgroundColor: "#FA8232",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#FA8232",
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  outlineText: {
    color: "#FA8232",
  },
});
