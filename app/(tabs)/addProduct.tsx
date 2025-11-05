import AddProductHeader from "@/components/Header";
import ImagePickerBox from "@/components/imagePickerBox";
import Input from "@/components/input";
import PrimaryButton from "@/components/primaryButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import * as FileSystem from "expo-file-system";
import { Picker } from "@react-native-picker/picker";
import * as FileSystem from "expo-file-system/legacy";

import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AddProduct = () => {
  // ------------------ Form State ------------------
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  // const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [subCategoryId, setSubCategoryId] = useState("");
  const [subSubCategoryId, setSubSubCategoryId] = useState("");
  const [brands, setBrands] = useState<any[]>([]);
  const [brandId, setBrandId] = useState("");
  const [productType, setProductType] = useState("physical");
  const [code, setCode] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [minimumOrderQty, setMinimumOrderQty] = useState("1");
  const [currentStock, setCurrentStock] = useState("");
  const [discountType, setDiscountType] = useState("percent");
  const [discount, setDiscount] = useState("");
  const [tax, setTax] = useState("");
  const [shippingCost, setShippingCost] = useState("");
  const [unit, setUnit] = useState("100");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [thumbnail, setThumbnail] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);

  // const [brandId, setBrandId] = useState(""); // currently selected brand

  // ------------------ Permissions ------------------
  useEffect(() => {
    const requestPermissions = async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Please allow access to your media library"
        );
      }
    };
    requestPermissions();
  }, []);

  // Fetch categories from API
  useEffect(() => {
    fetch("https://yemi.store/api/v1/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data); // save categories
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
        setLoading(false);
      });
  }, []);

  // Fetch Brands from API
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch("https://yemi.store/api/v1/brands");
        const data = await res.json();
        // Assuming your API returns an array of brands in `data`
        setBrands(data.brands || []);
      } catch (err) {
        console.error("Failed to fetch brands:", err);
      }
    };

    fetchBrands();
  }, []);

  // ------------------ Submit ------------------
  // const handleAddProduct = async () => {
  //   try {
  //     const token = await AsyncStorage.getItem("seller_token");
  //     if (!token) {
  //       Alert.alert("Error", "Seller token not found. Please log in again.");
  //       return;
  //     }

  //     const formData = new FormData();
  //     formData.append("name", name);
  //     formData.append("description", description);
  //     formData.append("category_id", categoryId || "1");
  //     formData.append("sub_category_id", subCategoryId || "1");
  //     formData.append("sub_sub_category_id", subSubCategoryId || "1");
  //     formData.append("brand_id", brandId || "1");
  //     formData.append("product_type", productType);
  //     formData.append("code", code || `SKU-${Date.now()}`);
  //     formData.append("unit_price", unitPrice);
  //     formData.append("minimum_order_qty", minimumOrderQty);
  //     formData.append("current_stock", currentStock);
  //     formData.append("discount_type", discountType);
  //     formData.append("discount", discount);
  //     formData.append("tax", tax);
  //     formData.append("lang", "en");
  //     formData.append("purchase_price", purchasePrice || unitPrice);
  //     formData.append("shipping_cost", shippingCost);
  //     formData.append("unit", unit);

  //     // ✅ Attach thumbnail
  //     if (thumbnail?.uri) {
  //       formData.append("thumbnail", {
  //         uri: thumbnail.uri,
  //         type: thumbnail.type || "image/jpeg",
  //         name: thumbnail.name || "thumbnail.jpg",
  //       });
  //     }

  //     // ✅ Attach product images
  //     images.forEach((img, index) => {
  //       formData.append("images[]", {
  //         uri: img.uri,
  //         type: img.type || "image/jpeg",
  //         name: img.name || `product_image_${index}.jpg`,
  //       });
  //     });
  //     // Before the axios call
  //     console.log("📋 Form data being sent:");
  //     console.log("Thumbnail:", thumbnail);
  //     console.log("Images:", images);
  //     console.log("Images length:", images.length);

  //     // Check if URIs are valid
  //     if (thumbnail?.uri) {
  //       console.log(
  //         "Thumbnail URI starts with:",
  //         thumbnail.uri.substring(0, 50)
  //       );
  //     }
  //     images.forEach((img, i) => {
  //       console.log(`Image ${i} URI starts with:`, img.uri.substring(0, 50));
  //     });
  //     const res = await axios.post(
  //       "https://yemi.store/api/v2/seller/products/add",
  //       formData,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           Accept: "application/json",
  //         },
  //       }
  //     );

  //     console.log("✅ Product added successfully:", res.data);
  //     Alert.alert("Success", "Product added successfully!");
  //     router.back();
  //   } catch (err: any) {
  //     console.error("❌ Upload error:", err.response?.data || err.message);
  //     Alert.alert("Error", "Failed to add product.");
  //   }
  // };

  const handleAddProduct = async () => {
    try {
      const token = await AsyncStorage.getItem("seller_token");
      if (!token) {
        Alert.alert("Error", "Seller token not found. Please log in again.");
        return;
      }

      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("category_id", categoryId || "1");
      formData.append("sub_category_id", subCategoryId || "1");
      formData.append("sub_sub_category_id", subSubCategoryId || "1");
      formData.append("brand_id", brandId || "1");
      formData.append("product_type", productType);
      formData.append("code", code || `SKU-${Date.now()}`);
      formData.append("unit_price", unitPrice);
      formData.append("minimum_order_qty", minimumOrderQty);
      formData.append("current_stock", currentStock);
      formData.append("discount_type", discountType);
      formData.append("discount", discount);
      formData.append("tax", tax);
      formData.append("lang", "en");
      formData.append("purchase_price", purchasePrice || unitPrice);
      formData.append("shipping_cost", shippingCost);
      formData.append("unit", unit);

      // Convert thumbnail URI if needed
      if (thumbnail?.uri) {
        const fileInfo = await FileSystem.getInfoAsync(thumbnail.uri);
        const localUri = fileInfo.exists ? fileInfo.uri : thumbnail.uri;
        formData.append("thumbnail", {
          uri: localUri,
          type: thumbnail.type || "image/jpeg",
          name: thumbnail.name || "thumbnail.jpg",
        });
      }

      // Convert images URIs if needed
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

      // Use fetch instead of axios
      const res = await fetch("https://yemi.store/api/v2/seller/products/add", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        console.error("❌ Upload failed:", data);
        Alert.alert("Error", "Failed to add product.");
        return;
      }

      // const res = await axios.post(
      //   "https://yemi.store/api/v2/seller/products/add",
      //   formData,
      //   {
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //       Accept: "application/json",
      //       // DON'T set 'Content-Type', let axios handle multipart/form-data
      //     },
      //   }
      // );

      console.log("✅ Product added successfully:", data);
      Alert.alert("Success", "Product added successfully!");
      router.back();
    } catch (err: any) {
      console.error("❌ Upload error:", err.response?.data || err.message);
      Alert.alert(
        "Error",
        "Failed to add product. Check your network or images."
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AddProductHeader
        title="Add Product"
        leftIcon="arrow-back"
        onLeftPress={() => router.navigate("/myProducts")}
        rightIcon="ellipsis-vertical"
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: "30%" }}
        showsVerticalScrollIndicator={false}
      >
        {/* Product Info */}
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
          <Input label="Product Name" value={name} onChangeText={setName} />
          <Input
            label="Description"
            value={description}
            onChangeText={setDescription}
            multiline
            inputStyle={{ textAlignVertical: "top", height: 120 }}
          />
        </View>

        {/* General Setup */}
        <Text style={styles.info}>General Setup</Text>
        <View style={styles.setup}>
          {/* <Input
            label="Category ID"
            value={categoryId}
            onChangeText={setCategoryId}
          /> */}
          <Text style={{ marginBottom: 5, fontSize: 15, fontWeight: "600" }}>
            Select Category
          </Text>
          <View
            style={{
              borderWidth: 1,
              borderColor: "grey",
              borderRadius: 10,
              marginVertical: 5,
              backgroundColor: "#FFF",
              overflow: "hidden", // important for Android to show rounded borders
            }}
          >
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

          <Input
            label="Sub Category ID"
            value={subCategoryId}
            onChangeText={setSubCategoryId}
          />
          <Input
            label="Sub Sub Category ID"
            value={subSubCategoryId}
            onChangeText={setSubSubCategoryId}
          />
          {/* <Input label="Brand ID" value={brandId} onChangeText={setBrandId} /> */}
          <Text style={{ marginTop: 10, fontSize: 10, fontWeight: "600" }}>
            Brand
          </Text>
          <View
            style={{
              borderWidth: 1,
              borderColor: "grey",
              borderRadius: 10,
              marginVertical: 5,
              backgroundColor: "#FFF",
              overflow: "hidden", // important for Android to show rounded borders
            }}
          >
            <Picker
              selectedValue={brandId}
              onValueChange={(itemValue) => setBrandId(itemValue)}
            >
              <Picker.Item label="Select Brand" value="" />
              {brands?.map((b) => (
                <Picker.Item key={b.id} label={b.name} value={b.id} />
              ))}
            </Picker>
          </View>

          <Input
            label="Product Type"
            value={productType}
            onChangeText={setProductType}
          />
          <Input label="Product SKU" value={code} onChangeText={setCode} />
        </View>

        {/* Pricing & Inventory */}
        <Text style={styles.price}>Pricing & Inventory</Text>
        <View style={styles.information}>
          <Input
            label="Unit Price"
            value={unitPrice}
            onChangeText={setUnitPrice}
          />
          <Input
            label="Minimum Order Qty"
            value={minimumOrderQty}
            onChangeText={setMinimumOrderQty}
          />
          <Input
            label="Current Stock"
            value={currentStock}
            onChangeText={setCurrentStock}
          />
          <Input
            label="Discount Type"
            value={discountType}
            onChangeText={setDiscountType}
          />
          <Input
            label="Discount Amount"
            value={discount}
            onChangeText={setDiscount}
          />
          <Input label="Tax" value={tax} onChangeText={setTax} />
          <Input
            label="Purchase Price"
            value={purchasePrice}
            onChangeText={setPurchasePrice}
          />
          <Input label="Unit" value={unit} onChangeText={setUnit} />
          <Input
            label="Shipping Cost"
            value={shippingCost}
            onChangeText={setShippingCost}
          />
        </View>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <PrimaryButton
            title="Save as Draft"
            onPress={handleAddProduct}
            variant="outline"
          />
          <PrimaryButton
            title="Publish Product"
            onPress={handleAddProduct}
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
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
});
