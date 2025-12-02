import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BankHeader from "@/components/Header";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";

const BankInfoScreen = () => {
  const [bankInfo, setBankInfo] = useState({
    holderName: "",
    bankName: "",
    branchName: "",
    accountNumber: "",
  });
  const [form, setForm] = useState(bankInfo);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Fetch bank info from server
  const fetchBankInfo = async () => {
    setFetching(true);
    try {
      const token = await AsyncStorage.getItem("seller_token");
      if (!token) throw new Error("No auth token found. Please login again.");

      const response = await fetch(
        "https://yemi.store/api/v2/seller/seller-info",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();

      const info = {
        holderName: data.holder_name || "",
        bankName: data.bank_name || "",
        branchName: data.branch || "",
        accountNumber: data.account_no || "",
      };

      setBankInfo(info);
      setForm(info); // sync form with fetched data
    } catch (error) {
      console.log("Error fetching bank info:", error);
      Alert.alert("Error", error.message || "Failed to fetch bank info.");
    }
    setFetching(false);
  };

  useEffect(() => {
    fetchBankInfo();
  }, []);

  // Save updated bank info
  const handleSave = async () => {
    if (loading) return; // block double-click
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("seller_token");
      if (!token) throw new Error("No auth token found. Please login again.");

      const response = await fetch(
        "https://yemi.store/api/v2/seller/seller-update",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            bank_name: form.bankName,
            branch: form.branchName,
            account_no: form.accountNumber,
            holder_name: form.holderName,
          }),
        }
      );

      const text = await response.text();
      console.log("Raw API response:", text);

      const cleanText = text.replace(/^"|"$/g, "").trim();
      if (cleanText === "Info updated successfully!") {
        // ✅ Optimistic UI update
        setBankInfo({ ...form });
        setIsEditing(false);
        Alert.alert("Success", "Bank info updated successfully!");
      } else {
        Alert.alert("Error", cleanText || "Failed to update bank info.");
      }
    } catch (error) {
      console.log("Error updating bank info:", error);
      Alert.alert("Error", error.message || "Something went wrong. Try again.");
    }
    setLoading(false);
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
        onLeftPress={() => setIsEditing(false)}
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
                Holder Name:{" "}
                <Text style={styles.value}>{bankInfo.holderName}</Text>
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>
                Bank Name: <Text style={styles.value}>{bankInfo.bankName}</Text>
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>
                Branch Name:{" "}
                <Text style={styles.value}>{bankInfo.branchName}</Text>
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>
                Account Number:{" "}
                <Text style={styles.value}>{bankInfo.accountNumber}</Text>
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
              {/* Save Button */}
              <Pressable
                style={styles.saveButton}
                onPress={handleSave}
                disabled={loading}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? "Saving..." : "Save"}
                </Text>
              </Pressable>

              {/* Cancel Button */}
              <Pressable
                style={styles.cancelButton}
                onPress={() => {
                  setForm({ ...bankInfo }); // revert changes
                  setIsEditing(false);
                }}
                disabled={loading}
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
    borderRadius: 30,
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
    zIndex: 1, // make sure it stays on top
  },
  editText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 60,
  },
  label: { fontSize: 15, color: "#333", fontWeight: "600" },
  value: { fontWeight: "700", color: "#111" },
  formContainer: { marginTop: 10 },
  inputLabel: { fontSize: 14, fontWeight: "600", marginTop: 10 },
  input: {
    backgroundColor: "#F0F0F0",
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "space-between",
  },
  saveButton: {
    backgroundColor: "#FA8232",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  saveButtonText: { color: "#fff", fontWeight: "700" },
  cancelButton: {
    backgroundColor: "#DC3545",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cancelButtonText: { color: "#fff", fontWeight: "700" },
});
