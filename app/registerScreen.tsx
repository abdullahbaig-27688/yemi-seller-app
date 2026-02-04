import RegisterField from "@/components/inputFields";
import PrimaryButton from "@/components/primaryButton";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import CountryPicker from "react-native-country-picker-modal";
import Svg, { Path } from "react-native-svg";

const SignUpScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [countryCode, setCountryCode] = useState("GB");
  const [callingCode, setCallingCode] = useState("44");
  const [phone, setPhone] = useState("");
  const [shopName, setShopName] = useState("");
  const [shopAddress, setShopAddress] = useState("");

  const [logo, setLogo] = useState<any>(null);
  const [image, setImage] = useState<any>(null);
  const [banner, setBanner] = useState<any>(null);

  const pickImage = async (setImageFn: any) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });

    if (!result.canceled) {
      setImageFn(result.assets[0]);
    }
  };

  const handleSignup = async () => {
    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("f_name", firstName);
      formData.append("l_name", lastName);
      formData.append("phone", `+${callingCode}${phone}`);
      formData.append("shop_name", shopName);
      formData.append("shop_address", shopAddress);

      if (logo) {
        formData.append("logo", {
          uri: logo.uri,
          name: "logo.jpg",
          type: "image/jpeg",
        } as any);
      }

      const response = await axios.post(
        "https://yemi.store/api/v2/seller/registration",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.data?.success) {
        Alert.alert("Success", "Account created successfully!", [
          { text: "OK", onPress: () => router.replace("/loginScreen") },
        ]);
      } else {
        Alert.alert("Error", response.data?.message || "Signup failed");
      }
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1, backgroundColor: "#fff" }}>

          {/* Shapes */}
          <Svg style={styles.toShape} viewBox="0 0 200 200">
            <Path
              fill="#8aa2dfff"
              d="M47.7,-62.7C62.6,-52.5,77.1,-39.5,83.4,-22.4C89.7,-5.2,87.7,16,75.4,27.9C63.1,39.8,40.5,42.4,21.3,50.6C2,58.9,-13.8,72.9,-30.7,72.8C-47.7,72.8,-65.8,58.8,-75.8,40.3C-85.8,21.7,-87.7,-1.4,-78.7,-18.7C-69.7,-36,-49.9,-47.6,-32.1,-58.1C-14.3,-68.6,1.4,-78,18.8,-80.4C36.2,-82.7,55.2,-77.3,47.7,-62.7Z"
              transform="translate(100 100)"
            />
          </Svg>

          {/* Header (STAYS VISIBLE) */}
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
          </View>

          {/* Form */}
          <ScrollView
            contentContainerStyle={styles.formContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <RegisterField placeholder="Email" value={email} onChangeText={setEmail} />
            <RegisterField placeholder="Password" value={password} secureTextEntry onChangeText={setPassword} />
            <RegisterField placeholder="First Name" value={firstName} onChangeText={setFirstName} />
            <RegisterField placeholder="Last Name" value={lastName} onChangeText={setLastName} />

            <View style={styles.inputview}>
              <CountryPicker
                countryCode={countryCode}
                withFlag
                withCallingCode
                onSelect={(c) => {
                  setCountryCode(c.cca2);
                  setCallingCode(c.callingCode[0]);
                }}
              />
              <Text style={styles.countryCode}>+{callingCode}</Text>
              <TextInput
                style={styles.input}
                placeholder="Phone"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            <RegisterField placeholder="Shop Name" value={shopName} onChangeText={setShopName} />
            <RegisterField placeholder="Shop Address" value={shopAddress} onChangeText={setShopAddress} />

            <TouchableOpacity style={styles.uploadBtn} onPress={() => pickImage(setLogo)}>
              <Text>{logo ? "✔ Logo Selected" : "Upload Logo"}</Text>
            </TouchableOpacity>

            <View style={styles.buttonRow}>
              <PrimaryButton title="Cancel" variant="outline" onPress={() => router.back()} />
              <PrimaryButton title="Next" variant="primary" onPress={handleSignup} />
            </View>
          </ScrollView>

        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  toShape: {
    position: "absolute",
    width: 300,
    height: 300,
    top: -80,
    left: -60,
  },
  header: {
    paddingTop: 180,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 40,
    fontWeight: "700",
    color: "#202020",
  },
  formContainer: {
    paddingHorizontal: 16,
    paddingBottom: 160,
  },
  inputview: {
    backgroundColor: "#eee",
    height: 50,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    marginLeft: 8,
  },
  countryCode: {
    fontWeight: "bold",
    marginRight: 6,
  },
  uploadBtn: {
    backgroundColor: "#eee",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
});
