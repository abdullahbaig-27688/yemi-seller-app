import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

interface Props {
  title: string;

  rightIcon?: string;
  onRightPress?: () => void;
  leftIcon?: string; // e.g. "close" or "arrow-back"
  onLeftPress?: () => void;
}
const Header = ({
  title,
  rightIcon,
  onRightPress,
  leftIcon,
  onLeftPress,
}: Props) => {
  return (
    <View style={styles.container}>
      {/* Left Icon */}
      <View style={styles.side}>
        {leftIcon ? (
          <TouchableOpacity onPress={onLeftPress}>
            <Ionicons name={leftIcon as any} size={24} color="white" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} /> // placeholder to keep title centered
        )}
      </View>

      {/* Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Right Icon */}
      <View style={styles.side}>
        {rightIcon ? (
          <TouchableOpacity onPress={onRightPress}>
            <Ionicons name={rightIcon as any} size={24} color="white" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} /> // placeholder
        )}
      </View>
    </View>
  );
};

export default Header;
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
    padding: 30,
    backgroundColor: "#FA8232",
    borderBottomLeftRadius: 30, // round left bottom corner
    borderBottomRightRadius: 30, // round right bottom corner
  },
  title: {
    fontSize: 23,
    color: "#ffffff",
    fontWeight: "bold",
  },
  side: {
    // width: 40, // same width as icon to keep balance
    // alignItems: "center",
  },
});
