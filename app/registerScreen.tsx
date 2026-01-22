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
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import CountryPicker from "react-native-country-picker-modal";
import Svg, { Path } from "react-native-svg";

const SignUpScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [countryCode, setCountryCode] = useState("GB"); // default UK
  const [callingCode, setCallingCode] = useState("44");
  const [phone, setPhone] = useState("");
  const [shopName, setShopName] = useState("");
  const [shopAddress, setShopAddress] = useState("");

  // File uploads
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
      if (image) {
        formData.append("image", {
          uri: image.uri,
          name: "image.jpg",
          type: "image/jpeg",
        } as any);
      }
      if (banner) {
        formData.append("banner", {
          uri: banner.uri,
          name: "banner.jpg",
          type: "image/jpeg",
        } as any);
      }

      const response = await axios.post(
        "https://yemi.store/api/v2/seller/registration",
        formData,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Status:", response.status);
      console.log("Headers:", response.headers);
      console.log("Data:", response.data);

      console.log("FormData Preview:", {
        email,
        password,
        f_name: firstName,
        l_name: lastName,
        phone: `+${callingCode}${phone}`,
        shop_name: shopName,
        shop_address: shopAddress,
        logo: logo ? logo.uri : null,
        image: image ? image.uri : null,
        banner: banner ? banner.uri : null,
      });

      console.log("Signup Response:", JSON.stringify(response.data, null, 2));

      if (
        response.data.success === true ||
        response.data.message === "Account created successfully"
      ) {
        Alert.alert("Success", "Account created successfully!", [
          {
            text: "OK",
            onPress: () => router.replace("/loginScreen"), // use replace instead of push
          },
        ]);
      } else {
        Alert.alert("Error", response.data.message || "Signup failed");
      }
    } catch (error: any) {
      console.error("Error:", error.response?.data || error.message);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Something went wrong"
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAwareScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid
          extraScrollHeight={20}
          showsVerticalScrollIndicator={false}
        >

          <Svg style={styles.toShape} viewBox="0 0 200 200">
            <Path
              fill="#8aa2dfff"
              d="M47.7,-62.7C62.6,-52.5,77.1,-39.5,83.4,-22.4C89.7,-5.2,87.7,16,75.4,27.9C63.1,39.8,40.5,42.4,21.3,50.6C2,58.9,-13.8,72.9,-30.7,72.8C-47.7,72.8,-65.8,58.8,-75.8,40.3C-85.8,21.7,-87.7,-1.4,-78.7,-18.7C-69.7,-36,-49.9,-47.6,-32.1,-58.1C-14.3,-68.6,1.4,-78,18.8,-80.4C36.2,-82.7,55.2,-77.3,47.7,-62.7Z"
              transform="translate(100 100)"
            />
          </Svg>

          <Svg style={styles.midShape} viewBox="0 0 200 200">
            <Path
              fill="#FA8232"
              d="M47.7,-62.7C62.6,-52.5,77.1,-39.5,83.4,-22.4C89.7,-5.2,87.7,16,75.4,27.9C63.1,39.8,40.5,42.4,21.3,50.6C2,58.9,-13.8,72.9,-30.7,72.8C-47.7,72.8,-65.8,58.8,-75.8,40.3C-85.8,21.7,-87.7,-1.4,-78.7,-18.7C-69.7,-36,-49.9,-47.6,-32.1,-58.1C-14.3,-68.6,1.4,-78,18.8,-80.4C36.2,-82.7,55.2,-77.3,47.7,-62.7Z"
              transform="translate(100 100)"
            />
          </Svg>

          <Text style={styles.title}> Create Account </Text>

          {/* Input Fields */}
          <View style={styles.mainview}>
            {/* Email Field */}
            <RegisterField
              placeholder="Enter Email"
              value={email}
              onChangeText={setEmail}
            />

            {/* Register Field */}
            <RegisterField
              placeholder="Enter Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            {/* First Name Field */}
            <RegisterField
              placeholder="Enter First Name"
              value={firstName}
              onChangeText={setFirstName}
            />
            {/* Last Name Field */}
            <RegisterField
              placeholder="Enter Last Name"
              value={lastName}
              onChangeText={setLastName}
            />
            {/* </View> */}

            {/* Phone with country picker */}
            <View style={styles.inputview}>
              <CountryPicker
                countryCode={countryCode}
                withFlag
                withCallingCode
                withFilter
                withEmoji
                onSelect={(country) => {
                  setCountryCode(country.cca2);
                  setCallingCode(country.callingCode[0]);
                }}
              />
              <Text style={styles.countryCode}>+{callingCode}</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your Number"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            {/* Shop Name Fields */}
            <RegisterField
              placeholder="Enter Shop Name"
              value={shopName}
              onChangeText={setShopName}
            />
            {/* Shop Address Field */}
            <RegisterField
              placeholder="Enter Shop Address"
              value={shopAddress}
              onChangeText={setShopAddress}
            />

            {/* File Uploads */}
            <TouchableOpacity
              style={styles.uploadBtn}
              onPress={() => pickImage(setLogo)}
            >
              <Text>{logo ? "✔ Logo Selected" : "Upload Logo"}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.uploadBtn}
              onPress={() => pickImage(setImage)}
            >
              <Text>{image ? "✔ Image Selected" : "Upload Image"}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.uploadBtn}
              onPress={() => pickImage(setBanner)}
            >
              <Text>{banner ? "✔ Banner Selected" : "Upload Banner"}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonRow}>
            <PrimaryButton
              title="Cancel"
              onPress={() => router.back()}
              variant="outline"
            />
            <PrimaryButton title="Next" onPress={handleSignup} variant="primary" />
          </View>
        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>

  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",

    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: "white",
  },
  toShape: {
    position: "absolute",
    width: 300,
    height: 300,
    top: -70,
    left: -65,
  },
  midShape: {
    position: "absolute",
    width: 200,
    height: 200,
    top: 100,
    right: -95,
    transform: [{ rotate: "140deg" }],
  },
  title: {
    fontSize: 40,
    fontWeight: 700,
    color: "#202020",
    marginBottom: 20,
    marginTop: 200,
  },
  mainview: {
    marginBottom: 10,
    width: "100%",
  },
  inputview: {
    backgroundColor: "#eee",

    width: "100%",
    height: 50,
    borderRadius: 10,
    // borderColor: "#ccc",

    // borderWidth: 1,

    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
  },
  countryCode: {
    fontSize: 16,
    marginRight: 8,
    color: "#202020",
    fontWeight: "bold",
  },
  uploadBtn: {
    backgroundColor: "#EEE",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 5,
    // marginTop: 20,
    marginBottom: 40
  },
});
