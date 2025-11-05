import LoginField from "@/components/inputFields";
import PrimaryButton from "@/components/primaryButton";
import AsyncStorage from "@react-native-async-storage/async-storage"; // 👈 Add this import
import axios from "axios";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView,
} from "react-native";
import Svg, { Path } from "react-native-svg";
const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState("");
  const [password, setPassord] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const loginRes = await axios.post(
        "https://yemi.store/api/v2/seller/auth/login",
        { email, password },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Login response:", loginRes.data);

      // ✅ Extract token
      const token = loginRes.data?.token || loginRes.data?.access_token;
      if (!token) throw new Error("No token received from server");

      // ✅ Save token
      await AsyncStorage.setItem("seller_token", token);
      console.log("✅ Token saved successfully:", token);

      // ✅ Optionally fetch user profile
      const profileRes = await axios.get(
        "https://yemi.store/api/v2/seller/seller-info",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const user = profileRes.data;
      const safeUserData = {
        id: user.id,
        f_name: user.f_name,
        l_name: user.l_name,
        email: user.email,
        phone: user.phone,
        image: user.image_full_url?.path || null,
        token: token,
        status: user.status,
      };

      await AsyncStorage.setItem(
        "seller_profile",
        JSON.stringify(safeUserData)
      );
      // await AsyncStorage.setItem(
      //   "seller_profile",
      //   JSON.stringify(profileRes.data)
      // );
      console.log("👤 User profile saved:", safeUserData);

      Alert.alert("Success", "Login successful!");
      router.replace("/(tabs)"); // Navigate to main tabs
    } catch (error: any) {
      console.log(
        "🔴 Login error full:",
        error.response?.data || error.message
      );
      Alert.alert(
        "Login Failed",
        error.response?.data?.message ?? "Invalid credentials"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {
        <Svg style={styles.midShape} viewBox="0 0 200 200">
          <Path
            fill="#DCE6FF" // Light blue shape
            d="M47.7,-62.7C62.6,-52.5,77.1,-39.5,83.4,-22.4C89.7,-5.2,87.7,16,75.4,27.9C63.1,39.8,40.5,42.4,21.3,50.6C2,58.9,-13.8,72.9,-30.7,72.8C-47.7,72.8,-65.8,58.8,-75.8,40.3C-85.8,21.7,-87.7,-1.4,-78.7,-18.7C-69.7,-36,-49.9,-47.6,-32.1,-58.1C-14.3,-68.6,1.4,-78,18.8,-80.4C36.2,-82.7,55.2,-77.3,47.7,-62.7Z"
            transform="translate(100 100)"
          />
        </Svg>
      }

      <View style={styles.topShape}></View>

      <Svg style={styles.rightShape} viewBox="0 0 200 200">
        <Path
          fill="#FA8232"
          d="M47.7,-62.7C62.6,-52.5,77.1,-39.5,83.4,-22.4C89.7,-5.2,87.7,16,75.4,27.9C63.1,39.8,40.5,42.4,21.3,50.6C2,58.9,-13.8,72.9,-30.7,72.8C-47.7,72.8,-65.8,58.8,-75.8,40.3C-85.8,21.7,-87.7,-1.4,-78.7,-18.7C-69.7,-36,-49.9,-47.6,-32.1,-58.1C-14.3,-68.6,1.4,-78,18.8,-80.4C36.2,-82.7,55.2,-77.3,47.7,-62.7Z"
          transform="translate(100 100)"
        />
      </Svg>

      <Text style={styles.title}> Login </Text>

      <View style={styles.topview}>
        <Text>Good to see you back!</Text>

        <Image
          source={require("../assets/images/heart.png")}
          style={styles.heartIcon}
        />
      </View>

      {/* Email Field */}
      <LoginField
        // label="Email"
        placeholder="Enter Email"
        value={email}
        onChangeText={setEmail}
      />

      {/* Password Field */}

      <LoginField
        placeholder=" Enter Password"
        value={password}
        onChangeText={setPassord}
        secureTextEntry
      />

      <Pressable
        onPress={() => {
          router.push("/recoverpassword"); // 👈 Navigate to Forgot Password screen
        }}
      >
        <Text style={styles.forgotPasswordtext}>Forgot Password</Text>
      </Pressable>

      <View style={styles.buttonRow}>
        <PrimaryButton
          title="Cancel"
          onPress={() => router.back()}
          variant="outline"
        />
        <PrimaryButton title="Log IN" onPress={handleLogin} variant="primary" />
      </View>

      <View style={styles.bottomShape}></View>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: "center",
    paddingHorizontal: 16,
    backgroundColor: "white",
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
    fontSize: 50,
    fontWeight: 700,
    color: "#202020",
    marginBottom: 20,
    marginTop: 200,
  },
  inputview: {
    backgroundColor: "#eee",
    width: "100%",
    height: 50,
    borderRadius: 10,
    paddingVertical: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  mainview: {
    gap: 10,
    marginBottom: 15,
    width: "100%",
  },
  topview: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 15,
    width: "100%",
  },
  heartIcon: {
    height: 20,
    width: 20,
  },

  bottomShape: {
    position: "absolute",
    bottom: -20,
    right: -60,
    width: 300,
    height: 200,
    backgroundColor: "#DCE6FF",
    borderTopLeftRadius: 200,
    zIndex: -1, // ✅ behind all content
  },

  forgotPasswordtext: {
    alignSelf: "flex-end",
    marginBottom: 20,
    color: "#FA8232",
    fontSize: 15,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 20,
  },
});
