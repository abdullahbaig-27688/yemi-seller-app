import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";

const SplashScreen = () => {
  const router = useRouter();
  useEffect(() => {
    const timer = setTimeout(() => {
      return router.push("/getStarted"); // 👈 change to a valid route like "/" or another defined route
    }, 400);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/splash.png")}
        style={styles.logo}
        contentFit="contain" // 👈 proper way in expo-image
      />
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff", // white background
  },
  logo: {
    height: 400,
    width: 400,
    resizeMode: "center",
  },
});
