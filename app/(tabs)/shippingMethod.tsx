import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  Alert,
  ActivityIndicator,
  TextInput,
  Pressable,
  Switch,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import ShipMethodHeader from "@/components/Header";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ShippingMethod = () => {
  const [selectedMethod, setSelectedMethod] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");

  // Order Wise fields
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [cost, setCost] = useState("");
  const [addedMethod, setAddedMethod] = useState(null);

  // Category Wise fields
  const [categories, setCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);

  const shippingMethods = [
    { label: "Order Wise", value: "order_wise" },
    { label: "Category Wise", value: "category_wise" },
    { label: "Product Wise", value: "product_wise" },
    { label: "Shipping Wise", value: "shipping_wise" },
  ];

  // Fetch token
  useEffect(() => {
    const fetchToken = async () => {
      const savedToken = await AsyncStorage.getItem("seller_token");
      if (savedToken) setToken(savedToken);
    };
    fetchToken();
  }, []);

  // Fetch categories only when category_wise is selected
  useEffect(() => {
    if (selectedMethod === "category_wise") {
      fetchCategories();
    }
  }, [selectedMethod]);

  // -------------------------
  // ADD ORDER-WISE METHOD
  // -------------------------
  const addShippingMethod = async () => {
    if (!title || !duration || !cost) {
      return Alert.alert("Error", "Please fill all fields.");
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://yemi.store/api/v2/seller/shipping-method/add",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ title, duration, cost }),
        }
      );

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        return Alert.alert("Error", "Invalid server response.");
      }

      if (response.ok) {
        Alert.alert("Success", "Shipping method added!");
        setAddedMethod({ title, duration, cost });
        setTitle("");
        setDuration("");
        setCost("");
      } else {
        Alert.alert("Error", data.message || "Failed to add shipping method");
      }
    } catch (err) {
      console.log("Order Wise Add Error:", err);
      Alert.alert("Error", "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // FETCH CATEGORY-WISE LIST
  // -------------------------
  const fetchCategories = async () => {
    setCategoryLoading(true);

    try {
      const response = await fetch(
        "https://yemi.store/api/v2/seller/shipping/all-category-cost",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const text = await response.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        return Alert.alert("Error", "Server returned non-JSON data.");
      }

      console.log("Fetched Categories:", data);

      const list = data?.all_category_shipping_cost ?? [];

      if (response.ok) {
        const categoriesArray = list.map((item) => item.category);
        setCategories(categoriesArray);
      } else {
        Alert.alert("Error", data.message || "Unable to fetch categories.");
      }
    } catch (err) {
      console.log("Category Error:", err);
      Alert.alert("Error", "Network or server problem.");
    } finally {
      setCategoryLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ShipMethodHeader
        title="Shipping Method"
        leftIcon="arrow-back"
        onLeftPress={() => router.back()}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Select Shipping Method:</Text>

        {/* Method Picker */}
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedMethod}
            onValueChange={(itemValue) => setSelectedMethod(itemValue)}
            mode="dropdown"
            style={styles.picker}
          >
            <Picker.Item label="-- Choose a method --" value="" />
            {shippingMethods.map((method) => (
              <Picker.Item
                key={method.value}
                label={method.label}
                value={method.value}
              />
            ))}
          </Picker>
        </View>

        {/* ----------------------- */}
        {/* ORDER WISE SECTION */}
        {/* ----------------------- */}
        {selectedMethod === "order_wise" && (
          <View style={styles.orderWiseContainer}>
            <TextInput
              placeholder="Title (e.g., Fast Delivery)"
              value={title}
              onChangeText={setTitle}
              style={styles.input}
            />

            <TextInput
              placeholder="Duration (e.g., 2-4 Days)"
              value={duration}
              onChangeText={setDuration}
              style={styles.input}
            />

            <TextInput
              placeholder="Cost (e.g., 10)"
              value={cost}
              onChangeText={setCost}
              keyboardType="numeric"
              style={styles.input}
            />

            <Pressable style={styles.button} onPress={addShippingMethod}>
              <Text style={styles.buttonText}>Add Shipping Method</Text>
            </Pressable>
          </View>
        )}

        {/* ----------------------- */}
        {/* CATEGORY WISE SECTION */}
        {/* ----------------------- */}
        {selectedMethod === "category_wise" && (
          <View style={styles.tableContainer}>
            {/* Header Row */}
            <View style={styles.tableHeader}>
              <Text style={styles.headerCell}>SL</Text>
              <Text style={[styles.headerCell, { flex: 2 }]}>
                Category Name
              </Text>
              <Text style={[styles.headerCell, { flex: 2 }]}>
                Cost Per Product
              </Text>
              <Text style={[styles.headerCell, { flex: 1 }]}>Multiply Qty</Text>
            </View>

            {/* Body Rows */}
            {categoryLoading ? (
              <ActivityIndicator size="large" color="#FA8232" />
            ) : (
              categories.map((cat, index) => (
                <View key={cat.id} style={styles.tableRow}>
                  {/* SL */}
                  <Text style={styles.rowCell}>{index + 1}</Text>

                  {/* Category Name */}
                  <Text style={[styles.rowCell, { flex: 2 }]}>{cat.name}</Text>

                  {/* Cost Input */}
                  <TextInput
                    style={[styles.costInput, { flex: 2 }]}
                    value={cat.cost?.toString() || ""}
                    keyboardType="numeric"
                    onChangeText={(value) => {
                      const updated = [...categories];
                      updated[index].cost = value;
                      setCategories(updated);
                    }}
                  />

                  {/* Multiply Switch */}
                  <Switch
                    value={cat.multiply_with_qty === 1}
                    onValueChange={(value) => {
                      const updated = [...categories];
                      updated[index].multiply_with_qty = value ? 1 : 0;
                      setCategories(updated);
                    }}
                    trackColor={{ false: "#ccc", true: "#FA8232" }}
                    thumbColor="#fff"
                  />
                </View>
              ))
            )}
          </View>
        )}

        {/* PRODUCT WISE / SHIPPING WISE DISPLAY */}
        {(selectedMethod === "product_wise" ||
          selectedMethod === "shipping_wise") &&
          selectedMethod !== "" && (
            <View style={{ marginTop: 20 }}>
              <Text style={styles.selectedText}>
                Selected:{" "}
                {shippingMethods.find((m) => m.value === selectedMethod)?.label}
              </Text>
              <Text style={{ marginTop: 5, color: "#555" }}>
                No extra fields required for this method.
              </Text>
            </View>
          )}

        {/* Loader */}
        {loading && (
          <ActivityIndicator
            size="large"
            color="#FA8232"
            style={{ marginTop: 20 }}
          />
        )}

        {/* Show Added Order Wise Method */}
        {addedMethod && selectedMethod === "order_wise" && (
          <View style={styles.addedMethod}>
            <Text>Title: {addedMethod.title}</Text>
            <Text>Duration: {addedMethod.duration}</Text>
            <Text>Cost: Rs {addedMethod.cost}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ShippingMethod;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 20 },
  label: { fontSize: 16, marginBottom: 10, fontWeight: "600" },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: { height: 50, width: "100%" },

  orderWiseContainer: { marginTop: 20 },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },

  button: {
    backgroundColor: "#FA8232",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  buttonText: { color: "#fff", fontWeight: "600" },

  selectedText: { fontSize: 16, fontWeight: "500" },

  addedMethod: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#f3f3f3",
    borderRadius: 8,
  },

  categoryCard: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: "#f3f3f3",
    borderRadius: 8,
  },
  tableContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    elevation: 2,
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#f9f9f9",
  },
  headerCell: {
    flex: 1,
    fontWeight: "700",
    fontSize: 14,
    color: "#333",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  rowCell: {
    flex: 1,
    fontSize: 14,
  },
  costInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 6,
    borderRadius: 6,
    fontSize: 14,
    textAlign: "center",
    backgroundColor: "#fff",
  },

  catName: { fontWeight: "600", fontSize: 15 },
  catCost: { color: "#444", marginTop: 3 },
});
