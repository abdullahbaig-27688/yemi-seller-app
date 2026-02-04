import { useAuth } from "@/src/context/AuthContext";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";

const SplashScreen = () => {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    const timer = setTimeout(() => {
      if (isAuthenticated) {
        router.replace("/(tabs)");
      } else {
        router.replace("/getStarted");
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [loading, isAuthenticated]);

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/splash.png")}
        style={styles.logo}
        contentFit="contain"
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
