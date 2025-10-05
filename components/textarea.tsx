import React from "react";
import {
  View,
  Text,
  TextInput,
  NativeSyntheticEvent,
  TextInputContentSizeChangeEventData,
  StyleSheet,
} from "react-native";
type Props = {
  label: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
};
const textarea = ({ label, placeholder, value, onChangeText }: Props) => {
  const [height, setHeight] = React.useState(120);
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        multiline
        style={[styles.textarea, { height: 80 }]}
        textAlignVertical="top"
        onContentSizeChange={(
          e: NativeSyntheticEvent<TextInputContentSizeChangeEventData>
        ) => {
          setHeight(Math.max(120, e.nativeEvent.contentSize.height)); // auto-grow
        }}
      />
    </View>
  );
};

export default textarea;
const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
  },
  textarea: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#FFD2B4",
    minHeight: 20,
  },
});
