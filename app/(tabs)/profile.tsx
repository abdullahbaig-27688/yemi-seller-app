import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";

const Profile = () => {
  const router = useRouter();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    profileImage: "",
  });

  useEffect(() => {
    // Load profile from AsyncStorage or API
    const loadProfile = async () => {
      try {
        const storedProfile = await AsyncStorage.getItem("userProfile");
        if (storedProfile) setProfile(JSON.parse(storedProfile));
      } catch (error) {
        console.log("Error loading profile:", error);
      }
    };
    loadProfile();
  }, []);

  const handleChooseImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.cancelled) {
      setProfile({ ...profile, profileImage: result.uri });
    }
  };

  const handleSave = async () => {
    try {
      await AsyncStorage.setItem("userProfile", JSON.stringify(profile));
      Alert.alert("Success", "Profile updated successfully");
      // TODO: Call backend API to save profile
    } catch (error) {
      Alert.alert("Error", "Failed to save profile");
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace("/loginScreen"); // Navigate to login
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable onPress={handleChooseImage}>
        <Image
          source={
            profile.profileImage
              ? { uri: profile.profileImage }
              : require("@/assets/images/profile.png")
          }
          style={styles.profileImage}
        />
        <Text style={styles.changePhotoText}>Change Photo</Text>
      </Pressable>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={profile.name}
          onChangeText={(text) => setProfile({ ...profile, name: text })}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={profile.email}
          onChangeText={(text) => setProfile({ ...profile, email: text })}
          keyboardType="email-address"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={styles.input}
          value={profile.phone}
          onChangeText={(text) => setProfile({ ...profile, phone: text })}
          keyboardType="phone-pad"
        />
      </View>

      <Pressable style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </Pressable>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </Pressable>
    </ScrollView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    flexGrow: 1,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  changePhotoText: {
    color: "#0D47A1",
    marginBottom: 20,
    fontWeight: "bold",
  },
  inputGroup: {
    width: "100%",
    marginBottom: 15,
  },
  label: {
    marginBottom: 5,
    fontWeight: "bold",
    color: "#333",
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  saveButton: {
    backgroundColor: "#0D47A1",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "#B00020",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginTop: 15,
  },
  logoutButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
