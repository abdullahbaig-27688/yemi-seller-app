import ProfileHeader from "@/components/Header";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const API_URL = "https://yemi.store/api/v2/seller/seller-info";

/* ---------------- ANIMATED INPUT COMPONENT ---------------- */
const AnimatedInput = ({ label, value, onChangeText, icon, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.spring(focusAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.spring(focusAnim, {
      toValue: 0,
      friction: 3,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#E0E0E0", "#FA8232"],
  });

  return (
    <View style={styles.inputGroup}>
      <View style={styles.labelContainer}>
        {icon && <Ionicons name={icon} size={16} color="#666" />}
        <Text style={styles.label}>{label}</Text>
      </View>
      <Animated.View style={[styles.inputWrapper, { borderColor }]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor="#999"
          {...props}
        />
      </Animated.View>
    </View>
  );
};

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
  const [saving, setSaving] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const imageScaleAnim = useRef(new Animated.Value(0)).current;
  const profileImagePulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(imageScaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          delay: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Subtle pulse animation for profile image
      Animated.loop(
        Animated.sequence([
          Animated.timing(profileImagePulse, {
            toValue: 1.03,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(profileImagePulse, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [loading]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = await AsyncStorage.getItem("seller_token");

        if (!token) {
          console.warn("No token found");
          setLoading(false);
          return;
        }

        const response = await fetch(API_URL, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();

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

          await AsyncStorage.setItem(
            "userProfile",
            JSON.stringify(updatedProfile)
          );

          if (!data.f_name && !data.l_name) {
            Alert.alert(
              "Complete Your Profile",
              "Please add your name to complete your profile.",
              [{ text: "OK" }]
            );
          }
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
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera roll permissions to change your profile photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      setProfile({ ...profile, profileImage: result.assets[0].uri });
    }
  };

  const handleSave = async () => {
    if (profile.password && profile.password !== profile.confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (!profile.firstName.trim() || !profile.lastName.trim()) {
      Alert.alert("Error", "First name and last name are required");
      return;
    }

    try {
      setSaving(true);
      const token = await AsyncStorage.getItem("seller_token");
      if (!token) {
        Alert.alert("Error", "No authentication token found");
        return;
      }

      const formData = new FormData();

      formData.append("_method", "PUT");
      formData.append("f_name", profile.firstName);
      formData.append("l_name", profile.lastName);
      formData.append("email", profile.email);
      formData.append("phone", profile.phone);

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
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: formData,
        }
      );

      const responseText = await response.text();
      console.log("Profile update response:", responseText);
      console.log("Response status:", response.status);

      let json;
      try {
        json = JSON.parse(responseText);
      } catch {
        json = { message: responseText };
      }

      if (response.ok || json.success || responseText.includes("success")) {
        const message = json.message || responseText || "Profile updated successfully";

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

            setProfile(updatedProfile);

            await AsyncStorage.setItem("userProfile", JSON.stringify(updatedProfile));

            const currentToken = await AsyncStorage.getItem("seller_token");
            if (currentToken) {
              try {
                const tokenData = JSON.parse(currentToken);
                tokenData.f_name = profileData.f_name;
                tokenData.l_name = profileData.l_name;
                tokenData.email = profileData.email;
                tokenData.phone = profileData.phone;
                tokenData.image = profileData.image;
                await AsyncStorage.setItem("seller_token", JSON.stringify(tokenData));
              } catch (parseError) {
                console.log("seller_token is a plain string, not updating it");
              }
            }
          }
        } catch (refetchError) {
          console.error("Error refetching profile:", refetchError);
        }

        Alert.alert("Success", message, [
          {
            text: "OK",
            onPress: () => {
              // Clear password fields after successful save
              setProfile(prev => ({
                ...prev,
                password: "",
                confirmPassword: "",
              }));
            },
          },
        ]);
      } else {
        Alert.alert("Error", json.message || responseText || "Failed to update profile");
      }
    } catch (error) {
      console.error("Update profile error:", error);
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <LinearGradient
          colors={["#FA8232", "#FF6B35"]}
          style={styles.loadingGradient}
        >
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <LinearGradient
        colors={["#FA8232", "#FF6B35"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          android_ripple={{ color: "#FFFFFF40", radius: 20 }}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </Pressable>
        <ProfileHeader title="My Profile" />
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Profile Image Section */}
          <View style={styles.profileSection}>
            <LinearGradient
              colors={["#FFF", "#F8F9FA"]}
              style={styles.profileCard}
            >
              <Animated.View
                style={[
                  styles.imageContainer,
                  { transform: [{ scale: imageScaleAnim }] },
                ]}
              >
                <Pressable onPress={handleChooseImage} style={styles.imageWrapper}>
                  <Animated.View
                    style={[
                      styles.imageCircle,
                      { transform: [{ scale: profileImagePulse }] },
                    ]}
                  >
                    <Image
                      source={
                        profile.profileImage
                          ? { uri: profile.profileImage }
                          : require("@/assets/images/profile.png")
                      }
                      style={styles.profileImage}
                    />
                    <LinearGradient
                      colors={["#FA8232", "#FF6B35"]}
                      style={styles.cameraButton}
                    >
                      <Ionicons name="camera" size={20} color="#FFF" />
                    </LinearGradient>
                  </Animated.View>
                </Pressable>
              </Animated.View>

              <Text style={styles.profileName}>
                {profile.firstName || profile.lastName
                  ? `${profile.firstName} ${profile.lastName}`.trim()
                  : "Complete Your Profile"}
              </Text>
              <Text style={styles.profileEmail}>{profile.email}</Text>

              <Pressable onPress={handleChooseImage} style={styles.changePhotoButton}>
                <Ionicons name="images-outline" size={18} color="#FA8232" />
                <Text style={styles.changePhotoText}>Change Profile Photo</Text>
              </Pressable>
            </LinearGradient>
          </View>

          {/* Basic Information Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person-outline" size={22} color="#FA8232" />
              <Text style={styles.sectionTitle}>Basic Information</Text>
            </View>

            <View style={styles.card}>
              <AnimatedInput
                label="First Name"
                value={profile.firstName}
                onChangeText={(text) =>
                  setProfile({ ...profile, firstName: text })
                }
                icon="person-outline"
                placeholder="Enter your first name"
              />

              <AnimatedInput
                label="Last Name"
                value={profile.lastName}
                onChangeText={(text) =>
                  setProfile({ ...profile, lastName: text })
                }
                icon="person-outline"
                placeholder="Enter your last name"
              />

              <AnimatedInput
                label="Email Address"
                value={profile.email}
                onChangeText={(text) => setProfile({ ...profile, email: text })}
                icon="mail-outline"
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <AnimatedInput
                label="Phone Number"
                value={profile.phone}
                onChangeText={(text) => setProfile({ ...profile, phone: text })}
                icon="call-outline"
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Change Password Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="lock-closed-outline" size={22} color="#FA8232" />
              <Text style={styles.sectionTitle}>Security</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.infoBox}>
                <Ionicons name="information-circle-outline" size={20} color="#FA8232" />
                <Text style={styles.infoText}>
                  Leave password fields empty to keep your current password
                </Text>
              </View>

              <AnimatedInput
                label="New Password"
                value={profile.password}
                onChangeText={(text) =>
                  setProfile({ ...profile, password: text })
                }
                icon="lock-closed-outline"
                placeholder="Enter new password"
                secureTextEntry={true}
              />

              <AnimatedInput
                label="Confirm New Password"
                value={profile.confirmPassword}
                onChangeText={(text) =>
                  setProfile({ ...profile, confirmPassword: text })
                }
                icon="lock-closed-outline"
                placeholder="Confirm new password"
                secureTextEntry={true}
              />
            </View>
          </View>

          {/* Save Button */}
          <Pressable
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            <LinearGradient
              colors={saving ? ["#FFC09F", "#FFB088"] : ["#FA8232", "#FF6B35"]}
              style={styles.saveButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {saving ? (
                <>
                  <ActivityIndicator size="small" color="#FFF" />
                  <Text style={styles.saveButtonText}>Saving...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={22} color="#FFF" />
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </>
              )}
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#FFF",
    fontWeight: "600",
  },

  /* Header */
  header: {
    paddingVertical: 16,
    paddingTop: Platform.OS === "ios" ? 0 : 16,
    alignItems: "center",
    elevation: 8,
    shadowColor: "#FA8232",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  backButton: {
    position: "absolute",
    left: 16,
    top: Platform.OS === "ios" ? 10 : 45,
    padding: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    zIndex: 10,
  },

  /* Content */
  scrollContent: {
    paddingBottom: 100,
  },
  content: {
    padding: 20,
  },

  /* Profile Section */
  profileSection: {
    marginBottom: 24,
  },
  profileCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  imageContainer: {
    marginBottom: 16,
  },
  imageWrapper: {
    position: "relative",
  },
  imageCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: "hidden",
    borderWidth: 4,
    borderColor: "#FFF",
    shadowColor: "#FA8232",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  cameraButton: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1A1A1A",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  profileEmail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  changePhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#FFF5F0",
    borderWidth: 1,
    borderColor: "#FA8232",
  },
  changePhotoText: {
    color: "#FA8232",
    fontSize: 14,
    fontWeight: "600",
  },

  /* Sections */
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    letterSpacing: -0.3,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },

  /* Info Box */
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFF5F0",
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FFE4D6",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },

  /* Input Styles */
  inputGroup: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    letterSpacing: -0.2,
  },
  inputWrapper: {
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: "#F8F9FA",
    overflow: "hidden",
  },
  input: {
    padding: 16,
    fontSize: 16,
    color: "#1A1A1A",
  },

  /* Save Button */
  saveButton: {
    marginTop: 10,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#FA8232",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  saveButtonGradient: {
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});