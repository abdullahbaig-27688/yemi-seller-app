import AddProductHeader from "@/components/Header";
import Input from "@/components/input";
import { useAuth } from "@/src/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/* ---------------- ANIMATED SECTION COMPONENT ---------------- */
interface AnimatedSectionProps {
  children: React.ReactNode;
  delay?: number;
}

const AnimatedSection: React.FC<AnimatedSectionProps> = ({ children, delay = 0 }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      {children}
    </Animated.View>
  );
};

/* ---------------- IMAGE PICKER COMPONENT ---------------- */
interface EnhancedImagePickerProps {
  label: string;
  images: string[];
  onImagesChange: (urs: string[]) => void;
  multiple?: boolean;
}

const EnhancedImagePicker: React.FC<EnhancedImagePickerProps> = ({ label, images, onImagesChange, multiple = false }) => {
  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: multiple,
      allowsEditing: !multiple,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const newImages = result.assets.map((asset) => asset.uri);
      onImagesChange(newImages);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i: number) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <View style={styles.imagePickerContainer}>
      <View style={styles.imagePickerHeader}>
        <Text style={styles.imagePickerLabel}>{label}</Text>
        {multiple && images.length > 0 && (
          <Text style={styles.imageCount}>{images.length} image(s)</Text>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
        {images.map((uri, index) => (
          <View key={index} style={styles.imagePreviewContainer}>
            <Image source={{ uri }} style={styles.imagePreview} />
            <Pressable
              style={styles.removeImageButton}
              onPress={() => removeImage(index)}
            >
              <Ionicons name="close-circle" size={24} color="#e74c3c" />
            </Pressable>
          </View>
        ))}

        <Pressable style={styles.addImageButton} onPress={pickImages}>
          <LinearGradient
            colors={["#FA8232", "#FF6B35"]}
            style={styles.addImageGradient}
          >
            <Ionicons name="camera" size={32} color="#FFF" />
            <Text style={styles.addImageText}>
              {images.length === 0 ? "Add Image" : "Add More"}
            </Text>
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </View>
  );
};

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
  const [unit, setUnit] = useState("pc");
  const [unitPrice, setUnitPrice] = useState("");
  const [minimumOrderQty, setMinimumOrderQty] = useState("1");
  const [currentStock, setCurrentStock] = useState("0");
  const [discountType, setDiscountType] = useState("percent");
  const [discount, setDiscount] = useState("0");
  const [tax, setTax] = useState("0");
  const [taxCalculation, setTaxCalculation] = useState("");
  const [shippingCost, setShippingCost] = useState("0");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [thumbnailImages, setThumbnailImages] = useState<string[]>([]);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);


  // Digital product specific fields
  const [author, setAuthor] = useState("");
  const [publishingHouse, setPublishingHouse] = useState("");
  const [deliveryType, setDeliveryType] = useState("");
  const { isAuthenticated, logout, token } = useAuth();

  const headerFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerFadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const unitOptions = [
    { label: "Piece (pc)", value: "pc" },
    { label: "Kilogram (kg)", value: "kg" },
    { label: "Gram (g)", value: "g" },
    { label: "Liter (L)", value: "L" },
    { label: "Milliliter (ml)", value: "ml" },
    { label: "Meter (m)", value: "m" },
    { label: "Centimeter (cm)", value: "cm" },
    { label: "Box", value: "box" },
    { label: "Pack", value: "pack" },
    { label: "Dozen", value: "dozen" },
    { label: "Pair", value: "pair" },
    { label: "Set", value: "set" },
    { label: "Carton", value: "carton" },
    { label: "Bundle", value: "bundle" },
    { label: "Roll", value: "roll" },
    { label: "Sheet", value: "sheet" },
  ];

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Please allow access to your media library");
      }
    })();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!token) return;
      try {
        const res = await fetch("https://yemi.store/api/v1/categories", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const text = await res.text();
        const data = JSON.parse(text);

        if (Array.isArray(data)) {
          setCategories(data);
        } else {
          setCategories([]);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setCategories([]);
      }
    };

    fetchCategories();
  }, [token]);

  useEffect(() => {
    const fetchBrands = async () => {
      if (!token) return;
      try {
        const res = await fetch("https://yemi.store/api/v1/brands", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const text = await res.text();
        const data = JSON.parse(text);

        if (Array.isArray(data.brands)) {
          setBrands(data.brands);
        } else {
          setBrands([]);
        }
      } catch (err) {
        console.error("Error fetching brands:", err);
        setBrands([]);
      }
    };

    fetchBrands();
  }, [token]);

  const handleAddProduct = async (publish: boolean) => {
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
    if (!code.trim()) {
      Alert.alert("Validation Error", "Product SKU is required");
      return;
    }
    if (!unit) {
      Alert.alert("Validation Error", "Please select a unit");
      return;
    }

    try {
      setIsPublishing(true);

      if (!token) {
        Alert.alert("Error", "Seller token not found. Please log in again.");
        return;
      }

      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("description", description.trim());
      formData.append("category_id", selectedCategory || "1");
      formData.append("sub_category_id", subCategoryId || "");
      formData.append("sub_sub_category_id", subSubCategoryId || "");
      formData.append("brand_id", brandId || "");
      formData.append("product_type", productType);
      formData.append("code", code.trim() || `SKU-${Date.now()}`);
      formData.append("unit", unit);
      formData.append("unit_price", unitPrice);
      formData.append("minimum_order_qty", minimumOrderQty);
      formData.append("current_stock", currentStock);
      formData.append("discount_type", discountType);
      formData.append("discount", discount);
      formData.append("tax", tax);
      formData.append("lang", "en");
      formData.append("purchase_price", purchasePrice);
      formData.append("shipping_cost", shippingCost);
      formData.append("published", publish ? "1" : "0");

      if (taxCalculation) {
        formData.append("tax_calculation", taxCalculation);
      }

      if (productType.toLowerCase() === "digital") {
        formData.append("author", author.trim());
        formData.append("publishing_house", publishingHouse.trim());
        formData.append("delivery_type", deliveryType);
      }

      // Thumbnail
      if (thumbnailImages.length > 0) {
        const uri = thumbnailImages[0];
        const fileInfo = await FileSystem.getInfoAsync(uri);
        const localUri = fileInfo.exists ? fileInfo.uri : uri;
        formData.append("thumbnail", {
          uri: localUri,
          type: "image/jpeg",
          name: "thumbnail.jpg",
        } as any);
      }

      // Product Images
      for (let i = 0; i < productImages.length; i++) {
        const uri = productImages[i];
        const fileInfo = await FileSystem.getInfoAsync(uri);
        const localUri = fileInfo.exists ? fileInfo.uri : uri;
        formData.append("images[]", {
          uri: localUri,
          type: "image/jpeg",
          name: `product_image_${i}.jpg`,
        } as any);
      }

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

      Alert.alert(
        "Success",
        `Product ${publish ? "published" : "saved as draft"} successfully!`,
        [
          {
            text: "OK",
            onPress: () => {
              router.replace({
                pathname: "/myProducts",
                params: {
                  refresh: Date.now().toString(),
                  resetFilters: "true",
                },
              });
            },
          },
        ]
      );
    } catch (err: any) {
      if (err.response && err.response.data) {
        console.error("❌ Backend error:", err.response.data);

        if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
          const errorMessages = err.response.data.errors
            .map((e: any) => `• ${e.message || e.code}`)
            .join("\n");
          Alert.alert("Validation Errors", errorMessages);
        } else if (err.response.data.message) {
          Alert.alert("Error", err.response.data.message);
        } else {
          Alert.alert("Backend Error", JSON.stringify(err.response.data));
        }
      } else {
        console.error("❌ Upload error:", err.message);
        Alert.alert("Error", "Failed to add product. Check your network or images.");
      }
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={{ opacity: headerFadeAnim }}>
        <LinearGradient
          colors={["#FA8232", "#FF6B35"]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <AddProductHeader
            title="Add Product"
            leftIcon="arrow-back"
            onLeftPress={() => router.back()}
          />
        </LinearGradient>
      </Animated.View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Product Information */}
        <AnimatedSection delay={0}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={24} color="#FA8232" />
            <Text style={styles.sectionTitle}>Product Information</Text>
          </View>
          <LinearGradient colors={["#FFFFFF", "#F8F9FA"]} style={styles.card}>
            <EnhancedImagePicker
              label="Product Thumbnail"
              images={thumbnailImages}
              onImagesChange={setThumbnailImages}
              multiple={true}
            />
            <EnhancedImagePicker
              label="Product Images"
              images={productImages}
              onImagesChange={setProductImages}
              multiple={true}
            />
            <Input
              label="Product Name"
              value={name}
              onChangeText={setName}
              required={true}
              placeholder="Enter product name"
            />
            <Input
              label="Description"
              value={description}
              onChangeText={setDescription}
              multiline
              inputStyle={{ textAlignVertical: "top", height: 120 }}
              placeholder="Describe your product..."
            />
          </LinearGradient>
        </AnimatedSection>

        {/* General Setup */}
        <AnimatedSection delay={100}>
          <View style={styles.sectionHeader}>
            <Ionicons name="settings" size={24} color="#FA8232" />
            <Text style={styles.sectionTitle}>General Setup</Text>
          </View>
          <LinearGradient colors={["#FFFFFF", "#F8F9FA"]} style={styles.card}>
            <Text style={styles.inputLabel}>
              Select Category <Text style={styles.requiredStar}>*</Text>
            </Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedCategory}
                onValueChange={(value) => {
                  setSelectedCategory(value);
                  setSubCategoryId("");
                  setSubSubCategoryId("");
                }}
                style={styles.picker}
              >
                <Picker.Item label="Select Category" value="" />
                {Array.isArray(categories) &&
                  categories.map((cat) => (
                    <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
                  ))}
              </Picker>
            </View>

            <Text style={styles.inputLabel}>Brand</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={brandId}
                onValueChange={(value) => setBrandId(value)}
                style={styles.picker}
              >
                <Picker.Item label="Select Brand" value="" />
                {Array.isArray(brands) &&
                  brands.map((b) => (
                    <Picker.Item key={b.id} label={b.name} value={b.id} />
                  ))}
              </Picker>
            </View>

            <Text style={styles.inputLabel}>
              Product Type <Text style={styles.requiredStar}>*</Text>
            </Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={productType}
                onValueChange={(value) => setProductType(value)}
                style={styles.picker}
              >
                <Picker.Item label="Physical" value="physical" />
                <Picker.Item label="Digital" value="digital" />
              </Picker>
            </View>

            {productType.toLowerCase() === "digital" && (
              <>
                <Input
                  label="Author"
                  value={author}
                  onChangeText={setAuthor}
                  required={true}
                  placeholder="Enter author name"
                />
                <Input
                  label="Publishing House"
                  value={publishingHouse}
                  onChangeText={setPublishingHouse}
                  required={true}
                  placeholder="Enter publishing house"
                />
                <Text style={styles.inputLabel}>
                  Delivery Type <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={deliveryType}
                    onValueChange={(itemValue) => setDeliveryType(itemValue)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select Delivery Type" value="" />
                    <Picker.Item label="Ready after Sell" value="ready after sell" />
                    <Picker.Item label="Ready Product" value="ready product" />
                  </Picker>
                </View>
              </>
            )}

            <Input
              label="Product SKU"
              value={code}
              onChangeText={setCode}
              required={true}
              placeholder="e.g., SKU-12345"
            />

            <Text style={styles.inputLabel}>
              Unit <Text style={styles.requiredStar}>*</Text>
            </Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={unit}
                onValueChange={(value) => setUnit(value)}
                style={styles.picker}
              >
                {unitOptions.map((option) => (
                  <Picker.Item
                    key={option.value}
                    label={option.label}
                    value={option.value}
                  />
                ))}
              </Picker>
            </View>
          </LinearGradient>
        </AnimatedSection>

        {/* Pricing & Inventory */}
        <AnimatedSection delay={200}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cash" size={24} color="#FA8232" />
            <Text style={styles.sectionTitle}>Pricing & Inventory</Text>
          </View>
          <LinearGradient colors={["#FFFFFF", "#F8F9FA"]} style={styles.card}>
            <Input
              label="Unit Price ($)"
              value={unitPrice}
              onChangeText={setUnitPrice}
              required={true}
              keyboardType="numeric"
              placeholder="0.00"
            />
            <Input
              label="Minimum Order Qty"
              value={minimumOrderQty}
              onChangeText={setMinimumOrderQty}
              required={true}
              keyboardType="numeric"
              placeholder="1"
            />
            <Input
              label="Current Stock Qty"
              value={currentStock}
              onChangeText={setCurrentStock}
              required={true}
              keyboardType="numeric"
              placeholder="0"
            />

            <Text style={styles.inputLabel}>Discount Type</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={discountType}
                onValueChange={(itemValue) => setDiscountType(itemValue)}
                style={styles.picker}
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
              placeholder="0"
            />
            <Input
              label="Tax Amount (%)"
              value={tax}
              onChangeText={setTax}
              required={true}
              keyboardType="numeric"
              placeholder="0"
            />

            <Text style={styles.inputLabel}>Tax Calculation</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={taxCalculation}
                onValueChange={(itemValue) => setTaxCalculation(itemValue)}
                style={styles.picker}
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
              placeholder="0.00"
            />
            <Input
              label="Shipping Cost ($)"
              value={shippingCost}
              onChangeText={setShippingCost}
              required={true}
              keyboardType="numeric"
              placeholder="0.00"
            />
          </LinearGradient>
        </AnimatedSection>

        {/* Action Buttons */}
        <AnimatedSection delay={300}>
          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.button, styles.draftButton]}
              onPress={() => handleAddProduct(false)}
              disabled={isPublishing}
            >
              <Ionicons name="document-text" size={20} color="#666" />
              <Text style={styles.draftButtonText}>
                {isPublishing ? "Saving..." : "Save as Draft"}
              </Text>
            </Pressable>

            <Pressable
              style={styles.button}
              onPress={() => handleAddProduct(true)}
              disabled={isPublishing}
            >
              <LinearGradient
                colors={
                  isPublishing ? ["#FFC09F", "#FFB088"] : ["#FA8232", "#FF6B35"]
                }
                style={styles.publishButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                <Text style={styles.publishButtonText}>
                  {isPublishing ? "Publishing..." : "Publish Product"}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </AnimatedSection>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddProduct;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    paddingVertical: 16,
    paddingTop: Platform.OS === "ios" ? 0 : 16,
    elevation: 8,
    shadowColor: "#FA8232",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },

  /* Section Header */
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    letterSpacing: -0.3,
  },

  /* Card */
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },

  /* Image Picker */
  imagePickerContainer: {
    marginBottom: 20,
  },
  imagePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  imagePickerLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  imageCount: {
    fontSize: 13,
    color: "#FA8232",
    fontWeight: "600",
  },
  imageScroll: {
    marginBottom: 10,
  },
  imagePreviewContainer: {
    position: "relative",
    marginRight: 12,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: "#F0F0F0",
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#FFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: "hidden",
  },
  addImageGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  addImageText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },

  /* Input */
  inputLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  requiredStar: {
    color: "#e74c3c",
  },

  /* Picker */
  pickerContainer: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    backgroundColor: "#F8F9FA",
    marginBottom: 20,
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },

  /* Buttons */
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
  button: {
    flex: 1,
    borderRadius: 14,
    overflow: "hidden",
  },
  draftButton: {
    backgroundColor: "#E8E8E8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  draftButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  publishButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  publishButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
    letterSpacing: 0.3,
  },
});