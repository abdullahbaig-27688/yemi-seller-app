import Input from "@/components/input";
import PrimaryButton from "@/components/primaryButton";
import SecondaryButton from "@/components/secondaryButton";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
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

  const handleSignup = async () => {
    console.log("Email:", email, "Password:", password);
    console.log("First Name:", firstName, "Last Name:", lastName);
    console.log("CountryCode:", countryCode, "Phone:", phone);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("f_name", firstName);
      formData.append("l_name", lastName);
      formData.append("phone", phone);

      const response = await axios.post(
        "https://yemiecom.infolaravel.news/api/v1/auth/register",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.data) {
        console.log("Response:", response.data);
        Alert.alert("Success", "Account created successfully!", [
          {
            text: "OK",
            onPress: () =>
              router.replace({
                pathname: "/loginscreen", // 👈 navigate to verifyaccount screen
                params: { phone, email }, // 👈 pass phone & email to verification
              }), // 👈 go to login
          },
        ]);
      }

      console.log("Response:", response.data);
    } catch (error: any) {
      console.error("Error:", error.response?.data || error.message);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Something went wrong"
      );
    }
  };

  return (
    <View style={styles.container}>
      <Svg style={styles.toShape} viewBox="0 0 200 200">
        <Path
          fill="#DCE6FF" // Light blue shape
          d="M47.7,-62.7C62.6,-52.5,77.1,-39.5,83.4,-22.4C89.7,-5.2,87.7,16,75.4,27.9C63.1,39.8,40.5,42.4,21.3,50.6C2,58.9,-13.8,72.9,-30.7,72.8C-47.7,72.8,-65.8,58.8,-75.8,40.3C-85.8,21.7,-87.7,-1.4,-78.7,-18.7C-69.7,-36,-49.9,-47.6,-32.1,-58.1C-14.3,-68.6,1.4,-78,18.8,-80.4C36.2,-82.7,55.2,-77.3,47.7,-62.7Z"
          transform="translate(100 100)"
        />
      </Svg>

      <Svg style={styles.midShape} viewBox="0 0 200 200">
        <Path
          fill="#FA8232" // Light blue shape
          d="M47.7,-62.7C62.6,-52.5,77.1,-39.5,83.4,-22.4C89.7,-5.2,87.7,16,75.4,27.9C63.1,39.8,40.5,42.4,21.3,50.6C2,58.9,-13.8,72.9,-30.7,72.8C-47.7,72.8,-65.8,58.8,-75.8,40.3C-85.8,21.7,-87.7,-1.4,-78.7,-18.7C-69.7,-36,-49.9,-47.6,-32.1,-58.1C-14.3,-68.6,1.4,-78,18.8,-80.4C36.2,-82.7,55.2,-77.3,47.7,-62.7Z"
          transform="translate(100 100)"
        />
      </Svg>

      <Text style={styles.title}> Create Account </Text>

      {/* <Image
        source={require("../assets/images/camera.png")}
        style={styles.camera}
      /> */}

      <View style={styles.mainview}>
        {/* Email Password */}
        <View style={styles.inputview}>
          <Input
            placeholder="Enter Email"
            value={email}
            onChangeText={setEmail}
          />
        </View>
        {/* Password Feild */}
        <View style={styles.inputview}>
          <Input
            placeholder="Enter Password"
            value={password}
            onChangeText={setPassword}
          />

          <Ionicons name="eye-off-outline" size={22} color="black" />
        </View>
        {/* First Name Field */}
        <View style={styles.inputview}>
          <Input
            placeholder="Enter First Name"
            value={firstName}
            onChangeText={setFirstName}
          />
        </View>

        {/* Last Name Field */}
        <View style={styles.inputview}>
          <Input
            placeholder="Enter Last Name"
            value={lastName}
            onChangeText={setLastName}
          />
        </View>

        <View style={styles.inputview}>
          <CountryPicker
            countryCode={countryCode}
            callingCode={callingCode}
            withFlag
            withCallingCode
            withFilter
            withEmoji
            onSelect={(country) => {
              setCountryCode(country.cca2);
              setCallingCode(country.callingCode[0]);
            }}
          />
          {/* Show the country code */}
          <Text style={styles.countryCode}>+{callingCode}</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your Number"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            placeholderTextColor="#aaa"
          />
        </View>
      </View>

      <View style={styles.mainview}>
        <PrimaryButton title="Next" onPress={handleSignup} />
        <SecondaryButton
          title="Cancel"
          onPress={() => router.replace("/getStarted")}
        />
      </View>
    </View>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
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
    fontSize: 50,
    fontWeight: 700,
    color: "#202020",
    marginBottom: 20,
  },
  camera: {
    height: 70,
    width: 70,
    marginHorizontal: 16,
    marginVertical: 35,
  },

  mainview: {
    gap: 10,
    marginBottom: 15,
    width: "100%",
  },

  inputview: {
    backgroundColor: "#F8F8F8",
    width: "100%",
    height: 50,
    borderRadius: 40,
    paddingVertical: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },

  contactview: {
    backgroundColor: "#F8F8F8",
    width: "100%",
    height: 50,
    borderRadius: 40,
    paddingVertical: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    marginBottom: 30,
  },
  countryCode: {
    fontSize: 16,
    marginRight: 8,
    color: "#202020",
    fontWeight: "bold",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  Cancel: {
    fontSize: 14,
    marginTop: 10,
    alignSelf: "center",
    zIndex: 1,
  },
});
