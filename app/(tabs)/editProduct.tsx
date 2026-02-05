import AddProductHeader from "@/components/Header";
import Input from "@/components/input";
import { useAuth } from "@/src/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View
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
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      {children}
    </Animated.View>
  );
};

/* ---------------- IMAGE MANAGER COMPONENT ---------------- */
interface ImageManagerProps {
  label: string;
  images: any[];
  onImagesChange: (images: any[]) => void;
  onPickNew: () => void;
}

const ImageManager: React.FC<ImageManagerProps> = ({ label, images, onImagesChange, onPickNew }) => {
  const removeImage = (index: number) => {
    Alert.alert("Remove Image", "Are you sure you want to remove this image?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => onImagesChange(images.filter((_, i: number) => i !== index)),
      },
    ]);
  };

  return (
    <View style={styles.imageManagerContainer}>
      <View style={styles.imageManagerHeader}>
        <Text style={styles.imageManagerLabel}>{label}</Text>
        <Text style={styles.imageCount}>{images.length} image(s)</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
        {images.map((img: any, index: number) => (
          <View key={index} style={styles.imageItem}>
            <Image source={{ uri: img.uri }} style={styles.imageThumb} />
            <Pressable style={styles.removeButton} onPress={() => removeImage(index)}>
              <Ionicons name="close-circle" size={24} color="#e74c3c" />
            </Pressable>
            {img.isExisting && (
              <View style={styles.existingBadge}>
                <Text style={styles.existingText}>Current</Text>
              </View>
            )}
          </View>
        ))}

        <Pressable style={styles.addButton} onPress={onPickNew}>
          <LinearGradient colors={["#FA8232", "#FF6B35"]} style={styles.addButtonGradient}>
            <Ionicons name="add" size={32} color="#FFF" />
            <Text style={styles.addButtonText}>Add More</Text>
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </View>
  );
};

