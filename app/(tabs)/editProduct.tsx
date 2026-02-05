import AddProductHeader from "@/components/Header";
import Input from "@/components/input";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/* ---------------- ANIMATED SECTION COMPONENT ---------------- */
const AnimatedSection = ({ children, delay = 0 }) => {
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
const ImageManager = ({ label, images, onImagesChange, onPickNew }) => {
  const removeImage = (index) => {
    Alert.alert("Remove Image", "Are you sure you want to remove this image?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => onImagesChange(images.filter((_, i) => i !== index)),
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
        {images.map((img, index) => (
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
  const [token, setToken] = useState<string | null>(null);
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

  // Fetch token from secure storage
  useEffect(() => {
    const fetchToken = async () => {
      const t = await SecureStore.getItemAsync("auth_token");
      setToken(t);
    };
    fetchToken();
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
          ? { uri: product.thumbnail_full_url.path, isExisting: true }
          : product.thumbnail
            ? { uri: product.thumbnail.startsWith("http") ? product.thumbnail : `https://yemi.store/storage/app/public/product/thumbnail/${product.thumbnail}`, isExisting: true }
            : null
        );

        setImages(
          Array.isArray(product.images_full_url)
            ? product.images_full_url.filter((img: any) => img?.path).map((img: any) => ({ uri: img.path, isExisting: true }))
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
    if (!name.trim() || !unitPrice || parseFloat(unitPrice) <= 0 || !selectedCategory || !code.trim() || code.trim().length < 6)
      return Alert.alert("Validation Error", "Please fill all required fields correctly.");

    try {
      setIsUpdating(true);
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("name", name.trim());
      formData.append("description", description.trim());
      formData.append("category_id", selectedCategory.toString());
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
      if (taxCalculation) formData.append("tax_calculation", taxCalculation);
      if (purchasePrice) formData.append("purchase_price", purchasePrice);
      formData.append("shipping_cost", shippingCost);

      // Digital product fields
      if (productType === "digital") {
        if (author) formData.append("author", author);
        if (publishingHouse) formData.append("publishing_house", publishingHouse);
        if (deliveryType) formData.append("delivery_type", deliveryType);
      }

      if (thumbnail?.uri && !thumbnail.isExisting)
        formData.append("thumbnail", {
          uri: thumbnail.uri,
          type: thumbnail.type || "image/jpeg",
          name: thumbnail.name || "thumbnail.jpg"
        } as any);

      images.filter(img => !img.isExisting).forEach((img, i) =>
        formData.append("images[]", {
          uri: img.uri,
          type: img.type || "image/jpeg",
          name: img.name || `image_${i}.jpg`
        } as any)
      );

      await axios.post(`https://yemi.store/api/v2/seller/products/update/${productId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      Alert.alert("Success", "Product updated successfully!", [
        { text: "OK", onPress: () => router.back() }
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

      <ScrollView style={{ paddingHorizontal: 16 }} showsVerticalScrollIndicator={false}>
        {/* Images */}
        <AnimatedSection delay={100}>
          <Text style={styles.sectionTitle}>Product Images</Text>
          <Text style={styles.inputLabel}>Thumbnail:</Text>
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
        </AnimatedSection>

        {/* Product Info */}
        <AnimatedSection delay={200}>
          <Text style={styles.sectionTitle}>Product Information</Text>
          <Input label="Product Name *" value={name} onChangeText={setName} />
          <Input
            label="Description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
          <Input label="Product Code *" value={code} onChangeText={setCode} />

          <Text style={styles.inputLabel}>Category *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <Picker.Item label="Select Category" value="" />
              {categories.map((cat) => (
                <Picker.Item key={cat.id} label={cat.name} value={cat.id.toString()} />
              ))}
            </Picker>
          </View>

          <Text style={styles.inputLabel}>Brand</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={brandId}
              onValueChange={setBrandId}
            >
              <Picker.Item label="Select Brand" value="" />
              {brands.map((brand) => (
                <Picker.Item key={brand.id} label={brand.name} value={brand.id.toString()} />
              ))}
            </Picker>
          </View>
        </AnimatedSection>

        {/* Product Type */}
        <AnimatedSection delay={250}>
          <Text style={styles.sectionTitle}>Product Type</Text>
          <Text style={styles.inputLabel}>Product Type *</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={productType} onValueChange={setProductType}>
              <Picker.Item label="Physical" value="physical" />
              <Picker.Item label="Digital" value="digital" />
            </Picker>
          </View>

          {productType === "digital" && (
            <>
              <Input label="Author" value={author} onChangeText={setAuthor} />
              <Input
                label="Publishing House"
                value={publishingHouse}
                onChangeText={setPublishingHouse}
              />
              <Text style={styles.inputLabel}>Delivery Type *</Text>
              <View style={styles.pickerContainer}>
                <Picker selectedValue={deliveryType} onValueChange={setDeliveryType}>
                  <Picker.Item label="Select Delivery Type" value="" />
                  <Picker.Item label="Ready after Sell" value="ready after sell" />
                  <Picker.Item label="Ready Product" value="ready product" />
                </Picker>
              </View>
            </>
          )}
        </AnimatedSection>

        {/* Inventory */}
        <AnimatedSection delay={300}>
          <Text style={styles.sectionTitle}>Inventory</Text>
          <Text style={styles.inputLabel}>Unit *</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={unit} onValueChange={setUnit}>
              <Picker.Item label="Piece (pc)" value="pc" />
              <Picker.Item label="Kilogram (kg)" value="kg" />
              <Picker.Item label="Gram (g)" value="g" />
              <Picker.Item label="Liter (l)" value="l" />
              <Picker.Item label="Milliliter (ml)" value="ml" />
            </Picker>
          </View>
          <Input
            label="Minimum Order Quantity"
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
        </AnimatedSection>

        {/* Pricing */}
        <AnimatedSection delay={350}>
          <Text style={styles.sectionTitle}>Pricing</Text>
          <Input
            label="Unit Price *"
            value={unitPrice}
            onChangeText={setUnitPrice}
            keyboardType="numeric"
          />
          <Input
            label="Purchase Price"
            value={purchasePrice}
            onChangeText={setPurchasePrice}
            keyboardType="numeric"
          />

          <Text style={styles.inputLabel}>Discount Type</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={discountType} onValueChange={setDiscountType}>
              <Picker.Item label="Percent (%)" value="percent" />
              <Picker.Item label="Flat Amount" value="flat" />
            </Picker>
          </View>

          <Input
            label="Discount"
            value={discount}
            onChangeText={setDiscount}
            keyboardType="numeric"
          />
          <Input
            label="Tax (%)"
            value={tax}
            onChangeText={setTax}
            keyboardType="numeric"
          />
          <Input
            label="Shipping Cost"
            value={shippingCost}
            onChangeText={setShippingCost}
            keyboardType="numeric"
          />
        </AnimatedSection>

        {/* Publish & Status */}
        <AnimatedSection delay={400}>
          <Text style={styles.sectionTitle}>Publish & Status</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Published:</Text>
            <Switch
              value={published === "1"}
              onValueChange={(val) => setPublished(val ? "1" : "0")}
              trackColor={{ false: "#ccc", true: "#FA8232" }}
              thumbColor="#fff"
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Active:</Text>
            <Switch
              value={status === "1"}
              onValueChange={(val) => setStatus(val ? "1" : "0")}
              trackColor={{ false: "#ccc", true: "#FA8232" }}
              thumbColor="#fff"
            />
          </View>
        </AnimatedSection>

        <Pressable
          style={[styles.updateButton, isUpdating && styles.updateButtonDisabled]}
          onPress={handleUpdateProduct}
          disabled={isUpdating}
        >
          <LinearGradient
            colors={isUpdating ? ["#ccc", "#999"] : ["#FA8232", "#FF6B35"]}
            style={styles.updateButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {isUpdating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.updateText}>Update Product</Text>
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
    backgroundColor: "#fff"
  },
  header: {
    padding: 16
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#333"
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 12,
    color: "#333"
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
    marginTop: 12,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#f9f9f9",
  },
  thumbnailContainer: {
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  thumbnailImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#FA8232",
  },
  thumbnailPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#ddd",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  thumbnailText: {
    fontSize: 12,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  imageManagerContainer: {
    marginBottom: 16
  },
  imageManagerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8
  },
  imageManagerLabel: {
    fontSize: 16,
    fontWeight: "600"
  },
  imageCount: {
    fontSize: 14,
    color: "#555"
  },
  imageScroll: {
    flexDirection: "row"
  },
  imageItem: {
    marginRight: 12,
    position: "relative"
  },
  imageThumb: {
    width: 100,
    height: 100,
    borderRadius: 8
  },
  removeButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  existingBadge: {
    position: "absolute",
    bottom: 4,
    left: 4,
    backgroundColor: "#0008",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4
  },
  existingText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  addButton: {
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center"
  },
  addButtonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    borderRadius: 8
  },
  addButtonText: {
    color: "#fff",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "600",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  switchLabel: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  updateButton: {
    marginVertical: 24,
    marginHorizontal: 0,
    borderRadius: 8,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  updateButtonDisabled: {
    opacity: 0.6,
  },
  updateButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  updateText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600"
  },
});