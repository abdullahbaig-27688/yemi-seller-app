import { View, Text, StyleSheet } from "react-native";

const getStarted = () => {
  return (
    <View style={styles.container}>
      <Text>Get Started Screen</Text>
    </View>
  );
};

export default getStarted;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
