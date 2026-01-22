import ProfileHeader from "@/components/Header";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const API_URL = "https://yemi.store/api/v2/seller/seller-info";

const Profile = () => {
  const router = useRouter();
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    profileImage: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // 1. Get the token from AsyncStorage
        const token = await AsyncStorage.getItem("seller_token");

        if (!token) {
          console.warn("No token found");
          setLoading(false);
          return;
        }

        // 2. Fetch profile from API with Authorization header
        const response = await fetch(API_URL, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();

          // 3. Map API fields to state
          const updatedProfile = {
            firstName: data.f_name || "",
            lastName: data.l_name || "",
            email: data.email || "",
            phone: data.phone || "",
            profileImage: data.image_full_url?.path || "",
            password: "",
            confirmPassword: "",
          };

          setProfile(updatedProfile);

          // 4. Save profile locally
          await AsyncStorage.setItem(
            "userProfile",
            JSON.stringify(updatedProfile)
          );
        } else {
          console.warn("Failed to fetch profile:", response.status);
        }
      } catch (err) {
        console.log("Error loading profile:", err);
      } finally {
        setLoading(false);
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
    if (profile.password && profile.password !== profile.confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("seller_token");
      if (!token) {
        Alert.alert("Error", "No authentication token found");
        return;
      }

      const formData = new FormData();
      formData.append("f_name", profile.firstName);
      formData.append("l_name", profile.lastName);
      formData.append("email", profile.email);
      formData.append("phone", profile.phone);

      if (profile.password) {
        formData.append("password", profile.password);
      }

      if (profile.profileImage && profile.profileImage.startsWith("file")) {
        const filename = profile.profileImage.split("/").pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image";

        formData.append("image", {
          uri: profile.profileImage,
          name: filename,
          type,
        });
      }

      // ✅ Remove manual Content-Type
      const response = await fetch(
        "https://yemi.store/api/v2/seller/seller-update",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: formData,
        }
      );

      const json = await response.json();
      console.log("Profile update response:", json);

      if (json.success) {
        Alert.alert("Success", json.message || "Profile updated successfully");
        await AsyncStorage.setItem("userProfile", JSON.stringify(profile));
      } else {
        Alert.alert("Error", json.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Update profile error:", error);
      Alert.alert("Error", "An unexpected error occurred");
    }
  };


  // const handleSave = async () => {
  //   if (profile.password && profile.password !== profile.confirmPassword) {
  //     Alert.alert("Error", "Passwords do not match");
  //     return;
  //   }

  //   try {
  //     await AsyncStorage.setItem("userProfile", JSON.stringify(profile));
  //     Alert.alert("Success", "Profile saved locally");
  //     // TODO: Send updated profile and password to backend
  //   } catch (error) {
  //     Alert.alert("Error", "Failed to save profile");
  //   }
  // };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Loading profile…</Text>
      </View>
    );
  }

  return (
    <SafeAreaView>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingBottom: 100 }]}
      >
        {/* Basic Information Section */}
        {/* <Text style={styles.sectionTitle}>Basic Information</Text> */}
        <ProfileHeader
          title="Basic Information"
          leftIcon="arrow-back"
          onLeftPress={() => router.back()}
        />

        <View style={styles.content}>
          <Pressable onPress={handleChooseImage} style={styles.imageWrapper}>
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
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              value={profile.firstName}
              onChangeText={(text) =>
                setProfile({ ...profile, firstName: text })
              }
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              value={profile.lastName}
              onChangeText={(text) =>
                setProfile({ ...profile, lastName: text })
              }
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

          {/* Change Password Section */}
          <Text style={styles.sectionTitle}>Change Password</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={profile.password}
              onChangeText={(text) =>
                setProfile({ ...profile, password: text })
              }
              secureTextEntry={true}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              value={profile.confirmPassword}
              onChangeText={(text) =>
                setProfile({ ...profile, confirmPassword: text })
              }
              secureTextEntry={true}
            />
          </View>

          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: { backgroundColor: "#f5f5f5", flexGrow: 1 },
  content: { padding: 20 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginVertical: 10,
  },
  imageWrapper: { alignItems: "center", marginBottom: 20 },
  profileImage: { width: 120, height: 120, borderRadius: 60, marginBottom: 10 },
  changePhotoText: { color: "#0D47A1", marginBottom: 20, fontWeight: "bold" },
  inputGroup: { width: "100%", marginBottom: 15 },
  label: { marginBottom: 5, fontWeight: "bold", color: "#333" },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  saveButton: {
    backgroundColor: "#FA8232",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: { color: "#fff", fontWeight: "bold" },
});