/* ---------------- EDIT PRODUCT SCREEN ---------------- */
const EditProduct = () => {
  const { token } = useAuth();
  const { productId } = useLocalSearchParams();

  // Basic fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [published, setPublished] = useState("1");
  const [status, setStatus] = useState("1");

  // Product type and inventory
  const [productType, setProductType] = useState("physical");
  const [unit, setUnit] = useState("pc");
  const [minimumOrderQty, setMinimumOrderQty] = useState("1");
  const [currentStock, setCurrentStock] = useState("0");

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

  // Pricing fields
  const [discountType, setDiscountType] = useState("percent");
  const [discount, setDiscount] = useState("0");
  const [tax, setTax] = useState("0");
  const [taxCalculation, setTaxCalculation] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [shippingCost, setShippingCost] = useState("0");

  // Digital product fields
  const [author, setAuthor] = useState("");
  const [publishingHouse, setPublishingHouse] = useState("");
  const [deliveryType, setDeliveryType] = useState("");

  // Categories and brands
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [subSubCategoryId, setSubSubCategoryId] = useState("");
  const [brands, setBrands] = useState<any[]>([]);
  const [brandId, setBrandId] = useState("");

  // Images
  const [images, setImages] = useState<any[]>([]);
  const [thumbnail, setThumbnail] = useState<any>(null);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const headerFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerFadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);



  /* ---------------- FETCH CATEGORIES ---------------- */
  useEffect(() => {
    if (!token) return;
    axios
      .get("https://yemi.store/api/v1/categories", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setCategories(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        if (err.response?.status === 401) router.replace("/loginScreen");
        else setCategories([]);
      });
  }, [token]);

  /* ---------------- FETCH BRANDS ---------------- */
  useEffect(() => {
    if (!token) return;
    axios
      .get("https://yemi.store/api/v1/brands", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setBrands(Array.isArray(res.data.brands) ? res.data.brands : []))
      .catch((err) => {
        if (err.response?.status === 401) router.replace("/loginScreen");
        else setBrands([]);
      });
  }, [token]);

  /* ---------------- FETCH PRODUCT ---------------- */
  useEffect(() => {
    if (!token || !productId) return;

    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get("https://yemi.store/api/v2/seller/products/list", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const productsArray = Array.isArray(res.data) ? res.data : res.data.products?.data || [];
        const product = productsArray.find((p: any) => p.id?.toString() === productId?.toString());

        if (!product) {
          Alert.alert("Error", "Product not found", [{ text: "OK", onPress: () => router.back() }]);
          return;
        }

        setName(product.name || "");
        setDescription(product.details || product.description || "");
        setSelectedCategory(product.category_id?.toString() || "");
        setSubCategoryId(product.sub_category_id?.toString() || "");
        setSubSubCategoryId(product.sub_sub_category_id?.toString() || "");
        setBrandId(product.brand_id?.toString() || "");
        setUnitPrice(product.unit_price?.toString() || "");
        setCode(product.code || "");
        setPublished(product.published?.toString() || "1");
        setStatus(product.status?.toString() || "1");

        setProductType(product.product_type || "physical");
        setUnit(product.unit || "pc");
        setMinimumOrderQty(product.minimum_order_qty?.toString() || "1");
        setCurrentStock(product.current_stock?.toString() || "0");

        setDiscountType(product.discount_type || "percent");
        setDiscount(product.discount?.toString() || "0");
        setTax(product.tax?.toString() || "0");
        setTaxCalculation(product.tax_calculation || "");
        setPurchasePrice(product.purchase_price?.toString() || "");
        setShippingCost(product.shipping_cost?.toString() || "0");

        // Digital
        setAuthor(product.author || "");
        setPublishingHouse(product.publishing_house || "");
        setDeliveryType(product.delivery_type || "");

        setThumbnail(product.thumbnail_full_url?.path
          ? { uri: product.thumbnail_full_url.path, isExisting: true, key: product.thumbnail_full_url.key || product.thumbnail }
          : product.thumbnail
            ? { uri: product.thumbnail.startsWith("http") ? product.thumbnail : `https://yemi.store/storage/app/public/product/thumbnail/${product.thumbnail}`, isExisting: true, key: product.thumbnail }
            : null
        );

        setImages(
          Array.isArray(product.images_full_url)
            ? product.images_full_url.filter((img: any) => img?.path).map((img: any) => ({
              uri: img.path,
              isExisting: true,
              key: img.key || img.path.split('/').pop()
            }))
            : []
        );
      } catch (err: any) {
        if (err.response?.status === 401) router.replace("/loginScreen");
        else Alert.alert("Error", "Failed to fetch product data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [token, productId]);

  /* ---------------- IMAGE PICKERS ---------------- */
  const handlePickThumbnail = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8
    });
    if (!result.canceled && result.assets[0])
      setThumbnail({ uri: result.assets[0].uri, name: "thumbnail.jpg", type: "image/jpeg", isExisting: false });
  };

  const handlePickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8
    });
    if (!result.canceled)
      setImages([...images, ...result.assets.map((asset, i) => ({
        uri: asset.uri,
        name: `image_${i}.jpg`,
        type: "image/jpeg",
        isExisting: false
      }))]);
  };

  /* ---------------- UPDATE PRODUCT ---------------- */
  const handleUpdateProduct = async () => {
    if (!token || !productId) return;
    if (!name.trim() || !unitPrice || parseFloat(unitPrice) <= 0 || !selectedCategory || !code.trim())
      return Alert.alert("Validation Error", "Please fill all required fields correctly.");

    try {
      setIsUpdating(true);
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("name", name.trim());
      formData.append("description", description.trim());
      formData.append("category_id", selectedCategory.toString());
      formData.append("sub_category_id", subCategoryId || "");
      formData.append("sub_sub_category_id", subSubCategoryId || "");
      formData.append("brand_id", brandId || "1");
      formData.append("unit_price", unitPrice);
      formData.append("code", code.trim());
      formData.append("published", published);
      formData.append("status", status);

      // Product type and inventory
      formData.append("product_type", productType);
      formData.append("unit", unit);
      formData.append("minimum_order_qty", minimumOrderQty);
      formData.append("current_stock", currentStock);

      // Pricing
      formData.append("discount_type", discountType);
      formData.append("discount", discount);
      formData.append("tax", tax);
      formData.append("lang", "en");
      if (taxCalculation) formData.append("tax_calculation", taxCalculation);
      if (purchasePrice) formData.append("purchase_price", purchasePrice);
      formData.append("shipping_cost", shippingCost);

      // Digital product fields
      if (productType === "digital") {
        if (author) formData.append("author", author);
        if (publishingHouse) formData.append("publishing_house", publishingHouse);
        if (deliveryType) formData.append("delivery_type", deliveryType);
      }

      if (thumbnail?.uri && !thumbnail.isExisting) {
        formData.append("thumbnail", {
          uri: thumbnail.uri,
          type: thumbnail.type || "image/jpeg",
          name: thumbnail.name || "thumbnail.jpg"
        } as any);
      } else if (thumbnail?.isExisting) {
        formData.append("thumbnail", thumbnail.key);
      }

      images.forEach((img, i) => {
        if (img.isExisting) {
          formData.append("images[]", img.key);
        } else {
          formData.append("images[]", {
            uri: img.uri,
            type: img.type || "image/jpeg",
            name: img.name || `image_${i}.jpg`
          } as any);
        }
      });

      const response = await axios.post(`https://yemi.store/api/v2/seller/products/update/${productId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      console.log("Update Product Response:", response.data);

      Alert.alert("Success", "Product updated successfully!", [
        { text: "OK", onPress: () => router.replace("/myProducts") }
      ]);
    } catch (err: any) {
      if (err.response?.status === 401) router.replace("/loginScreen");
      else Alert.alert("Error", "Failed to update product. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#FA8232", "#FF6B35"]} style={styles.header}>
        <AddProductHeader title="Edit Product" leftIcon="arrow-back" onLeftPress={() => router.back()} />
      </LinearGradient>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FA8232" />
        <Text style={styles.loadingText}>Loading product data...</Text>
      </View>
    </SafeAreaView>
  );

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
            title="Edit Product"
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
            <Text style={styles.inputLabel}>Product Thumbnail</Text>
            <Pressable onPress={handlePickThumbnail} style={styles.thumbnailContainer}>
              {thumbnail ? (
                <Image source={{ uri: thumbnail.uri }} style={styles.thumbnailImage} />
              ) : (
                <View style={styles.thumbnailPlaceholder}>
                  <Ionicons name="image" size={50} color="#999" />
                  <Text style={styles.thumbnailText}>Tap to select thumbnail</Text>
                </View>
              )}
            </Pressable>

            <ImageManager
              label="Product Images"
              images={images}
              onImagesChange={setImages}
              onPickNew={handlePickImages}
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
                    <Picker.Item key={cat.id} label={cat.name} value={cat.id.toString()} />
                  ))}
              </Picker>
            </View>

            <Text style={styles.inputLabel}>Brand</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={brandId}
                onValueChange={setBrandId}
                style={styles.picker}
              >
                <Picker.Item label="Select Brand" value="" />
                {Array.isArray(brands) &&
                  brands.map((b) => (
                    <Picker.Item key={b.id} label={b.name} value={b.id.toString()} />
                  ))}
              </Picker>
            </View>

            <Text style={styles.inputLabel}>
              Product Type <Text style={styles.requiredStar}>*</Text>
            </Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={productType}
                onValueChange={setProductType}
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
                    onValueChange={setDeliveryType}
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
                onValueChange={setUnit}
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
                onValueChange={setDiscountType}
                style={styles.picker}
              >
                <Picker.Item label="Percentage" value="percent" />
                <Picker.Item label="Flat" value="flat" />
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
                onValueChange={setTaxCalculation}
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

        {/* Publish & Status */}
        <AnimatedSection delay={300}>
          <View style={styles.sectionHeader}>
            <Ionicons name="eye" size={24} color="#FA8232" />
            <Text style={styles.sectionTitle}>Publish & Status</Text>
          </View>
          <LinearGradient colors={["#FFFFFF", "#F8F9FA"]} style={styles.card}>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Published</Text>
              <Switch
                value={published === "1"}
                onValueChange={(val) => setPublished(val ? "1" : "0")}
                trackColor={{ false: "#ccc", true: "#FA8232" }}
                thumbColor="#fff"
              />
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Active Status</Text>
              <Switch
                value={status === "1"}
                onValueChange={(val) => setStatus(val ? "1" : "0")}
                trackColor={{ false: "#ccc", true: "#FA8232" }}
                thumbColor="#fff"
              />
            </View>
          </LinearGradient>
        </AnimatedSection>

        <Pressable
          style={[styles.updateButton, isUpdating && styles.updateButtonDisabled]}
          onPress={handleUpdateProduct}
          disabled={isUpdating}
        >
          <LinearGradient
            colors={isUpdating ? ["#E8E8E8", "#D0D0D0"] : ["#FA8232", "#FF6B35"]}
            style={styles.updateButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {isUpdating ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="save" size={20} color="#FFF" />
                <Text style={styles.updateText}>Update Product</Text>
              </>
            )}
          </LinearGradient>
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditProduct;

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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
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

  /* Image Picker Styles Adapted */
  imageManagerContainer: {
    marginBottom: 20,
  },
  imageManagerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  imageManagerLabel: {
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
  imageItem: {
    position: "relative",
    marginRight: 12,
  },
  imageThumb: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: "#F0F0F0",
  },
  removeButton: {
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
  existingBadge: {
    position: "absolute",
    bottom: 4,
    left: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  existingText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  addButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: "hidden",
  },
  addButtonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  addButtonText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },

  /* Thumbnail Specific */
  thumbnailContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  thumbnailImage: {
    width: 120,
    height: 120,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: "#FA8232",
  },
  thumbnailPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  thumbnailText: {
    fontSize: 12,
    color: "#999",
    marginTop: 8,
    fontWeight: "600",
  },

  /* Input Labels */
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

  /* Switch */
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  switchLabel: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },

  /* Update Button */
  updateButton: {
    marginTop: 10,
    borderRadius: 14,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#FA8232",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  updateButtonDisabled: {
    opacity: 0.7,
  },
  updateButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  updateText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFF",
    letterSpacing: 0.5,
  },
});