import PrimaryButton from "@/components/primaryButton";
import SecoundryButton from "@/components/secondaryButton";
import { Image } from "expo-image";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

const getStarted = () => {
  return (
    <View style={styles.container}>
      {/* Background SVG Shapes */}
      <Svg style={styles.topShape} viewBox="0 0 200 200">
        <Path
          fill="#DCE6FF"
          d="M47.7,-62.7C62.6,-52.5,77.1,-39.5,83.4,-22.4C89.7,-5.2,87.7,16,75.4,27.9C63.1,39.8,40.5,42.4,21.3,50.6C2,58.9,-13.8,72.9,-30.7,72.8C-47.7,72.8,-65.8,58.8,-75.8,40.3C-85.8,21.7,-87.7,-1.4,-78.7,-18.7C-69.7,-36,-49.9,-47.6,-32.1,-58.1C-14.3,-68.6,1.4,-78,18.8,-80.4C36.2,-82.7,55.2,-77.3,47.7,-62.7Z"
          transform="translate(100 100)"
        />
      </Svg>

      <Svg style={styles.rightShape} viewBox="0 0 200 200">
        <Path
          fill="#FA8232"
          d="M47.7,-62.7C62.6,-52.5,77.1,-39.5,83.4,-22.4C89.7,-5.2,87.7,16,75.4,27.9C63.1,39.8,40.5,42.4,21.3,50.6C2,58.9,-13.8,72.9,-30.7,72.8C-47.7,72.8,-65.8,58.8,-75.8,40.3C-85.8,21.7,-87.7,-1.4,-78.7,-18.7C-69.7,-36,-49.9,-47.6,-32.1,-58.1C-14.3,-68.6,1.4,-78,18.8,-80.4C36.2,-82.7,55.2,-77.3,47.7,-62.7Z"
          transform="translate(100 100)"
        />
      </Svg>

      {/* Logo */}

      {/* <View style={{ backgroundColor: "red" }}> */}

      {/* <Text> */}
      <Image
        source={require("../assets/images/splash.png")}
        style={styles.yemiLogo}
        contentFit="contain"
      />
      {/* </Text> */}

      {/* <Text style={styles.logo}>yemi</Text> */}

      {/* Tagline */}
      <View>
        <Text style={styles.title}>“Shop Smart. Shop Yemi.”</Text>
      </View>

      {/* </View> */}

      {/* Secondary Button with Arrow */}
      <View style={styles.mainview}>
        {/* Primary Button */}
        <PrimaryButton
          title="Let's get started"
          onPress={() => router.navigate("../registerScreen")}
          variant="primary"
          fullWidth // ✅ take full width vertically


        />

        <View style={styles.buttonRow}>
          <SecoundryButton
            title="I already have an account"
            onPress={() => router.navigate("../loginScreen")}
          />

          <Image
            source={require("../assets/images/Button.png")}
            style={styles.arrowIcon}
          />
        </View>
      </View>
    </View>
  );
};

export default getStarted;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,

    backgroundColor: "white",
  },

  // Background Shapes
  topShape: {
    position: "absolute",
    width: 280,
    height: 280,
    top: -90,
    left: -65,
  },
  rightShape: {
    position: "absolute",
    width: 200,
    height: 300,
    top: 120,
    right: -90,
    transform: [{ rotate: "140deg" }],
  },

  yemiLogo: {
    height: 200,
    width: 200,
    resizeMode: "center",
    alignSelf: "center",
    // paddingTop: 10,
    // backgroundColor: "green",
    marginTop: "70%",
  },
  logo: {
    fontSize: 64,
    fontWeight: "bold",
    color: "#ff7a00", // orange
    marginBottom: 20,
  },

  // Tagline
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#202020",
    alignSelf: "center",
    marginBottom: "30%",
  },

  // Secondary Button Row
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  arrowIcon: {
    height: 20,
    width: 20,
    marginLeft: 8,
    marginTop: 10,
  },

  mainview: {
    gap: 10,
    marginBottom: 15,
    width: "100%",
  },
});
function RFValue(arg0: string): any {
  throw new Error("Function not implemented.");
}
