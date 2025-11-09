import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import AddProductHeader from "@/components/Header";
import ImagePickerBox from "@/components/imagePickerBox";
import Input from "@/components/input";
import PrimaryButton from "@/components/primaryButton";
import { router } from "expo-router";
import axios from "axios";

const AddProduct = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [subSubCategoryId, setSubSubCategoryId] = useState("");
  const [brands, setBrands] = useState<any[]>([]);
  const [brandId, setBrandId] = useState("");
  const [productType, setProductType] = useState("physical");
  const [code, setCode] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [minimumOrderQty, setMinimumOrderQty] = useState("1");
  const [currentStock, setCurrentStock] = useState("0");
  const [discountType, setDiscountType] = useState("percent");
  const [discount, setDiscount] = useState("0");
  const [tax, setTax] = useState("0");
  const [taxCalculation, setTaxCalculation] = useState("");
  const [shippingCost, setShippingCost] = useState("0");
  // const [unit, setUnit] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [thumbnail, setThumbnail] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);

  // ------------------ Permissions ------------------
  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Please allow access to your media library"
        );
      }
    })();
  }, []);

  // ------------------ Fetch Categories ------------------
  useEffect(() => {
    fetch("https://yemi.store/api/v1/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  // ------------------ Fetch Brands ------------------
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch("https://yemi.store/api/v1/brands");
        const data = await res.json();
        setBrands(data.brands || []);
      } catch (err) {
        console.error("Failed to fetch brands:", err);
      }
    };
    fetchBrands();
  }, []);

  // ------------------ Submit Handler ------------------
  
  const handleAddProduct = async (publish: boolean) => {
    try {
      const token = await AsyncStorage.getItem("seller_token");
      if (!token) {
        Alert.alert("Error", "Seller token not found. Please log in again.");
        return;
      }

      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("category_id", selectedCategory || "1");
      formData.append("sub_category_id", subCategoryId || "");
      formData.append("sub_sub_category_id", subSubCategoryId || "");
      formData.append("brand_id", brandId || "");
      formData.append("product_type", productType);
      formData.append("code", code || `SKU-${Date.now()}`);
      formData.append("unit_price", unitPrice);
      formData.append("minimum_order_qty", minimumOrderQty);
      formData.append("current_stock", currentStock);
      formData.append("discount_type", discountType);
      formData.append("discount", discount);
      formData.append("tax", tax);
      formData.append("lang", "en");
      formData.append("purchase_price", purchasePrice);
      formData.append("shipping_cost", shippingCost);
      // formData.append("unit", unit);
      formData.append("published", publish ? "1" : "0");

      // Thumbnail
      if (thumbnail?.uri) {
        const fileInfo = await FileSystem.getInfoAsync(thumbnail.uri);
        const localUri = fileInfo.exists ? fileInfo.uri : thumbnail.uri;
        formData.append("thumbnail", {
          uri: localUri,
          type: thumbnail.type || "image/jpeg",
          name: thumbnail.name || "thumbnail.jpg",
        });
      }

      // Product Images
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const fileInfo = await FileSystem.getInfoAsync(img.uri);
        const localUri = fileInfo.exists ? fileInfo.uri : img.uri;
        formData.append("images[]", {
          uri: localUri,
          type: img.type || "image/jpeg",
          name: img.name || `product_image_${i}.jpg`,
        });
      }

      console.log("Uploading product...");

      const res = await axios.post(
        "https://yemi.store/api/v2/seller/products/add",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("✅ Product added successfully:", res.data);
      Alert.alert("Success", `Product ${publish ? "published" : "saved"}!`);
      router.back();
    } catch (err: any) {
      // Show backend error if available
      if (err.response && err.response.data) {
        console.error("❌ Backend error:", err.response.data);
        Alert.alert("Backend Error", JSON.stringify(err.response.data));
      } else {
        console.error("❌ Upload error:", err.message);
        Alert.alert(
          "Error",
          "Failed to add product. Check your network or images."
        );
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AddProductHeader
        title="Add Product"
        leftIcon="arrow-back"
        onLeftPress={() => router.back()}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: "30%" }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.info}>Product Information</Text>
        <View style={styles.information}>
          <ImagePickerBox
            label="Product Thumbnail"
            onImagesChange={(uris) =>
              setThumbnail(
                uris[0]
                  ? {
                      uri: uris[0].startsWith("file://")
                        ? uris[0]
                        : `file://${uris[0]}`,
                      type: "image/jpeg",
                      name: "thumbnail.jpg",
                    }
                  : null
              )
            }
          />
          <ImagePickerBox
            label="Product Images"
            onImagesChange={(uris) =>
              setImages(
                uris.map((uri, index) => ({
                  uri: uri.startsWith("file://") ? uri : `file://${uri}`,
                  type: "image/jpeg",
                  name: `product_image_${index}.jpg`,
                }))
              )
            }
          />
          <Input label="Product Name" value={name} onChangeText={setName} required={true} />
          <Input
            label="Description"
            value={description}
            onChangeText={setDescription}
            multiline
            
            inputStyle={{ textAlignVertical: "top", height: 120 }}
          />
        </View>

        {/* Category & Brand */}
        <Text style={styles.info}>General Setup</Text>
        <View style={styles.setup}>
          {/* Select Category */}
          <Text style={styles.inputLabel}>
            Select Category <Text style={styles.requiredStar}>*</Text>
          </Text>
          <View style={styles.inputForm}>
            <Picker
              selectedValue={selectedCategory}
              onValueChange={(itemValue) => setSelectedCategory(itemValue)}
            >
              <Picker.Item label="Select Category" value="" />
              {categories.map((cat) => (
                <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
              ))}
            </Picker>
          </View>
          {/* Select Sub-Category */}
          <Text style={styles.inputLabel}>Select Sub Category</Text>
          <View style={styles.inputForm}>
            <Picker
              selectedValue={selectedCategory}
              onValueChange={(itemValue) => setSelectedCategory(itemValue)}
            >
              <Picker.Item label="Select Sub Category" value="" />
              {categories.map((cat) => (
                <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
              ))}
            </Picker>
          </View>

          {/* Select sub-sub category */}
          <Text style={styles.inputLabel}>Sub-Sub Category</Text>
          <View style={styles.inputForm}>
            <Picker
              selectedValue={selectedCategory}
              onValueChange={(itemValue) => setSelectedCategory(itemValue)}
            >
              <Picker.Item label="Select Sub Sub Category" value="" />
              {brands.map((b) => (
                <Picker.Item key={b.id} label={b.name} value={b.id} />
              ))}
            </Picker>
          </View>
          {/* Select Brand */}
          <Text style={styles.inputLabel}>Brand</Text>
          <View style={styles.inputForm}>
            <Picker
              selectedValue={brandId}
              onValueChange={(itemValue) => setBrandId(itemValue)}
            >
              <Picker.Item label="Select Brand" value="" />
              {brands.map((b) => (
                <Picker.Item key={b.id} label={b.name} value={b.id} />
              ))}
            </Picker>
          </View>
          {/* Product Type Field */}
          <Text style={styles.inputLabel}>
            Product Type <Text style={styles.requiredStar}>*</Text>
          </Text>
          <View style={styles.inputForm}>
            <Picker
              selectedValue={productType}
              onValueChange={(value) => setProductType(value)}
              // mode="dropdown"
            >
              {/* <Picker.Item label="All" value="All" /> */}
              <Picker.Item label="Physical" value="Physical" />
              <Picker.Item label="Digital" value="Digital" />
            </Picker>
          </View>

          {/* Product SKU Code Field */}
          <Input
            label="Product SKU"
            value={code}
            onChangeText={setCode}
            required={true}
          />
        </View>

        {/* Pricing & Inventory */}
        <Text style={styles.price}>Pricing & Inventory</Text>
        <View style={styles.information}>
          {/* Unit Price Field */}
          <Input
            label="Unit Price ($)"
            value={unitPrice}
            onChangeText={setUnitPrice}
            required={true}
            keyboardType="phone-pad"
          />
          {/* MOQ Field */}
          <Input
            label="Minimum Order Qty"
            value={minimumOrderQty}
            onChangeText={setMinimumOrderQty}
            required={true}
            keyboardType="phone-pad"
          />
          {/* Current Stock Field */}
          <Input
            label="Current Stock Qty"
            value={currentStock}
            onChangeText={setCurrentStock}
            required={true}
            keyboardType="phone-pad"
          />
          {/* Discount Type Field */}
          <Text style={styles.inputLabel}>Discount Type</Text>
          <View style={styles.inputForm}>
            <Picker
              selectedValue={discountType}
              onValueChange={(itemValue) => setDiscountType(itemValue)}
            >
              <Picker.Item label="Select Discount Type" value="" />
              <Picker.Item label="Flat" value="flat" />
              <Picker.Item label="Percentage" value="percentage" />
            </Picker>
          </View>
          {/* Discount Amount Field */}
          <Input
            label="Discount Amount ($)"
            value={discount}
            onChangeText={setDiscount}
            keyboardType="phone-pad"
          />
          {/* Tax Amount Field */}
          <Input
            label="Tax Amount (%)"
            value={tax}
            onChangeText={setTax}
            required={true}
            keyboardType="phone-pad"
          />

          {/* Tax calculation Field */}
          <Text style={styles.inputLabel}>Tax calculation</Text>
          <View style={styles.inputForm}>
            <Picker
              selectedValue={taxCalculation}
              onValueChange={(itemValue) => setTaxCalculation(itemValue)}
            >
              <Picker.Item label="Select Tax Calculation" value="" />
              <Picker.Item label="Include with Product" value="include" />
              <Picker.Item label="Exclude with Product" value="exclude" />
            </Picker>
          </View>
          <Input
            label="Purchase Price ($)"
            value={purchasePrice}
            onChangeText={setPurchasePrice}
            required={true}
            keyboardType="phone-pad"
          />
          {/* Shipping Cost Field*/}
          <Input
            label="Shipping Cost ($)"
            value={shippingCost}
            onChangeText={setShippingCost}
            required={true}
            keyboardType="phone-pad"
          />
        </View>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <PrimaryButton
            title="Save as Draft"
            onPress={() => handleAddProduct(false)}
            variant="outline"
          />
          <PrimaryButton
            title="Publish Product"
            onPress={() => handleAddProduct(true)}
            variant="primary"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddProduct;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 20 },
  information: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  info: {
    fontSize: 24,
    color: "#FA8232",
    fontWeight: "500",
    marginBottom: 16,
    marginTop: 16,
  },
  price: {
    fontSize: 24,
    color: "#FA8232",
    fontWeight: "500",
    marginBottom: 16,
    marginTop: 16,
  },
  setup: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },

  inputLabel: { marginBottom: 15, fontSize: 15, fontWeight: "600" },
  inputForm: {
    borderWidth: 1,
    borderColor: "grey",
    borderRadius: 10,
    marginVertical: 5,
    backgroundColor: "#FFF",
    overflow: "hidden",
  },
  requiredStar: { color: "red" },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
});
