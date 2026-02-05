import ProfileHeader from "@/components/Header";
import { useAuth } from "@/src/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
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
  const { token, logout, userProfile, setUserProfile } = useAuth();
  // const [form, setForm] = useState(userProfile)
  const router = useRouter();
  // ✅ Initialize form with all fields including defaults
  const [form, setForm] = useState({
    firstName: userProfile?.firstName || "",
    lastName: userProfile?.lastName || "",
    email: userProfile?.email || "",
    phone: userProfile?.phone || "",
    profileImage: userProfile?.profileImage || "",
    holderName: userProfile?.holderName || "",
    bankName: userProfile?.bankName || "",
    branchName: userProfile?.branchName || "",
    accountNumber: userProfile?.accountNumber || "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);


  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const imageScaleAnim = useRef(new Animated.Value(0)).current;
  const profileImagePulse = useRef(new Animated.Value(1)).current;


  // ✅ Sync form with userProfile whenever it changes
  useEffect(() => {
    if (userProfile) {
      setForm({
        firstName: userProfile.firstName || "",
        lastName: userProfile.lastName || "",
        email: userProfile.email || "",
        phone: userProfile.phone || "",
        profileImage: userProfile.profileImage || "",
        holderName: userProfile.holderName || "",
        bankName: userProfile.bankName || "",
        branchName: userProfile.branchName || "",
        accountNumber: userProfile.accountNumber || "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [userProfile]);
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

            // ✅ ADD BANK FIELDS FROM API
            holderName: data.holder_name || "",
            bankName: data.bank_name || "",
            branchName: data.branch || "",
            accountNumber: data.account_no || "",

            password: "",
            confirmPassword: "",
          };

          await setUserProfile(updatedProfile);

          // ✅ Remove AsyncStorage - only use SecureStore via context
          // Don't save here, let the context handle it

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
  }, [token]);

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
      // setUserProfile({ ...userProfile, profileImage: result.assets[0].uri });
      setForm({ ...form, profileImage: result.assets[0].uri });
    }
  };
  const handleSaveProfile = async () => {
    if (saving) return;
    setSaving(true);

    try {
      // ✅ Merge form with existing userProfile to preserve ALL fields
      const updatedData = { ...userProfile, ...form };

      const payload = {
        // f_name: updatedData.firstName,
        // l_name: updatedData.lastName,
        // email: updatedData.email,
        // phone: updatedData.phone,

        // // ✅ Preserve bank fields
        // bank_name: updatedData.bankName || "",
        // branch: updatedData.branchName || "",
        // account_no: updatedData.accountNumber || "",
        // holder_name: updatedData.holderName || "",

        f_name: form.firstName,
        l_name: form.lastName,
        email: form.email,
        phone: form.phone,
        // ✅ Include bank fields from form
        bank_name: form.bankName || "",
        branch: form.branchName || "",
        account_no: form.accountNumber || "",
        holder_name: form.holderName || "",
      };

      const response = await fetch(
        "https://yemi.store/api/v2/seller/seller-update",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error("Update failed");

      // ✅ Update context with merged data (includes bank fields)
      await setUserProfile(form);

      // ✅ Remove AsyncStorage line - context handles SecureStore
      // await AsyncStorage.setItem("userProfile", JSON.stringify(form))

      Alert.alert("Success", "Profile updated successfully");
    } catch (err: any) {
      Alert.alert("Error", err.message);
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
                        form.profileImage
                          ? { uri: form.profileImage }
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
                {form.firstName || form.lastName
                  ? `${form.firstName} ${form.lastName}`.trim()
                  : "Complete Your Profile"}
              </Text>
              <Text style={styles.profileEmail}>{form.email}</Text>

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
                value={form.firstName}
                onChangeText={(text) =>
                  setForm({ ...form, firstName: text })
                }
                icon="person-outline"
                placeholder="Enter your first name"
              />

              <AnimatedInput
                label="Last Name"
                value={form.lastName}
                onChangeText={(text) =>
                  setForm({ ...form, lastName: text })
                }
                icon="person-outline"
                placeholder="Enter your last name"
              />

              <AnimatedInput
                label="Email Address"
                value={form.email}
                onChangeText={(text) => setForm({ ...form, email: text })}
                icon="mail-outline"
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <AnimatedInput
                label="Phone Number"
                value={form.phone}
                onChangeText={(text) => setForm({ ...form, phone: text })}
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
                value={form.password}
                onChangeText={(text) =>
                  setForm({ ...form, password: text })
                }
                icon="lock-closed-outline"
                placeholder="Enter new password"
                secureTextEntry={true}
              />

              <AnimatedInput
                label="Confirm New Password"
                value={form.confirmPassword}
                onChangeText={(text) =>
                  setForm({ ...form, confirmPassword: text })
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
            onPress={handleSaveProfile}
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