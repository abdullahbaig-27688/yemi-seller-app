import OrderSetupHeader from "@/components/Header";
import Input from "@/components/input";
import { useAuth } from "@/src/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as DocumentPicker from "expo-document-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const OtherSetup = () => {
  const { token } = useAuth();
  const [reorderLevel, setReorderLevel] = useState("");
  const [tin, setTin] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tinFile, setTinFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

  // 📌 Pick TIN Certificate
  const pickTinCertificate = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["image/*", "application/pdf"],
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const file = result.assets[0];
      setTinFile(file);
    }
  };

  // 📌 Date Picker
  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const date = selectedDate.toISOString().split("T")[0]; // YYYY-MM-DD
      setExpiryDate(date);
    }
  };

  // 📌 Update TIN
  const updateBusinessTin = async () => {
    if (!tin) return Alert.alert("TIN is required");
    if (!expiryDate) return Alert.alert("Expiry date is required");
    if (!tinFile) return Alert.alert("Please upload TIN certificate");

    try {
      if (!token) return Alert.alert("No token found");

      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("tax_identification_number", tin);
      formData.append("tin_expire_date", expiryDate);

      let fileUri = tinFile.uri;
      if (Platform.OS === "ios" && !fileUri.startsWith("file://")) {
        fileUri = "file://" + fileUri;
      }

      formData.append("tin_certificate", {
        uri: fileUri,
        name: tinFile.name,
        type: tinFile.name.endsWith(".pdf") ? "application/pdf" : "image/jpeg",
      } as any);

      // 🔹 Note: FormData.entries() is not supported in React Native's FormData implementation
      console.log("FormData prepared with TIN:", tin);

      const response = await fetch(
        "https://yemi.store/api/v2/seller/shop-update",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const result = await response.json();
      console.log("PUT Response:", result);

      if (response.ok) {
        // 🔹 Immediately update UI with submitted values
        setTin(tin);
        setExpiryDate(expiryDate);
        setTinFile(tinFile);

        Alert.alert("Success", "TIN updated successfully!");

        // 🔹 Fetch latest shop info in background
        try {
          const shopResponse = await fetch(
            "https://yemi.store/api/v2/seller/shop-info",
            {
              headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const shopInfo = await shopResponse.json();
          console.log("Fetched Shop Info:", shopInfo);
        } catch (err) {
          console.log("Shop Info Fetch Error:", err);
        }
      } else {
        Alert.alert("Error", result.message || "Update failed");
      }
    } catch (error) {
      console.log("API Error:", error);
      Alert.alert("Error", "Something went wrong");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F7F8FA" }}>
      <OrderSetupHeader
        title="Other Setup"
        leftIcon="arrow-back"
        onLeftPress={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={{ padding: 15 }}
        showsVerticalScrollIndicator={false}
      >
        {/* -------- ORDER SETUP -------- */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Setup</Text>
          <Text style={styles.subText}>
            Configure how minimum order amount, free delivery and reorder
            settings work for customers.
          </Text>

          <Text style={styles.label}>Re-Order Level</Text>
          <Input
            placeholder="0"
            keyboardType="numeric"
            value={reorderLevel}
            onChangeText={setReorderLevel}
          />

          <Text style={styles.hintText}>
            Set the stock limit for the reorder level.
          </Text>
        </View>

        {/* -------- BUSINESS TIN -------- */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Business TIN</Text>
          <Text style={styles.subText}>
            Provide your business tax ID and related information for taxpayer
            verification.
          </Text>

          <Text style={styles.label}>Taxpayer Identification Number (TIN)</Text>
          <Input placeholder="Enter TIN" value={tin} onChangeText={setTin} />

          <Text style={styles.label}>Expire Date</Text>
          <Pressable
            style={styles.dateBox}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>
              {expiryDate ? expiryDate : "YYYY-MM-DD"}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#666" />
          </Pressable>

          <Text style={[styles.label, { marginTop: 20 }]}>TIN Certificate</Text>
          <Text style={styles.fileHint}>pdf, doc, jpg. Max size 5MB</Text>

          <Pressable style={styles.uploadBox} onPress={pickTinCertificate}>
            <Ionicons name="cloud-upload-outline" size={36} color="#888" />
            <Text style={styles.uploadText}>
              {tinFile ? tinFile.name : "Tap to upload or drag & drop here"}
            </Text>
          </Pressable>
        </View>

        {/* SAVE BUTTON */}
        <Pressable style={styles.saveBtn} onPress={updateBusinessTin}>
          <Text style={styles.saveText}>Save Changes</Text>
        </Pressable>
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={expiryDate ? new Date(expiryDate) : new Date()}
          mode="date"
          display="default"
          onChange={onChangeDate}
        />
      )}
    </SafeAreaView>
  );
};

export default OtherSetup;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  subText: {
    fontSize: 13,
    color: "#666",
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
  },
  hintText: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
    marginBottom: 20,
  },
  dateBox: {
    backgroundColor: "#F1F4F6",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontSize: 14,
    color: "#666",
  },
  uploadBox: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#B0B0B0",
    borderRadius: 10,
    height: 130,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  uploadText: {
    marginTop: 8,
    color: "#666",
    fontSize: 13,
  },
  fileHint: {
    fontSize: 12,
    color: "#777",
  },
  saveBtn: {
    backgroundColor: "#FA6232",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
