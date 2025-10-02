import PrimaryButton from "@/components/primaryButton";
import SecoundryButton from "@/components/secondaryButton";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

const recoveryOptions = [
  { id: "sms", label: "Via SMS",
    //  icon: require("../assets/images/SMS.png")
     },
  {
    id: "email",
    label: "Via Email",
    // icon: require("../assets/images/Email.png"),
  },
];

const RecoverPassword = () => {
  const [selected, setSelected] = useState<string | null>(null);

  const handleNext = () => {
    if (!selected) return alert("Please select a recovery method!");

    // Navigate to verification screen with the selected method
    router.push({
      pathname: "/verifycode",
      params: { method: selected },
    });
  };

  return (
    <View style={styles.container}>
      <Svg style={styles.midShape} viewBox="0 0 200 200">
        <Path
          fill="#DCE6FF"
          d="M47.7,-62.7C62.6,-52.5,77.1,-39.5,83.4,-22.4C89.7,-5.2,87.7,16,75.4,27.9C63.1,39.8,40.5,42.4,21.3,50.6C2,58.9,-13.8,72.9,-30.7,72.8C-47.7,72.8,-65.8,58.8,-75.8,40.3C-85.8,21.7,-87.7,-1.4,-78.7,-18.7C-69.7,-36,-49.9,-47.6,-32.1,-58.1C-14.3,-68.6,1.4,-78,18.8,-80.4C36.2,-82.7,55.2,-77.3,47.7,-62.7Z"
          transform="translate(100 100) scale(-1,1)" // flip horizontally
        />
      </Svg>

      <View style={styles.topShape}></View>

      <View style={styles.profileView}>
        <Image
          source={require("../assets/images/profile.png")}
          style={styles.profile}
        />
      </View>

      <Text style={styles.header}>Password Recovery</Text>

      <View style={styles.textview}>
        <Text style={styles.passwordtext}>How would you like to restore</Text>
        <Text style={styles.passwordtext}>your password?</Text>
      </View>

      <View style={styles.cardsview}>
        {recoveryOptions.map((option) => (
          <Pressable
            key={option.id}
            onPress={() => setSelected(option.id)}
            style={[
              styles.optionCard,
              selected === option.id && styles.optionSelected,
            ]}
          >
            {/* <Image
              source={option.icon}
              style={{ height: 40, width: 190, borderRadius: 20 }}
            /> */}
            <Text style={styles.optionLabel}>{option.label}</Text>
          </Pressable>
        ))}
      </View>

      <PrimaryButton title="Next" onPress={handleNext} />
      <SecoundryButton title="Cancel" onPress={() => router.back()} />
    </View>
  );
};

export default RecoverPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
    backgroundColor: "white",
    gap: 8,
    alignItems: "center",
  },
  topShape: {
    position: "absolute",
    top: -100,
    right: -70,
    width: 270,
    height: 270,
    backgroundColor: "#FA8232",
    borderBottomLeftRadius: 220,
    borderTopLeftRadius: 250,
    borderBottomRightRadius: 220,
  },
  midShape: {
    position: "absolute",
    width: 300,
    height: 300,
    top: -70,
    right: -25,
  },
  profile: {
    height: 100,
    width: 100,
  },
  profileView: {
    height: 110,
    width: 110,
    borderWidth: 10,
    borderColor: "white",
    borderRadius: 60,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    fontFamily: "Raleway",
    color: "#202020",
    fontWeight: "700",
    fontSize: 21,
    marginBottom: 10,
  },
  textview: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  passwordtext: {
    fontFamily: "Nunito Sans",
    color: "#202020",
    fontSize: 12,
    fontWeight: "300",
  },
  cardsview: {
    gap: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 130,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    padding: 10,
    borderRadius: 12,
    width: 220,
    justifyContent: "flex-start",
  },
  optionSelected: {
    borderWidth: 2,
    borderColor: "#FA8232",
    backgroundColor: "#FFF1E6",
  },
  optionLabel: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: "500",
    color: "#202020",
  },
});
