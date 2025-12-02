import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Pressable,
  Alert,
  TextInput,
  ScrollView,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ShopSetting = () => {
  const [loading, setLoading] = useState(true);
  const [storeVisible, setStoreVisible] = useState(true);
  const [vacationEnabled, setVacationEnabled] = useState(false);

  const [duration, setDuration] = useState("custom");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [note, setNote] = useState("");

  const [showDateModal, setShowDateModal] = useState(false);
  const [currentDateType, setCurrentDateType] = useState(null);
  const [tempDate, setTempDate] = useState(new Date());

  // ------------------ FETCH SHOP DATA ------------------
  useEffect(() => {
    fetchShopSettings();
  }, []);

  const fetchShopSettings = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("seller_token");
      if (!token) {
        Alert.alert("Error", "No auth token found. Please login again.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        "https://yemi.store/api/v2/seller/shop-info",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data) {
        // Parse vacation status
        setVacationEnabled(
          data.vacation_status === true || data.vacation_status === 1
        );
        setStoreVisible(!data.temporary_close);

        // Parse vacation dates
        if (data.vacation_start_date) {
          setStartDate(new Date(data.vacation_start_date));
        }
        if (data.vacation_end_date) {
          setEndDate(new Date(data.vacation_end_date));
        }

        // Parse duration type
        if (data.vacation_duration_type === "one_day") {
          setDuration("24");
        } else if (data.vacation_duration_type === "change") {
          setDuration("change");
        } else {
          setDuration("custom");
        }

        // Parse note
        setNote(data.vacation_note || "");

        console.log("✅ Shop settings loaded:", {
          vacation_status: data.vacation_status,
          start: data.vacation_start_date,
          end: data.vacation_end_date,
          note: data.vacation_note,
          duration: data.vacation_duration_type,
        });
      } else {
        Alert.alert("Error", "Failed to load shop settings.");
      }
    } catch (error) {
      console.error("Error fetching shop settings:", error);
      Alert.alert("Error", "Failed to load shop settings.");
    } finally {
      setLoading(false);
    }
  };

  // ------------------ DATE FORMATTING ------------------
  const formatUTCDate = (date) => {
    const d = new Date(date);
    const pad = (n) => n.toString().padStart(2, "0");
    // Format as local time, not UTC
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate()
    )} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  // ------------------ SIMPLE DATE PICKER ------------------
  const openDatePicker = (type) => {
    setCurrentDateType(type);
    setTempDate(type === "start" ? startDate : endDate);
    setShowDateModal(true);
  };

  const closeDatePicker = () => {
    setShowDateModal(false);
    setCurrentDateType(null);
  };

  const confirmDate = () => {
    if (currentDateType === "start") {
      setStartDate(tempDate);
    } else {
      setEndDate(tempDate);
    }
    closeDatePicker();
  };

  const adjustDate = (field, increment) => {
    const newDate = new Date(tempDate);
    switch (field) {
      case "year":
        newDate.setFullYear(newDate.getFullYear() + increment);
        break;
      case "month":
        newDate.setMonth(newDate.getMonth() + increment);
        break;
      case "day":
        newDate.setDate(newDate.getDate() + increment);
        break;
      case "hour":
        newDate.setHours(newDate.getHours() + increment);
        break;
      case "minute":
        newDate.setMinutes(newDate.getMinutes() + increment);
        break;
    }
    setTempDate(newDate);
  };

  // ------------------ API CALL ------------------
  const saveVacationSettings = async () => {
    try {
      let apiStartDate = startDate;
      let apiEndDate = endDate;
      let apiDuration = duration;

      if (duration === "24") {
        apiDuration = "one_day";
        apiEndDate = new Date(apiStartDate);
        apiEndDate.setHours(apiEndDate.getHours() + 24);
      }

      if (duration === "change") {
        apiDuration = "change";
        apiEndDate = apiStartDate;
      }

      const token = await AsyncStorage.getItem("seller_token");
      if (!token) {
        Alert.alert("Error", "No auth token found. Please login again.");
        return;
      }

      // Clean the note - trim whitespace
      const cleanNote = note.trim();

      // Build query parameters - send all at once
      const params = new URLSearchParams({
        vacation_start_date: formatUTCDate(apiStartDate),
        vacation_end_date: formatUTCDate(apiEndDate),
        vacation_duration_type: apiDuration,
        vacation_note: cleanNote,
        vacation_status: vacationEnabled ? "1" : "0",
      });

      const url = `https://yemi.store/api/v2/seller/shop-update?${params.toString()}`;

      console.log("📤 Sending request");
      console.log("📤 URL:", url);
      console.log("📤 Note length:", cleanNote.length);
      console.log("📤 Note content:", JSON.stringify(cleanNote));
      console.log("📤 Parameters:", {
        vacation_start_date: formatUTCDate(apiStartDate),
        vacation_end_date: formatUTCDate(apiEndDate),
        vacation_duration_type: apiDuration,
        vacation_note: cleanNote,
        vacation_status: vacationEnabled ? "1" : "0",
      });

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await response.text();
      console.log("📥 Raw response:", text);

      if (response.ok) {
        Alert.alert("Success", "Vacation settings saved successfully!");
        // Refetch to confirm changes
        setTimeout(async () => {
          await fetchShopSettings();
          console.log("🔄 After refetch - Note in state:", note);
        }, 1000);
      } else {
        Alert.alert("Error", "Something went wrong!");
      }
    } catch (error) {
      console.error("❌ Save error:", error);
      Alert.alert("Error", "Failed to update vacation mode.");
    }
  };

  // ------------------ RESET ------------------
  const resetVacationSettings = () => {
    setDuration("custom");
    setStartDate(new Date());
    setEndDate(new Date());
    setNote("");
    setVacationEnabled(false);
  };

  // ------------------ TOGGLES ------------------
  const toggleStoreVisibility = () => {
    Alert.alert(
      storeVisible ? "Hide Store?" : "Show Store?",
      storeVisible
        ? "Customers will NOT be able to see your shop temporarily."
        : "Your shop will be live and visible again.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Confirm", onPress: () => setStoreVisible(!storeVisible) },
      ]
    );
  };

  const toggleVacation = () => {
    Alert.alert(
      vacationEnabled ? "Turn Off Vacation Mode?" : "Enable Vacation Mode?",
      vacationEnabled
        ? "Your shop will be active again."
        : "Customers will see your shop but cannot order.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => setVacationEnabled(!vacationEnabled),
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF8A00" />
          <Text style={styles.loadingText}>Loading shop settings...</Text>
        </View>
      ) : (
        <>
          {/* Store Visibility */}
          <Text style={styles.title}>Store Availability</Text>
          <Text style={styles.desc}>
            Disabling this will temporarily close your shop on the customer app
            and website.
          </Text>
          <View style={styles.row}>
            <Text style={styles.label}>Store Visibility</Text>
            <Switch
              value={storeVisible}
              onValueChange={toggleStoreVisibility}
            />
          </View>
          <View style={styles.divider} />

          {/* Vacation Mode */}
          <Text style={styles.title}>Vacation Mode</Text>
          <Text style={styles.desc}>
            If you turn this on, your shop will go into vacation mode. Customers
            can view your shop but cannot order.
          </Text>
          <View style={styles.row}>
            <Text style={styles.label}>Status</Text>
            <Switch value={vacationEnabled} onValueChange={toggleVacation} />
          </View>

          {/* Vacation Settings */}
          {vacationEnabled && (
            <>
              <Text style={styles.sectionLabel}>Vacation Mode Duration</Text>
              <View style={styles.radioRow}>
                {["change", "24", "custom"].map((val) => (
                  <Pressable
                    key={val}
                    onPress={() => setDuration(val)}
                    style={styles.radioItem}
                  >
                    <View
                      style={[
                        styles.radioCircle,
                        duration === val && styles.radioSelected,
                      ]}
                    />
                    <Text>
                      {val === "change"
                        ? "Until I Change"
                        : val === "24"
                        ? "24 Hours"
                        : "Custom Time"}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {(duration === "24" || duration === "custom") && (
                <>
                  <Text style={styles.sectionLabel}>Start Date</Text>
                  <Pressable
                    style={styles.dateInput}
                    onPress={() => openDatePicker("start")}
                  >
                    <Text>{startDate.toLocaleString()}</Text>
                  </Pressable>

                  <Text style={styles.sectionLabel}>End Date</Text>
                  <Pressable
                    style={styles.dateInput}
                    onPress={() => openDatePicker("end")}
                  >
                    <Text>{endDate.toLocaleString()}</Text>
                  </Pressable>

                  <Text style={styles.sectionLabel}>Vacation Note</Text>
                  <TextInput
                    style={styles.textArea}
                    value={note}
                    onChangeText={setNote}
                    placeholder="Write your vacation note..."
                    multiline
                  />
                </>
              )}
            </>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <Pressable style={styles.resetBtn} onPress={resetVacationSettings}>
              <Text style={{ textAlign: "center" }}>Reset</Text>
            </Pressable>

            <Pressable style={styles.saveBtn} onPress={saveVacationSettings}>
              <Text style={{ color: "#fff", textAlign: "center" }}>
                Save Settings
              </Text>
            </Pressable>
          </View>

          {/* Custom Date Picker Modal */}
          <Modal
            visible={showDateModal}
            transparent
            animationType="slide"
            onRequestClose={closeDatePicker}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  Select {currentDateType === "start" ? "Start" : "End"} Date
                </Text>

                <View style={styles.dateDisplay}>
                  <Text style={styles.dateDisplayText}>
                    {tempDate.toLocaleString()}
                  </Text>
                </View>

                {/* Date/Time Controls */}
                <View style={styles.pickerContainer}>
                  <DateControl
                    label="Year"
                    value={tempDate.getFullYear()}
                    onIncrement={() => adjustDate("year", 1)}
                    onDecrement={() => adjustDate("year", -1)}
                  />
                  <DateControl
                    label="Month"
                    value={tempDate.getMonth() + 1}
                    onIncrement={() => adjustDate("month", 1)}
                    onDecrement={() => adjustDate("month", -1)}
                  />
                  <DateControl
                    label="Day"
                    value={tempDate.getDate()}
                    onIncrement={() => adjustDate("day", 1)}
                    onDecrement={() => adjustDate("day", -1)}
                  />
                  <DateControl
                    label="Hour"
                    value={tempDate.getHours()}
                    onIncrement={() => adjustDate("hour", 1)}
                    onDecrement={() => adjustDate("hour", -1)}
                  />
                  <DateControl
                    label="Min"
                    value={tempDate.getMinutes()}
                    onIncrement={() => adjustDate("minute", 5)}
                    onDecrement={() => adjustDate("minute", -5)}
                  />
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                  <TouchableOpacity
                    style={styles.quickBtn}
                    onPress={() => setTempDate(new Date())}
                  >
                    <Text style={styles.quickBtnText}>Now</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickBtn}
                    onPress={() => {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      setTempDate(tomorrow);
                    }}
                  >
                    <Text style={styles.quickBtnText}>Tomorrow</Text>
                  </TouchableOpacity>
                </View>

                {/* Modal Buttons */}
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.modalCancelBtn}
                    onPress={closeDatePicker}
                  >
                    <Text>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalConfirmBtn}
                    onPress={confirmDate}
                  >
                    <Text style={{ color: "#fff" }}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </>
      )}
    </ScrollView>
  );
};

