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

      // ✅ Use _method for Laravel/PHP frameworks that don't handle PUT FormData well
      formData.append("_method", "PUT");
      formData.append("f_name", profile.firstName);
      formData.append("l_name", profile.lastName);
      formData.append("email", profile.email);
      formData.append("phone", profile.phone);

      // ✅ Add logging to see what we're sending
      console.log("Sending profile data:", {
        f_name: profile.firstName,
        l_name: profile.lastName,
        email: profile.email,
        phone: profile.phone,
      });

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

      const response = await fetch(
        "https://yemi.store/api/v2/seller/seller-update",
        {
          method: "POST", // ✅ Changed from PUT to POST
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: formData,
        }
      );

      // ✅ FIX: Handle both string and JSON responses
      const responseText = await response.text();
      console.log("Profile update response:", responseText);
      console.log("Response status:", response.status);

      // Try to parse as JSON, fall back to treating as string
      let json;
      try {
        json = JSON.parse(responseText);
      } catch {
        json = { message: responseText };
      }

      // Check if response was successful (either by status code or success flag)
      if (response.ok || json.success || responseText.includes("success")) {
        const message = json.message || responseText || "Profile updated successfully";

        // ✅ Re-fetch profile from API to ensure we have the latest data
        try {
          const profileResponse = await fetch(API_URL, {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            console.log("Fetched updated profile:", profileData);

            const updatedProfile = {
              firstName: profileData.f_name || "",
              lastName: profileData.l_name || "",
              email: profileData.email || "",
              phone: profileData.phone || "",
              profileImage: profileData.image_full_url?.path || "",
              password: "",
              confirmPassword: "",
            };

            // Update state
            setProfile(updatedProfile);

            // Save to AsyncStorage
            await AsyncStorage.setItem("userProfile", JSON.stringify(updatedProfile));

            // Update seller_token (if it's a JSON object)
            const currentToken = await AsyncStorage.getItem("seller_token");
            if (currentToken) {
              try {
                // Try to parse as JSON (if it's an object)
                const tokenData = JSON.parse(currentToken);
                tokenData.f_name = profileData.f_name;
                tokenData.l_name = profileData.l_name;
                tokenData.email = profileData.email;
                tokenData.phone = profileData.phone;
                tokenData.image = profileData.image;
                await AsyncStorage.setItem("seller_token", JSON.stringify(tokenData));
              } catch (parseError) {
                // If it's just a plain token string, leave it as is
                console.log("seller_token is a plain string, not updating it");
              }
            }
          }
        } catch (refetchError) {
          console.error("Error refetching profile:", refetchError);
        }

        Alert.alert("Success", message);
      } else {
        Alert.alert("Error", json.message || responseText || "Failed to update profile");
      }
    } catch (error) {
      console.error("Update profile error:", error);
      Alert.alert("Error", "An unexpected error occurred");
    }
  };

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