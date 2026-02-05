import BankHeader from "@/components/Header";
import { useAuth } from "@/src/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BankInfoScreen = () => {
  const { userProfile, token, updateUserProfile } = useAuth();

  const [bankInfo, setBankInfo] = useState({
    holderName: "",
    bankName: "",
    branchName: "",
    accountNumber: "",
  });

  const [form, setForm] = useState(bankInfo);
  const [isEditing, setIsEditing] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [saving, setSaving] = useState(false);

  // ✅ Initialize bank info from userProfile on mount
  useEffect(() => {
    if (userProfile) {
      const info = {
        holderName: userProfile.holderName || "",
        bankName: userProfile.bankName || "",
        branchName: userProfile.branchName || "",
        accountNumber: userProfile.accountNumber || "",
      };
      setBankInfo(info);
      setForm(info);
    }
  }, [userProfile]);

  // Fetch bank info from server
  const fetchBankInfo = async () => {
    if (!token) return;

    setFetching(true);
    try {
      const response = await fetch(
        "https://yemi.store/api/v2/seller/seller-info",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      console.log("Bank info from API:", data); // Debug log

      const info = {
        holderName: data.holder_name || "",
        bankName: data.bank_name || "",
        branchName: data.branch || "",
        accountNumber: data.account_no || "",
      };

      console.log("Parsed bank info:", info); // Debug log

      // Update local state
      setBankInfo(info);
      setForm(info);

      // ✅ Only update bank fields in context
      await updateUserProfile(info);
    } catch (error: any) {
      console.log("Error fetching bank info:", error);
      Alert.alert("Error", error.message || "Failed to fetch bank info.");
    } finally {
      setFetching(false);
    }
  };

  // ✅ Only fetch if bank info is empty (first time)
  useEffect(() => {
    if (token && !bankInfo.holderName && !bankInfo.bankName) {
      fetchBankInfo();
    }
  }, [token]);

  // Save updated bank info
  const handleSaveBankInfo = async () => {
    if (!token || saving) return;

    setSaving(true);

    try {
      const payload = {
        f_name: userProfile.firstName,
        l_name: userProfile.lastName,
        email: userProfile.email,
        phone: userProfile.phone,

        bank_name: form.bankName,
        branch: form.branchName,
        account_no: form.accountNumber,
        holder_name: form.holderName,
      };

      console.log("Saving bank info payload:", payload); // Debug log

      const res = await fetch(
        "https://yemi.store/api/v2/seller/seller-update",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const text = await res.text();
      console.log("Save response:", text); // Debug log

      if (!text.includes("success")) {
        throw new Error(text);
      }

      // Update local state
      setBankInfo(form);
      setIsEditing(false);

      // ✅ Only update bank fields, preserve everything else
      await updateUserProfile(form);

      Alert.alert("Success", "Bank info updated successfully!");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to save bank info.");
    } finally {
      setSaving(false);
    }
  };

  if (fetching) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FA8232" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <BankHeader
        title="Bank Information"
        leftIcon="arrow-back"
        onLeftPress={() => router.back()}
      />

      {/* Card */}
      <View style={styles.card}>
        {!isEditing && (
          <Pressable
            style={styles.editButton}
            onPress={() => setIsEditing(true)}
          >
            <Ionicons name="pencil" size={16} color="#fff" />
            <Text style={styles.editText}>Edit</Text>
          </Pressable>
        )}

        {!isEditing ? (
          <>
            <View style={styles.row}>
              <Ionicons name="person" size={18} color="#333" />
              <Text style={styles.label}>
                Holder Name: <Text style={styles.value}>{bankInfo.holderName || "Not set"}</Text>
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>
                Bank Name: <Text style={styles.value}>{bankInfo.bankName || "Not set"}</Text>
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>
                Branch Name: <Text style={styles.value}>{bankInfo.branchName || "Not set"}</Text>
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>
                Account Number: <Text style={styles.value}>{bankInfo.accountNumber || "Not set"}</Text>
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.formContainer}>
            <Text style={styles.inputLabel}>Holder Name</Text>
            <TextInput
              style={styles.input}
              value={form.holderName}
              onChangeText={(text) => setForm({ ...form, holderName: text })}
            />

            <Text style={styles.inputLabel}>Bank Name</Text>
            <TextInput
              style={styles.input}
              value={form.bankName}
              onChangeText={(text) => setForm({ ...form, bankName: text })}
            />

            <Text style={styles.inputLabel}>Branch Name</Text>
            <TextInput
              style={styles.input}
              value={form.branchName}
              onChangeText={(text) => setForm({ ...form, branchName: text })}
            />

            <Text style={styles.inputLabel}>Account Number</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={form.accountNumber}
              onChangeText={(text) => setForm({ ...form, accountNumber: text })}
            />

            <View style={styles.buttonRow}>
              <Pressable
                style={styles.saveButton}
                onPress={handleSaveBankInfo}
                disabled={saving}
              >
                <Text style={styles.saveButtonText}>
                  {saving ? "Saving..." : "Save"}
                </Text>
              </Pressable>

              <Pressable
                style={styles.cancelButton}
                onPress={() => {
                  setForm({ ...bankInfo }); // revert changes
                  setIsEditing(false);
                }}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default BankInfoScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  card: {
    backgroundColor: "#E8F1FF",
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderRadius: 30,
    margin: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    overflow: "hidden",
  },
  editButton: {
    position: "absolute",
    top: 15,
    right: 15,
    flexDirection: "row",
    backgroundColor: "#FA8232",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
    zIndex: 1,
  },
  editText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 16, marginTop: 10 },
  label: { fontSize: 15, color: "#333", fontWeight: "600", marginLeft: 8 },
  value: { fontWeight: "700", color: "#111" },
  formContainer: { marginTop: 10 },
  inputLabel: { fontSize: 14, fontWeight: "600", marginTop: 10, color: "#333" },
  input: { backgroundColor: "#FFF", padding: 12, borderRadius: 8, marginTop: 5, borderWidth: 1, borderColor: "#E0E0E0" },
  buttonRow: { flexDirection: "row", marginTop: 20, justifyContent: "space-between", gap: 10 },
  saveButton: { flex: 1, backgroundColor: "#FA8232", paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, alignItems: "center" },
  saveButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  cancelButton: { flex: 1, backgroundColor: "#DC3545", paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, alignItems: "center" },
  cancelButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});