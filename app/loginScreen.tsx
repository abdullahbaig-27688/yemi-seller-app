import LoginField from "@/components/inputFields";
import PrimaryButton from "@/components/primaryButton";

import { useAuth } from "@/src/context/AuthContext";
import axios from "axios";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassord] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  /* ---------------- LOGIN ---------------- */
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const loginRes = await axios.post(
        "https://yemi.store/api/v2/seller/auth/login",
        { email, password }
      );

      const token = loginRes.data?.token || loginRes.data?.access_token;
      if (!token) throw new Error("No token received");

      console.log("TOKEN:", token);

      // Fetch user info
      const profileRes = await axios.get(
        "https://yemi.store/api/v2/seller/seller-info",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const user = profileRes.data;

      // ✅ Save token and profile in AuthContext
      await login(token, {
        firstName: user.f_name || "",
        lastName: user.l_name || "",
        email: user.email || "",
        phone: user.phone || "",
        holderName: user.holder_name || "",
        bankName: user.bank_name || "",
        branchName: user.branch || "",
        accountNumber: user.account_no || "",
      });

      Alert.alert("Success", "Login successful!");
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert(
        "Login Failed",
        error.response?.data?.message ?? "Invalid credentials"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* SHAPES */}
        <Svg style={styles.midShape} viewBox="0 0 200 200">
          <Path
            fill="#DCE6FF"
            d="M47.7,-62.7C62.6,-52.5,77.1,-39.5,83.4,-22.4C89.7,-5.2,87.7,16,75.4,27.9C63.1,39.8,40.5,42.4,21.3,50.6C2,58.9,-13.8,72.9,-30.7,72.8C-47.7,72.8,-65.8,58.8,-75.8,40.3C-85.8,21.7,-87.7,-1.4,-78.7,-18.7C-69.7,-36,-49.9,-47.6,-32.1,-58.1C-14.3,-68.6,1.4,-78,18.8,-80.4C36.2,-82.7,55.2,-77.3,47.7,-62.7Z"
            transform="translate(100 100)"
          />
        </Svg>

        <View style={styles.topShape} />

        <Svg style={styles.rightShape} viewBox="0 0 200 200">
          <Path
            fill="#FA8232"
            d="M47.7,-62.7C62.6,-52.5,77.1,-39.5,83.4,-22.4C89.7,-5.2,87.7,16,75.4,27.9C63.1,39.8,40.5,42.4,21.3,50.6C2,58.9,-13.8,72.9,-30.7,72.8C-47.7,72.8,-65.8,58.8,-75.8,40.3C-85.8,21.7,-87.7,-1.4,-78.7,-18.7C-69.7,-36,-49.9,-47.6,-32.1,-58.1C-14.3,-68.6,1.4,-78,18.8,-80.4C36.2,-82.7,55.2,-77.3,47.7,-62.7Z"
            transform="translate(100 100)"
          />
        </Svg>

        {/* CONTENT */}
        <Text style={styles.title}>Login</Text>

        <View style={styles.topview}>
          <Text>Good to see you back!</Text>
          <Image
            source={require("../assets/images/heart.png")}
            style={styles.heartIcon}
          />
        </View>

        <LoginField
          placeholder="Enter Email"
          value={email}
          onChangeText={setEmail}
        />

        <LoginField
          placeholder="Enter Password"
          value={password}
          onChangeText={setPassord}
          secureTextEntry
        />

        <Pressable onPress={() => router.push("/forgotPassword")}>
          <Text style={styles.forgotPasswordtext}>Forgot Password?</Text>
        </Pressable>

        <View style={styles.buttonRow}>
          <PrimaryButton
            title="Cancel"
            onPress={() => router.back()}
            variant="outline"
          />
          <PrimaryButton
            title={loading ? "Logging in..." : "Login"}
            onPress={handleLogin}
            variant="primary"
          />
        </View>

        <View style={styles.bottomShape} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
    backgroundColor: "white",
    paddingBottom: 40,
  },

  topShape: {
    position: "absolute",
    top: -100,
    left: -70,
    width: 270,
    height: 270,
    backgroundColor: "#FA8232",
    borderBottomRightRadius: 180,
  },

  midShape: {
    position: "absolute",
    width: 300,
    height: 300,
    top: -70,
    left: -25,
  },

  rightShape: {
    position: "absolute",
    right: -120,
    width: 250,
    height: 200,
    marginBottom: 300,
    transform: [{ rotate: "140deg" }],
  },

  title: {
    fontSize: 40,
    fontWeight: "700",
    color: "#202020",
    marginBottom: 20,
    marginTop: 200,
  },

  topview: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },

  heartIcon: {
    width: 20,
    height: 20,
  },

  forgotPasswordtext: {
    alignSelf: "flex-end",
    marginTop: 6,
    marginBottom: 20,
    color: "#FA8232",
    fontSize: 15,
    fontWeight: "500",
  },

  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },

  bottomShape: {
    position: "absolute",
    bottom: -20,
    right: -60,
    width: 300,
    height: 200,
    backgroundColor: "#DCE6FF",
    borderTopLeftRadius: 200,
    zIndex: -1,
  },
});
