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
const heading = ({
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
            <Ionicons name={leftIcon as any} size={24} color="black" />
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
            <Ionicons name={rightIcon as any} size={24} color="black" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} /> // placeholder
        )}
      </View>
    </View>
  );
};

export default heading;
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  side: {
    width: 40, // same width as icon to keep balance
    alignItems: "center",
  },
});
