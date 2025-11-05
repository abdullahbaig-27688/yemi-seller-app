import AddProductHeader from "@/components/Header";
import ImagePickerBox from "@/components/imagePickerBox";
import Input from "@/components/input";
import PrimaryButton from "@/components/primaryButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const EditProduct = () => {
  const { id } = useLocalSearchParams();
  console.log("🆔 Product ID received:", id);
  const [product, setProduct] = useState<any>(null);

  // ------------------ Form State ------------------
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [subSubCategoryId, setSubSubCategoryId] = useState("");
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

  // ------------------ Fetch Product ------------------
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem("seller_token");
        console.log("1️⃣ Token exists:", !!token);

        if (!id) {
          Alert.alert("Error", "Missing product ID.");
          setLoading(false);
          return;
        }

        console.log("2️⃣ Fetching product ID:", id);

        const res = await axios.get(
          `https://yemi.store/api/v2/seller/products/edit/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("3️⃣ Response received:", res.status);
        console.log("4️⃣ Response data:", JSON.stringify(res.data, null, 2));

        const productData = res.data;

        if (productData) {
          console.log("5️⃣ Setting product fields...");
          setProduct(productData);

          // Set all text fields
          setName(productData.name || "");
          setDescription(productData.details || "");

          // Handle category_ids array structure
          const categoryIds = productData.category_ids || [];
          setCategoryId(categoryIds[0]?.id || "1");
          setSubCategoryId(categoryIds[1]?.id || "1");
          setSubSubCategoryId(categoryIds[2]?.id || "1");

          setBrandId(productData.brand_id?.toString() || "1");
          setProductType(productData.product_type || "physical");
          setCode(productData.code || "");
          setUnitPrice(productData.unit_price?.toString() || "");
          setMinimumOrderQty(productData.min_qty?.toString() || "1");
          setCurrentStock(productData.current_stock?.toString() || "");
          setDiscountType(productData.discount_type || "percent");
          setDiscount(productData.discount?.toString() || "");
          setTax(productData.tax?.toString() || "");
          setShippingCost(productData.shipping_cost?.toString() || "");
          setPurchasePrice(productData.purchase_price?.toString() || "");
          setUnit(productData.unit?.toString() || "100");

          console.log("6️⃣ Text fields set. Name:", productData.name);

          // Handle thumbnail
          if (
            productData.thumbnail_full_url?.path &&
            productData.thumbnail_full_url?.status === 200
          ) {
            console.log(
              "7️⃣ Setting thumbnail from full URL:",
              productData.thumbnail_full_url.path
            );
            setThumbnail({ uri: productData.thumbnail_full_url.path });
          } else if (
            productData.thumbnail &&
            productData.thumbnail !== "/tmp/phpVP8C10"
          ) {
            console.log(
              "7️⃣ Setting thumbnail from relative path:",
              productData.thumbnail
            );
            setThumbnail({
              uri: `https://yemi.store/storage/app/public/${productData.thumbnail}`,
            });
          } else {
            console.log("7️⃣ No valid thumbnail found");
          }

          // Handle images
          if (
            productData.images_full_url &&
            productData.images_full_url.length > 0
          ) {
            const validImages = productData.images_full_url.filter(
              (img: any) => img.path && img.status === 200
            );

            if (validImages.length > 0) {
              console.log(
                "8️⃣ Setting images from full URLs:",
                validImages.length
              );
              setImages(
                validImages.map((img: any, i: number) => ({
                  uri: img.path,
                  type: "image/jpeg",
                  name: `existing_image_${i}.jpg`,
                }))
              );
            } else {
              console.log("8️⃣ No valid images with status 200");
            }
          } else if (productData.images) {
            try {
              const imageArray = JSON.parse(productData.images);
              const validImagePaths = imageArray.filter(
                (img: string) => img && img.trim() !== ""
              );

              if (validImagePaths.length > 0) {
                console.log("8️⃣ Setting images from parsed JSON");
                setImages(
                  validImagePaths.map((img: string, i: number) => ({
                    uri: `https://yemi.store/storage/app/public/product/${img.trim()}`,
                    type: "image/jpeg",
                    name: `existing_image_${i}.jpg`,
                  }))
                );
              } else {
                console.log("8️⃣ No valid image paths in JSON");
              }
            } catch (e) {
              console.log("8️⃣ Error parsing images JSON:", e);
            }
          } else {
            console.log("8️⃣ No images found");
          }

          console.log("✅ Product loaded successfully");
        } else {
          console.log("❌ No product data in response");
          Alert.alert("Error", "Product not found.");
        }
      } catch (err: any) {
        console.error("❌ Fetch error:", err.response?.status);
        console.error("❌ Error data:", err.response?.data || err.message);
        Alert.alert("Error", "Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  // ------------------ Submit Update ------------------
  const handleUpdateProduct = async () => {
    if (updating) return; // Prevent double submission

    setUpdating(true);
    try {
      const token = await AsyncStorage.getItem("seller_token");
      if (!token) {
        Alert.alert("Error", "Seller token not found. Please log in again.");
        setUpdating(false);
        return;
      }

      if (!product) {
        Alert.alert("Error", "Product data not loaded yet.");
        setUpdating(false);
        return;
      }

      console.log("🔄 Starting product update...");
      console.log("📝 Current form values:", {
        name,
        description,
        categoryId,
        unitPrice,
        code,
      });

      const formData = new FormData();

      // ⚠️ IMPORTANT: Use _method for Laravel PUT with FormData
      formData.append("_method", "PUT");

      // Append required fields with actual values
      formData.append("name", name || "");
      formData.append("description", description || "");
      formData.append("category_id", categoryId || "1");
      formData.append("sub_category_id", subCategoryId || "1");
      formData.append("sub_sub_category_id", subSubCategoryId || "1");
      formData.append("brand_id", brandId || "1");
      formData.append("product_type", productType || "physical");
      formData.append("code", code || `SKU-${Date.now()}`);
      formData.append("unit_price", unitPrice || "0");
      formData.append("purchase_price", purchasePrice || "0");
      formData.append("minimum_order_qty", minimumOrderQty || "1");
      formData.append("current_stock", currentStock || "0");
      formData.append("discount_type", discountType || "percent");
      formData.append("discount", discount || "0");
      formData.append("tax", tax || "0");
      formData.append("lang", "en");
      formData.append("shipping_cost", shippingCost || "0");
      formData.append("unit", unit || "100");
        // ✅ Automatically publish product
    formData.append("published", "1");

      // Attach thumbnail
      if (thumbnail?.uri && !thumbnail.uri.startsWith("https")) {
        formData.append("thumbnail", {
          uri: thumbnail.uri,
          type: "image/jpeg",
          name: "thumbnail.jpg",
        } as any);
      }

      // Attach new images
      images.forEach((img, index) => {
        if (!img.uri.startsWith("https")) {
          formData.append("images[]", {
            uri: img.uri,
            type: "image/jpeg",
            name: `product_image_${index}.jpg`,
          } as any);
        }
      });

      console.log("📤 Sending update request...");

      // Use POST with _method override instead of PUT
      const response = await fetch(
        `https://yemi.store/api/v2/seller/products/update/${id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            // Don't set Content-Type for FormData, let the browser set it with boundary
          },
          body: formData,
        }
      );

      const data = await response.json();

      console.log("📥 Response status:", response.status);
      console.log("📥 Response data:", data);

      // Check if there are errors
      if (data.errors && data.errors.length > 0) {
        console.error("❌ Update failed with errors:", data.errors);
        const errorMessages = data.errors.map((e: any) => e.message).join("\n");
        Alert.alert("Update Failed", errorMessages);
        setUpdating(false);
        return;
      }

      if (!response.ok) {
        console.error("❌ Update failed:", data);
        Alert.alert("Error", data.message || "Failed to update product.");
        setUpdating(false);
        return;
      }

      console.log("✅ Product updated successfully:", data);
      Alert.alert("Success", "Product updated successfully!", [
        {
          text: "OK",
          onPress: () => {
            console.log("🔙 Navigating back to products list...");
            router.push("/myProducts")
          },
        },
      ]);
    } catch (err: any) {
      console.error("❌ Upload error:", err.message);
      Alert.alert("Error", "Failed to update product. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <AddProductHeader
          title="Edit Product"
          leftIcon="arrow-back"
          onLeftPress={() => router.back()}
          rightIcon="ellipsis-vertical"
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FA8232" />
          <Text style={styles.loadingText}>Loading product...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AddProductHeader
        title="Edit Product"
        leftIcon="arrow-back"
        onLeftPress={() => router.back()}
        rightIcon="ellipsis-vertical"
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Product Info */}
        <Text style={styles.info}>Product Information</Text>
        <View style={styles.information}>
          <ImagePickerBox
            label="Product Thumbnail"
            existingImages={thumbnail ? [thumbnail.uri] : []}
            onImagesChange={(uris) =>
              setThumbnail(
                uris[0]
                  ? { uri: uris[0], type: "image/jpeg", name: "thumbnail.jpg" }
                  : null
              )
            }
          />
          <ImagePickerBox
            label="Product Images"
            existingImages={images.map((img) => img.uri)}
            onImagesChange={(uris) =>
              setImages(
                uris.map((uri, index) => ({
                  uri,
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
          <Input
            label="Category ID"
            value={categoryId}
            onChangeText={setCategoryId}
          />
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
          <Input label="Brand ID" value={brandId} onChangeText={setBrandId} />
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
            keyboardType="numeric"
          />
          <Input
            label="Minimum Order Qty"
            value={minimumOrderQty}
            onChangeText={setMinimumOrderQty}
            keyboardType="numeric"
          />
          <Input
            label="Current Stock"
            value={currentStock}
            onChangeText={setCurrentStock}
            keyboardType="numeric"
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
            keyboardType="numeric"
          />
          <Input
            label="Tax"
            value={tax}
            onChangeText={setTax}
            keyboardType="numeric"
          />
          <Input
            label="Purchase Price"
            value={purchasePrice}
            onChangeText={setPurchasePrice}
            keyboardType="numeric"
          />
          <Input label="Unit" value={unit} onChangeText={setUnit} />
          <Input
            label="Shipping Cost"
            value={shippingCost}
            onChangeText={setShippingCost}
            keyboardType="numeric"
          />
        </View>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <PrimaryButton
            title={updating ? "Updating..." : "Update Product"}
            onPress={handleUpdateProduct}
            variant="primary"
            disabled={updating}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditProduct;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 20 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#888",
  },
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
    marginTop: 20,
    alignItems: "center",
  },
});
