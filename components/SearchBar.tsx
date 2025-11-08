import React from "react";
import { View, StyleSheet, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
type SearchProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};
const SearchBar = ({
  value,
  onChangeText,
  placeholder = "Search...",
}: SearchProps) => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Ionicons name="search" size={20} color="#555" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
        />
      </View>
    </View>
  );
};

export default SearchBar;
const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 15,
  },
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e6e6e6", // ✅ soft gray background
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  icon: {
    marginRight: 6,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
});
