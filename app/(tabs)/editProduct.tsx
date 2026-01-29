import AddProductHeader from "@/components/Header";
import Input from "@/components/input";
import PrimaryButton from "@/components/primaryButton";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View
} from "react-native";
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
  const [unit, setUnit] = useState("pc");
  const [thumbnail, setThumbnail] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Published and status states
  const [published, setPublished] = useState("1");
  const [status, setStatus] = useState("1");

  // Digital product fields
  const [author, setAuthor] = useState("");
  const [publishingHouse, setPublishingHouse] = useState("");
  const [deliveryType, setDeliveryType] = useState("");

  // Debug state to show loaded data
  const [debugInfo, setDebugInfo] = useState<string>("");

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

        // ✅ Populate ALL fields from product data
        setName(product.name || "");
        setDescription(product.details || product.description || "");

        // ✅ Handle category_ids JSON parsing
        let categoryId = "";
        if (product.category_ids) {
          try {
            const categoryIdsArray = JSON.parse(product.category_ids);
            if (Array.isArray(categoryIdsArray) && categoryIdsArray.length > 0) {
              categoryId = categoryIdsArray[0]?.id?.toString() || "";
            }
          } catch (e) {
            console.log("Could not parse category_ids, using category_id");
          }
        }
        setSelectedCategory(categoryId || product.category_id?.toString() || "");

        setSubCategoryId(product.sub_category_id?.toString() || "");
        setSubSubCategoryId(product.sub_sub_category_id?.toString() || "");
        setBrandId(product.brand_id?.toString() || "");
        setProductType(product.product_type?.toLowerCase() || "physical");
        setCode(product.code || "");
        setUnitPrice(product.unit_price?.toString() || "");
        setMinimumOrderQty(product.minimum_order_qty?.toString() || product.min_qty?.toString() || "1");
        setCurrentStock(product.current_stock?.toString() || "0");
        setDiscountType(product.discount_type || "flat");
        setDiscount(product.discount?.toString() || "0");
        setTax(product.tax?.toString() || "0");
        setTaxCalculation(product.tax_model || "");
        setShippingCost(product.shipping_cost?.toString() || "0");
        setPurchasePrice(product.purchase_price?.toString() || "");
        setUnit(product.unit || "pc");

        // ✅ Set published and status from existing product
        setPublished(product.published?.toString() || "1");
        setStatus(product.status?.toString() || "1");

        // Digital product fields
        setAuthor(product.author || "");
        setPublishingHouse(product.publishing_house || "");
        setDeliveryType(product.delivery_type || "");

        // ✅ THUMBNAIL - Load existing thumbnail
        let thumbnailData = null;
        if (product.thumbnail_full_url?.path) {
          thumbnailData = {
            uri: product.thumbnail_full_url.path,
            name: "thumbnail.jpg",
            type: "image/jpeg",
            isExisting: true
          };
          console.log("📸 Loaded thumbnail:", product.thumbnail_full_url.path);
        } else if (product.thumbnail) {
          const thumbnailUri = product.thumbnail.startsWith('http')
            ? product.thumbnail
            : `https://yemi.store/storage/app/public/product/thumbnail/${product.thumbnail}`;

          thumbnailData = {
            uri: thumbnailUri,
            name: "thumbnail.jpg",
            type: "image/jpeg",
            isExisting: true
          };
          console.log("📸 Loaded thumbnail:", thumbnailUri);
        }
        setThumbnail(thumbnailData);

        // ✅ IMAGES - Load existing images with proper parsing
        let loadedImages: any[] = [];

        // Try images_full_url first (best option)
        if (Array.isArray(product.images_full_url) && product.images_full_url.length > 0) {
          loadedImages = product.images_full_url
            .filter((img: any) => img?.path && img?.status === 200)
            .map((img: any, i: number) => ({
              uri: img.path,
              name: `image_${i}.jpg`,
              type: "image/jpeg",
              isExisting: true
            }));
          console.log("📸 Loaded", loadedImages.length, "images from images_full_url");
        }
        // Try parsing images JSON string
        else if (product.images) {
          try {
            let imagesArray: any[] = [];

            // Parse if it's a string
            if (typeof product.images === 'string') {
              imagesArray = JSON.parse(product.images);
            } else if (Array.isArray(product.images)) {
              imagesArray = product.images;
            }

            // Handle different formats
            loadedImages = imagesArray
              .filter((img: any) => {
                // Handle object format: {image_name: "...", storage: "..."}
                if (typeof img === 'object' && img.image_name) {
                  return true;
                }
                // Handle string format
                if (typeof img === 'string' && img.trim() !== '') {
                  return true;
                }
                return false;
              })
              .map((img: any, i: number) => {
                let imagePath = '';

                // Extract image name from object or string
                if (typeof img === 'object' && img.image_name) {
                  imagePath = img.image_name;
                } else if (typeof img === 'string') {
                  imagePath = img;
                }

                // Build full URL
                const imageUri = imagePath.startsWith('http')
                  ? imagePath
                  : `https://yemi.store/storage/app/public/product/${imagePath.trim()}`;

                return {
                  uri: imageUri,
                  name: `image_${i}.jpg`,
                  type: "image/jpeg",
                  isExisting: true
                };
              });
            console.log("📸 Loaded", loadedImages.length, "images from images field");
          } catch (e) {
            console.log("❌ Error parsing images:", e);
          }
        }

        setImages(loadedImages);

        // Set debug info for UI display
        const debugText = `
Product: ${product.name}
Thumbnail: ${thumbnailData ? '✅ Loaded' : '❌ Not found'}
Images: ${loadedImages.length} loaded
Published: ${product.published}
Status: ${product.status}
        `.trim();
        setDebugInfo(debugText);

        console.log("✅ Product data loaded successfully");
        console.log("📊 Thumbnail state:", thumbnailData);
        console.log("📊 Images state:", loadedImages);

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

  // ------------------ Image Picker Handler ------------------
  const handlePickThumbnail = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setThumbnail({
        uri: result.assets[0].uri,
        name: "thumbnail.jpg",
        type: "image/jpeg",
        isExisting: false
      });
    }
  };

  const handlePickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newImages = result.assets.map((asset, i) => ({
        uri: asset.uri,
        name: `image_${i}.jpg`,
        type: "image/jpeg",
        isExisting: false
      }));
      setImages([...images, ...newImages]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

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

      // Add published and status
      formData.append("published", published);
      formData.append("status", status);

      // Basic product info
      formData.append("name", name.trim());
      formData.append("description", description.trim());
      formData.append("category_id", selectedCategory.toString());
      formData.append("sub_category_id", subCategoryId || "");
      formData.append("sub_sub_category_id", subSubCategoryId || "");
      formData.append("brand_id", brandId || "1");
      formData.append("product_type", productType);
      formData.append("code", code.trim());
      formData.append("unit", unit.trim() || "pc");
      formData.append("unit_price", unitPrice);
      formData.append("purchase_price", purchasePrice || "0");
      formData.append("minimum_order_qty", minimumOrderQty);
      formData.append("current_stock", currentStock);
      formData.append("discount_type", discountType);
      formData.append("discount", discount || "0");
      formData.append("tax", tax || "0");
      formData.append("shipping_cost", shippingCost || "0");
      formData.append("lang", "en");

      if (taxCalculation) {
        formData.append("tax_calculation", taxCalculation);
      }

      // Digital product fields
      if (productType.toLowerCase() === "digital") {
        if (author) formData.append("author", author.trim());
        if (publishingHouse) formData.append("publishing_house", publishingHouse.trim());
        if (deliveryType) formData.append("delivery_type", deliveryType);
      }

      // Thumbnail - only if it's NEW
      if (thumbnail?.uri && !thumbnail.isExisting) {
        console.log("📎 Adding NEW thumbnail");
        formData.append("thumbnail", {
          uri: thumbnail.uri,
          type: thumbnail.type || "image/jpeg",
          name: thumbnail.name || "thumbnail.jpg",
        } as any);
      }

      // Images - only NEW files
      const newImages = images.filter(img => !img.isExisting);
      console.log("📎 Adding", newImages.length, "new images");
      newImages.forEach((img, i) => {
        formData.append("images[]", {
          uri: img.uri,
          type: img.type || "image/jpeg",
          name: img.name || `image_${i}.jpg`,
        } as any);
      });

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

      console.log("✅ Update successful:", res.data);

      Alert.alert(
        "Success",
        "Product updated successfully!",
        [
          {
            text: "OK",
            onPress: () => {
              router.replace({
                pathname: "/myProducts",
                params: {
                  refresh: Date.now().toString(),
                  resetFilters: "true"
                }
              });
            }
          }
        ]
      );

    } catch (err: any) {
      console.log("❌ Update error:", err.response?.data || err.message);
      Alert.alert("Error", "Failed to update product. Please try again.");
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
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Debug Info */}
        {/* {debugInfo && (
          <View style={styles.debugBox}>
            <Text style={styles.debugText}>{debugInfo}</Text>
          </View>
        )} */}

        <Text style={styles.info}>Product Information</Text>
        <View style={styles.information}>
          {/* Thumbnail Section */}
          <View style={styles.imageSection}>
            <Text style={styles.inputLabel}>Product Thumbnail</Text>
            {thumbnail?.uri ? (
              <View style={styles.thumbnailPreview}>
                <Image source={{ uri: thumbnail.uri }} style={styles.thumbnailImage} />
                <Pressable
                  style={styles.removeButton}
                  onPress={() => setThumbnail(null)}
                >
                  <Ionicons name="close-circle" size={24} color="#eb3b5a" />
                </Pressable>
              </View>
            ) : (
              <Pressable style={styles.uploadBox} onPress={handlePickThumbnail}>
                <Ionicons name="camera-outline" size={40} color="#FA8232" />
                <Text style={styles.uploadText}>Tap to upload thumbnail</Text>
              </Pressable>
            )}
          </View>

          {/* Images Section */}
          <View style={styles.imageSection}>
            <Text style={styles.inputLabel}>Product Images ({images.length})</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {images.map((img, index) => (
                <View key={index} style={styles.imagePreview}>
                  <Image source={{ uri: img.uri }} style={styles.productImage} />
                  <Pressable
                    style={styles.removeImageButton}
                    onPress={() => handleRemoveImage(index)}
                  >
                    <Ionicons name="close-circle" size={20} color="#eb3b5a" />
                  </Pressable>
                  {img.isExisting && (
                    <View style={styles.existingBadge}>
                      <Text style={styles.existingText}>Existing</Text>
                    </View>
                  )}
                </View>
              ))}
              <Pressable style={styles.addImageBox} onPress={handlePickImages}>
                <Ionicons name="add-circle-outline" size={40} color="#FA8232" />
                <Text style={styles.uploadText}>Add More</Text>
              </Pressable>
            </ScrollView>
          </View>

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
          <Text style={styles.inputLabel}>
            Select Category <Text style={styles.requiredStar}>*</Text>
          </Text>
          <View style={styles.inputForm}>
            <Picker
              selectedValue={selectedCategory}
              onValueChange={(value) => {
                setSelectedCategory(value.toString());
                setSubCategoryId("");
                setSubSubCategoryId("");
              }}
            >
              <Picker.Item label="Select Category" value="" />
              {categories.map((cat) => (
                <Picker.Item
                  key={cat.id}
                  label={cat.name}
                  value={cat.id.toString()}
                />
              ))}
            </Picker>
          </View>

          <Text style={styles.inputLabel}>Brand</Text>
          <View style={styles.inputForm}>
            <Picker
              selectedValue={brandId}
              onValueChange={(value) => setBrandId(value.toString())}
            >
              <Picker.Item label="Select Brand" value="" />
              {brands.map((b) => (
                <Picker.Item
                  key={b.id}
                  label={b.name}
                  value={b.id.toString()}
                />
              ))}
            </Picker>
          </View>

          <Text style={styles.inputLabel}>
            Product Type <Text style={styles.requiredStar}>*</Text>
          </Text>
          <View style={styles.inputForm}>
            <Picker
              selectedValue={productType}
              onValueChange={(value) => setProductType(value)}
            >
              <Picker.Item label="Physical" value="physical" />
              <Picker.Item label="Digital" value="digital" />
            </Picker>
          </View>

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

        {/* Product Status */}
        <Text style={styles.info}>Product Status</Text>
        <View style={styles.information}>
          <View style={styles.switchContainer}>
            <View style={styles.switchLabelContainer}>
              <Text style={styles.switchLabel}>Publish Product</Text>
              <Text style={styles.switchDescription}>
                {published === "1"
                  ? "Product is live and visible to customers"
                  : "Product is in draft mode and not visible"}
              </Text>
            </View>
            <Switch
              value={published === "1"}
              onValueChange={(value) => setPublished(value ? "1" : "0")}
              trackColor={{ false: "#ccc", true: "#FA8232" }}
              thumbColor={published === "1" ? "#fff" : "#f4f3f4"}
            />
          </View>
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
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  switchLabelContainer: {
    flex: 1,
    marginRight: 10,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 13,
    color: "#666",
  },
  debugBox: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  debugText: {
    fontSize: 12,
    color: "#333",
    fontFamily: "monospace",
  },
  imageSection: {
    marginBottom: 20,
  },
  thumbnailPreview: {
    position: "relative",
    alignSelf: "flex-start",
  },
  thumbnailImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
  },
  removeButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  uploadBox: {
    width: 150,
    height: 150,
    borderWidth: 2,
    borderColor: "#FA8232",
    borderStyle: "dashed",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff5f0",
  },
  uploadText: {
    marginTop: 8,
    fontSize: 12,
    color: "#666",
  },
  imagePreview: {
    position: "relative",
    marginRight: 10,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  removeImageButton: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  existingBadge: {
    position: "absolute",
    bottom: 4,
    left: 4,
    backgroundColor: "#2dce89",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  existingText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  addImageBox: {
    width: 100,
    height: 100,
    borderWidth: 2,
    borderColor: "#FA8232",
    borderStyle: "dashed",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff5f0",
  },
});