// Date Control Component
const DateControl = ({ label, value, onIncrement, onDecrement }) => (
  <View style={styles.controlGroup}>
    <Text style={styles.controlLabel}>{label}</Text>
    <TouchableOpacity style={styles.controlBtn} onPress={onIncrement}>
      <Text style={styles.controlBtnText}>▲</Text>
    </TouchableOpacity>
    <View style={styles.controlValue}>
      <Text style={styles.controlValueText}>
        {String(value).padStart(2, "0")}
      </Text>
    </View>
    <TouchableOpacity style={styles.controlBtn} onPress={onDecrement}>
      <Text style={styles.controlBtnText}>▼</Text>
    </TouchableOpacity>
  </View>
);

export default ShopSetting;

// ------------------ STYLES ------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  desc: { color: "#555", marginBottom: 15, paddingHorizontal: 20 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 12,
    paddingHorizontal: 20,
  },
  label: { fontSize: 16, fontWeight: "bold" },
  divider: { height: 1, backgroundColor: "#ddd", marginVertical: 20 },
  sectionLabel: {
    marginTop: 15,
    marginBottom: 5,
    fontWeight: "bold",
    paddingHorizontal: 20,
  },
  radioRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  radioItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  radioCircle: {
    width: 16,
    height: 16,
    borderWidth: 1.5,
    borderRadius: 8,
    borderColor: "#444",
  },
  radioSelected: { backgroundColor: "#ff9900" },
  dateInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    marginHorizontal: 20,
    backgroundColor: "#f9f9f9",
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    height: 80,
    textAlignVertical: "top",
    marginHorizontal: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    paddingHorizontal: 20,
  },
  resetBtn: {
    flex: 1,
    padding: 12,
    backgroundColor: "#eee",
    borderRadius: 8,
    marginRight: 10,
  },
  saveBtn: {
    flex: 1,
    padding: 12,
    backgroundColor: "#FF8A00",
    borderRadius: 8,
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
    fontSize: 14,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  dateDisplay: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  dateDisplayText: {
    fontSize: 16,
    textAlign: "center",
    fontWeight: "500",
  },
  pickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  controlGroup: {
    alignItems: "center",
    flex: 1,
  },
  controlLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
  },
  controlBtn: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
  },
  controlBtnText: {
    fontSize: 16,
    color: "#333",
  },
  controlValue: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginVertical: 4,
  },
  controlValueText: {
    fontSize: 18,
    fontWeight: "600",
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  quickBtn: {
    backgroundColor: "#e8e8e8",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  quickBtnText: {
    fontSize: 14,
    color: "#333",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalCancelBtn: {
    flex: 1,
    padding: 12,
    backgroundColor: "#eee",
    borderRadius: 8,
    marginRight: 10,
    alignItems: "center",
  },
  modalConfirmBtn: {
    flex: 1,
    padding: 12,
    backgroundColor: "#FF8A00",
    borderRadius: 8,
    marginLeft: 10,
    alignItems: "center",
  },
});
