import AddProductHeader from "@/components/Header";
import ImagePickerBox from "@/components/imagePickerBox";
import Input from "@/components/input";
import PrimaryButton from "@/components/primaryButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const EditProduct = () => {
  const { productId } = useLocalSearchParams();
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
  const [purchasePrice, setPurchasePrice] = useState("");
  const [unit, setUnit] = useState("pc"); // Add this with other state variables
  const [thumbnail, setThumbnail] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Digital product fields
  const [author, setAuthor] = useState("");
  const [publishingHouse, setPublishingHouse] = useState("");
  const [deliveryType, setDeliveryType] = useState("");

  // ------------------ Permissions ------------------
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Please allow access to your media library");
      }
    })();
  }, []);

  // ------------------ Fetch Categories ------------------
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = await AsyncStorage.getItem("seller_token");
        const res = await fetch("https://yemi.store/api/v1/categories", {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // ------------------ Fetch Brands ------------------
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const token = await AsyncStorage.getItem("seller_token");
        const res = await fetch("https://yemi.store/api/v1/brands", {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        const data = await res.json();
        setBrands(Array.isArray(data.brands) ? data.brands : []);
      } catch (err) {
        console.error("Error fetching brands:", err);
        setBrands([]);
      }
    };
    fetchBrands();
  }, []);

  // ------------------ Fetch Product Data ------------------
  useEffect(() => {
    if (!productId) {
      Alert.alert("Error", "No product ID provided");
      router.back();
      return;
    }

    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const token = await AsyncStorage.getItem("seller_token");

        console.log("🔍 Fetching product ID:", productId);

        // Fetch all products from the list endpoint
        const res = await axios.get(
          `https://yemi.store/api/v2/seller/products/list`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("✅ Products response received");

        // Extract products array from response
        let productsArray: any[] = [];
        if (Array.isArray(res.data)) {
          productsArray = res.data;
        } else if (Array.isArray(res.data.products)) {
          productsArray = res.data.products;
        } else if (Array.isArray(res.data.products?.data)) {
          productsArray = res.data.products.data;
        }

        console.log("📦 Total products:", productsArray.length);

        // Find the specific product by ID
        const product = productsArray.find(
          (p: any) => p.id?.toString() === productId?.toString()
        );

        if (!product) {
          console.log("❌ Product not found in list");
          Alert.alert("Error", "Product not found", [
            { text: "OK", onPress: () => router.back() }
          ]);
          return;
        }

        console.log("✅ Found product:", product.name);

        // Populate all fields
        setName(product.name || "");
        setDescription(product.description || "");
        setSelectedCategory(product.category_id?.toString() || "");
        setSubCategoryId(product.sub_category_id?.toString() || "");
        setSubSubCategoryId(product.sub_sub_category_id?.toString() || "");
        setBrandId(product.brand_id?.toString() || "");
        setProductType(product.product_type || "physical");
        setCode(product.code || "");
        setUnitPrice(product.unit_price?.toString() || "");
        setMinimumOrderQty(product.minimum_order_qty?.toString() || "1");
        setCurrentStock(product.current_stock?.toString() || "0");
        setDiscountType(product.discount_type || "percent");
        setDiscount(product.discount?.toString() || "0");
        setTax(product.tax?.toString() || "0");
        setTaxCalculation(product.tax_calculation || "");
        setShippingCost(product.shipping_cost?.toString() || "0");
        setPurchasePrice(product.purchase_price?.toString() || "");
        // In fetchProduct, add this line:
        setUnit(product.unit || "pc");
        // Digital product fields
        setAuthor(product.author || "");
        setPublishingHouse(product.publishing_house || "");
        setDeliveryType(product.delivery_type || "");

        // Thumbnail
        if (product.thumbnail) {
          setThumbnail({
            uri: product.thumbnail,
            name: "thumbnail.jpg",
            type: "image/jpeg"
          });
        } else if (product.thumbnail_full_url?.path) {
          setThumbnail({
            uri: product.thumbnail_full_url.path,
            name: "thumbnail.jpg",
            type: "image/jpeg"
          });
        }

        // Images
        if (Array.isArray(product.images)) {
          setImages(
            product.images.map((img: string, i: number) => ({
              uri: img,
              name: `image_${i}.jpg`,
              type: "image/jpeg"
            }))
          );
        } else if (Array.isArray(product.images_full_url)) {
          setImages(
            product.images_full_url
              .filter((img: any) => img?.path)
              .map((img: any, i: number) => ({
                uri: img.path,
                name: `image_${i}.jpg`,
                type: "image/jpeg"
              }))
          );
        }

        console.log("✅ Product data loaded successfully");

      } catch (err: any) {
        console.error("❌ Error fetching product:", err.response?.data || err.message);
        Alert.alert("Error", "Failed to fetch product data.", [
          { text: "OK", onPress: () => router.back() }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // ------------------ Update Product Handler ------------------
  const handleUpdateProduct = async () => {
    if (!productId) return;

    // Validation
    if (!name.trim()) {
      Alert.alert("Validation Error", "Product name is required");
      return;
    }
    if (!unitPrice || parseFloat(unitPrice) <= 0) {
      Alert.alert("Validation Error", "Valid unit price is required");
      return;
    }
    if (!selectedCategory) {
      Alert.alert("Validation Error", "Please select a category");
      return;
    }
    if (!code.trim() || code.trim().length < 6) {
      Alert.alert("Validation Error", "Product code must be at least 6 characters");
      return;
    }
    if (!unit.trim()) {
      Alert.alert("Validation Error", "Unit is required (e.g., pc, kg, liter)");
      return;
    }

    try {
      setIsUpdating(true);

      const token = await AsyncStorage.getItem("seller_token");
      if (!token) {
        Alert.alert("Error", "Seller token not found. Please log in again.");
        return;
      }

      const formData = new FormData();

      // CRITICAL FOR LARAVEL: Add _method field to simulate PUT
      formData.append("_method", "PUT");

      // Basic product info
      formData.append("name", name.trim());
      formData.append("description", description.trim());
      formData.append("category_id", selectedCategory.toString());
      formData.append("sub_category_id", subCategoryId || "");
      formData.append("sub_sub_category_id", subSubCategoryId || "");
      formData.append("brand_id", brandId || "1");
      formData.append("product_type", productType); // Keep as "Physical" or "Digital"
      formData.append("code", code.trim());
      formData.append("unit", unit.trim()); // ADD UNIT HERE
      formData.append("unit_price", unitPrice);
      formData.append("purchase_price", purchasePrice || "0");
      formData.append("minimum_order_qty", minimumOrderQty);
      formData.append("current_stock", currentStock);
      formData.append("discount_type", discountType);
      formData.append("discount", discount || "0");
      formData.append("tax", tax || "0");
      formData.append("shipping_cost", shippingCost || "0");
      formData.append("lang", "en");

      // Digital product fields
      if (productType.toLowerCase() === "digital") {
        if (author) formData.append("author", author.trim());
        if (publishingHouse) formData.append("publishing_house", publishingHouse.trim());
        if (deliveryType) formData.append("delivery_type", deliveryType);
      }

      // Thumbnail - only if it's a NEW file
      if (thumbnail?.uri && thumbnail.uri.startsWith("file://")) {
        formData.append("thumbnail", {
          uri: thumbnail.uri,
          type: thumbnail.type || "image/jpeg",
          name: thumbnail.name || "thumbnail.jpg",
        } as any);
      }

      // Images - only NEW files
      const newImages = images.filter(img => img.uri && img.uri.startsWith("file://"));
      newImages.forEach((img, i) => {
        formData.append("images[]", {
          uri: img.uri,
          type: img.type || "image/jpeg",
          name: img.name || `image_${i}.jpg`,
        } as any);
      });

      console.log("🔄 Updating product ID:", productId);
      console.log("📦 Sending FormData with _method=PUT");

      // USE POST with _method=PUT for Laravel
      const res = await axios.post(
        `https://yemi.store/api/v2/seller/products/update/${productId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
            "Accept": "application/json"
          },
        }
      );

      console.log("✅ Product updated successfully:", res.data);

      // Check if response has errors
      if (res.data.errors && res.data.errors.length > 0) {
        const errorMessages = res.data.errors
          .map((e: any) => `• ${e.message}`)
          .join('\n');
        Alert.alert("Validation Errors", errorMessages);
        return;
      }

      Alert.alert(
        "Success",
        "Product updated successfully!",
        [
          {
            text: "OK",
            onPress: () => {
              router.replace({
                pathname: "/myProducts",
                params: { refresh: Date.now().toString() }
              });
            }
          }
        ]
      );

    } catch (err: any) {
      console.log("❌ Update error occurred");

      if (axios.isAxiosError(err)) {
        if (err.response) {
          console.log("❌ Response error:", JSON.stringify(err.response.data));

          const responseData = err.response.data;
          const errors = responseData?.errors;

          if (errors && Array.isArray(errors)) {
            const errorMessages = errors
              .map((e: any) => `• ${e.message || e.code}`)
              .join('\n');
            Alert.alert("Validation Errors", errorMessages);
          } else if (responseData?.message) {
            Alert.alert("Update Failed", responseData.message);
          } else {
            Alert.alert("Update Failed", "Please check all required fields");
          }
        } else if (err.request) {
          console.log("❌ Network error");
          Alert.alert("Network Error", "Please check your internet connection.");
        } else {
          console.log("❌ Request error:", err.message);
          Alert.alert("Error", err.message);
        }
      } else {
        console.log("❌ Unexpected error:", err);
        Alert.alert("Error", "An unexpected error occurred");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <AddProductHeader
          title="Edit Product"
          leftIcon="arrow-back"
          onLeftPress={() => router.back()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FA8232" />
          <Text style={styles.loadingText}>Loading product data...</Text>
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
                    uri: uris[0].startsWith("file://") ? uris[0] : `file://${uris[0]}`,
                    type: "image/jpeg",
                    name: "thumbnail.jpg"
                  }
                  : null
              )
            }
            existingImage={thumbnail?.uri}
          />
          <ImagePickerBox
            label="Product Images"
            onImagesChange={(uris) =>
              setImages(
                uris.map((uri, i) => ({
                  uri: uri.startsWith("file://") ? uri : `file://${uri}`,
                  type: "image/jpeg",
                  name: `product_image_${i}.jpg`,
                }))
              )
            }
            existingImages={images.map((i) => i.uri)}
          />
          <Input
            label="Product Name"
            value={name}
            onChangeText={setName}
            required
          />
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
              onValueChange={(value) => {
                console.log("Category selected:", value);
                setSelectedCategory(value.toString());
                setSubCategoryId("");
                setSubSubCategoryId("");
              }}
            >
              <Picker.Item label="Select Category" value="" />
              {Array.isArray(categories) &&
                categories.map((cat) => (
                  <Picker.Item
                    key={cat.id}
                    label={cat.name}
                    value={cat.id.toString()} // Ensure it's a string
                  />
                ))}
            </Picker>
          </View>
          {/* Select Sub-Category */}
          <Text style={styles.inputLabel}>Select Sub Category</Text>
          <View style={styles.inputForm}>
            <Picker
              selectedValue={subCategoryId}
              onValueChange={(value) => setSubCategoryId(value)}
            >
              <Picker.Item label="Select Sub Category" value="" />
              {/* Add subcategories here based on selectedCategory */}
            </Picker>
          </View>

          {/* Select sub-sub category */}
          <Text style={styles.inputLabel}>Sub-Sub Category</Text>
          <View style={styles.inputForm}>
            <Picker
              selectedValue={subSubCategoryId}
              onValueChange={(value) => setSubSubCategoryId(value)}
            >
              <Picker.Item label="Select Sub Sub Category" value="" />
              {/* Add sub-subcategories here based on subCategoryId */}
            </Picker>
          </View>

          {/* Select Brand */}
          <Text style={styles.inputLabel}>Brand</Text>
          <View style={styles.inputForm}>
            <Picker
              selectedValue={brandId}
              onValueChange={(value) => {
                console.log("Brand selected:", value);
                setBrandId(value.toString());
              }}
            >
              <Picker.Item label="Select Brand" value="" />
              {Array.isArray(brands) &&
                brands.map((b) => (
                  <Picker.Item
                    key={b.id}
                    label={b.name}
                    value={b.id.toString()} // Ensure it's a string
                  />
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
              onValueChange={(value) => {
                console.log("Product type selected:", value);
                setProductType(value);
              }}
            >
              <Picker.Item label="Physical" value="physical" />
              <Picker.Item label="Digital" value="digital" />
            </Picker>
          </View>

          {/* Digital Product Specific Fields */}
          {productType.toLowerCase() === "digital" && (
            <>
              <Input
                label="Author"
                value={author}
                onChangeText={setAuthor}
                required={true}
              />
              <Input
                label="Publishing House"
                value={publishingHouse}
                onChangeText={setPublishingHouse}
                required={true}
              />
              <Text style={styles.inputLabel}>
                Delivery Type <Text style={styles.requiredStar}>*</Text>
              </Text>
              <View style={styles.inputForm}>
                <Picker
                  selectedValue={deliveryType}
                  onValueChange={(itemValue) => setDeliveryType(itemValue)}
                >
                  <Picker.Item label="Select Delivery Type" value="" />
                  <Picker.Item label="Ready after Sell" value="ready after sell" />
                  <Picker.Item label="Ready Product" value="ready product" />
                </Picker>
              </View>
            </>
          )}

          {/* Product SKU Code Field */}
          <Input
            label="Product SKU"
            value={code}
            onChangeText={setCode}
            required={true}
          />
          <Input
            label="Unit"
            value={unit}
            onChangeText={setUnit}
            required={true}
            placeholder="e.g., pc, kg, liter, box"
          />
        </View>

        {/* Pricing & Inventory */}
        <Text style={styles.price}>Pricing & Inventory</Text>
        <View style={styles.information}>
          <Input
            label="Unit Price ($)"
            value={unitPrice}
            onChangeText={setUnitPrice}
            required={true}
            keyboardType="numeric"
          />
          <Input
            label="Minimum Order Qty"
            value={minimumOrderQty}
            onChangeText={setMinimumOrderQty}
            required={true}
            keyboardType="numeric"
          />
          <Input
            label="Current Stock Qty"
            value={currentStock}
            onChangeText={setCurrentStock}
            required={true}
            keyboardType="numeric"
          />

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

          <Input
            label="Discount Amount ($)"
            value={discount}
            onChangeText={setDiscount}
            keyboardType="numeric"
          />
          <Input
            label="Tax Amount (%)"
            value={tax}
            onChangeText={setTax}
            required={true}
            keyboardType="numeric"
          />

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
            keyboardType="numeric"
          />
          <Input
            label="Shipping Cost ($)"
            value={shippingCost}
            onChangeText={setShippingCost}
            required={true}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.buttonRow}>
          <PrimaryButton
            title={isUpdating ? "Updating..." : "Update Product"}
            onPress={handleUpdateProduct}
            variant="primary"
            disabled={isUpdating}
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
  info: {
    fontSize: 24,
    color: "#FA8232",
    fontWeight: "500",
    marginBottom: 16,
    marginTop: 16
  },
  price: {
    fontSize: 24,
    color: "#FA8232",
    fontWeight: "500",
    marginBottom: 16,
    marginTop: 16
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
});