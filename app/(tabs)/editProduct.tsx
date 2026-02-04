import AddProductHeader from "@/components/Header";
import Input from "@/components/input";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  View,
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

/* ---------------- ENHANCED IMAGE MANAGER ---------------- */
const ImageManager = ({ label, images, onImagesChange, onPickNew }) => {
  const removeImage = (index) => {
    Alert.alert(
      "Remove Image",
      "Are you sure you want to remove this image?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            const newImages = images.filter((_, i) => i !== index);
            onImagesChange(newImages);
          },
        },
      ]
    );
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
          <LinearGradient
            colors={["#FA8232", "#FF6B35"]}
            style={styles.addButtonGradient}
          >
            <Ionicons name="add" size={32} color="#FFF" />
            <Text style={styles.addButtonText}>Add More</Text>
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </View>
  );
};

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
  const [published, setPublished] = useState("1");
  const [status, setStatus] = useState("1");
  const [author, setAuthor] = useState("");
  const [publishingHouse, setPublishingHouse] = useState("");
  const [deliveryType, setDeliveryType] = useState("");

  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(headerFadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Pulse animation for update button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

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

        const res = await axios.get(
          `https://yemi.store/api/v2/seller/products/list`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        let productsArray: any[] = [];
        if (Array.isArray(res.data)) {
          productsArray = res.data;
        } else if (Array.isArray(res.data.products)) {
          productsArray = res.data.products;
        } else if (Array.isArray(res.data.products?.data)) {
          productsArray = res.data.products.data;
        }

        const product = productsArray.find(
          (p: any) => p.id?.toString() === productId?.toString()
        );

        if (!product) {
          Alert.alert("Error", "Product not found", [
            { text: "OK", onPress: () => router.back() },
          ]);
          return;
        }

        setName(product.name || "");
        setDescription(product.details || product.description || "");

        let categoryId = "";
        if (product.category_ids) {
          try {
            const categoryIdsArray = JSON.parse(product.category_ids);
            if (Array.isArray(categoryIdsArray) && categoryIdsArray.length > 0) {
              categoryId = categoryIdsArray[0]?.id?.toString() || "";
            }
          } catch (e) {
            console.log("Could not parse category_ids");
          }
        }
        setSelectedCategory(categoryId || product.category_id?.toString() || "");

        setSubCategoryId(product.sub_category_id?.toString() || "");
        setSubSubCategoryId(product.sub_sub_category_id?.toString() || "");
        setBrandId(product.brand_id?.toString() || "");
        setProductType(product.product_type?.toLowerCase() || "physical");
        setCode(product.code || "");
        setUnitPrice(product.unit_price?.toString() || "");
        setMinimumOrderQty(
          product.minimum_order_qty?.toString() || product.min_qty?.toString() || "1"
        );
        setCurrentStock(product.current_stock?.toString() || "0");
        setDiscountType(product.discount_type || "flat");
        setDiscount(product.discount?.toString() || "0");
        setTax(product.tax?.toString() || "0");
        setTaxCalculation(product.tax_model || "");
        setShippingCost(product.shipping_cost?.toString() || "0");
        setPurchasePrice(product.purchase_price?.toString() || "");
        setUnit(product.unit || "pc");
        setPublished(product.published?.toString() || "1");
        setStatus(product.status?.toString() || "1");
        setAuthor(product.author || "");
        setPublishingHouse(product.publishing_house || "");
        setDeliveryType(product.delivery_type || "");

        // Load thumbnail
        let thumbnailData = null;
        if (product.thumbnail_full_url?.path) {
          thumbnailData = {
            uri: product.thumbnail_full_url.path,
            name: "thumbnail.jpg",
            type: "image/jpeg",
            isExisting: true,
          };
        } else if (product.thumbnail) {
          const thumbnailUri = product.thumbnail.startsWith("http")
            ? product.thumbnail
            : `https://yemi.store/storage/app/public/product/thumbnail/${product.thumbnail}`;

          thumbnailData = {
            uri: thumbnailUri,
            name: "thumbnail.jpg",
            type: "image/jpeg",
            isExisting: true,
          };
        }
        setThumbnail(thumbnailData);

        // Load images
        let loadedImages: any[] = [];

        if (Array.isArray(product.images_full_url) && product.images_full_url.length > 0) {
          loadedImages = product.images_full_url
            .filter((img: any) => img?.path && img?.status === 200)
            .map((img: any, i: number) => ({
              uri: img.path,
              name: `image_${i}.jpg`,
              type: "image/jpeg",
              isExisting: true,
            }));
        } else if (product.images) {
          try {
            let imagesArray: any[] = [];

            if (typeof product.images === "string") {
              imagesArray = JSON.parse(product.images);
            } else if (Array.isArray(product.images)) {
              imagesArray = product.images;
            }

            loadedImages = imagesArray
              .filter((img: any) => {
                if (typeof img === "object" && img.image_name) {
                  return true;
                }
                if (typeof img === "string" && img.trim() !== "") {
                  return true;
                }
                return false;
              })
              .map((img: any, i: number) => {
                let imagePath = "";

                if (typeof img === "object" && img.image_name) {
                  imagePath = img.image_name;
                } else if (typeof img === "string") {
                  imagePath = img;
                }

                const imageUri = imagePath.startsWith("http")
                  ? imagePath
                  : `https://yemi.store/storage/app/public/product/${imagePath.trim()}`;

                return {
                  uri: imageUri,
                  name: `image_${i}.jpg`,
                  type: "image/jpeg",
                  isExisting: true,
                };
              });
          } catch (e) {
            console.log("❌ Error parsing images:", e);
          }
        }

        setImages(loadedImages);
      } catch (err: any) {
        console.error("❌ Error fetching product:", err.response?.data || err.message);
        Alert.alert("Error", "Failed to fetch product data.", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

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
        isExisting: false,
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
        isExisting: false,
      }));
      setImages([...images, ...newImages]);
    }
  };

  const handleUpdateProduct = async () => {
    if (!productId) return;

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

      formData.append("_method", "PUT");
      formData.append("published", published);
      formData.append("status", status);
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

      if (productType.toLowerCase() === "digital") {
        if (author) formData.append("author", author.trim());
        if (publishingHouse) formData.append("publishing_house", publishingHouse.trim());
        if (deliveryType) formData.append("delivery_type", deliveryType);
      }

      if (thumbnail?.uri && !thumbnail.isExisting) {
        formData.append("thumbnail", {
          uri: thumbnail.uri,
          type: thumbnail.type || "image/jpeg",
          name: thumbnail.name || "thumbnail.jpg",
        } as any);
      }

      const newImages = images.filter((img) => !img.isExisting);
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
            Accept: "application/json",
          },
        }
      );

      Alert.alert("Success", "Product updated successfully!", [
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
      ]);
    } catch (err: any) {
      console.log("❌ Update error:", err.response?.data || err.message);
      Alert.alert("Error", "Failed to update product. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={["#FA8232", "#FF6B35"]}
          style={styles.header}
        >
          <AddProductHeader
            title="Edit Product"
            leftIcon="arrow-back"
            onLeftPress={() => router.back()}
          />
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FA8232" />
          <Text style={styles.loadingText}>Loading product data...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        {/* Product Images */}
        <AnimatedSection delay={0}>
          <View style={styles.sectionHeader}>
            <Ionicons name="images" size={24} color="#FA8232" />
            <Text style={styles.sectionTitle}>Product Images</Text>
          </View>
          <LinearGradient colors={["#FFFFFF", "#F8F9FA"]} style={styles.card}>
            {/* Thumbnail */}
            <View style={styles.thumbnailSection}>
              <Text style={styles.inputLabel}>Thumbnail</Text>
              {thumbnail?.uri ? (
                <View style={styles.thumbnailContainer}>
                  <Image source={{ uri: thumbnail.uri }} style={styles.thumbnailImage} />
                  <Pressable
                    style={styles.changeThumbnailButton}
                    onPress={handlePickThumbnail}
                  >
                    <Ionicons name="camera" size={20} color="#FA8232" />
                    <Text style={styles.changeThumbnailText}>Change</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable style={styles.uploadButton} onPress={handlePickThumbnail}>
                  <Ionicons name="camera-outline" size={40} color="#FA8232" />
                  <Text style={styles.uploadText}>Upload Thumbnail</Text>
                </Pressable>
              )}
            </View>

            {/* Product Images */}
            <ImageManager
              label="Product Images"
              images={images}
              onImagesChange={setImages}
              onPickNew={handlePickImages}
            />
          </LinearGradient>
        </AnimatedSection>

        {/* Basic Information */}
        <AnimatedSection delay={100}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={24} color="#FA8232" />
            <Text style={styles.sectionTitle}>Basic Information</Text>
          </View>
          <LinearGradient colors={["#FFFFFF", "#F8F9FA"]} style={styles.card}>
            <Input label="Product Name" value={name} onChangeText={setName} required />
            <Input
              label="Description"
              value={description}
              onChangeText={setDescription}
              multiline
              inputStyle={{ textAlignVertical: "top", height: 120 }}
            />
            <Input label="Product SKU" value={code} onChangeText={setCode} required />
            <Input label="Unit" value={unit} onChangeText={setUnit} required />
          </LinearGradient>
        </AnimatedSection>

        {/* Pricing */}
        <AnimatedSection delay={200}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cash" size={24} color="#FA8232" />
            <Text style={styles.sectionTitle}>Pricing & Stock</Text>
          </View>
          <LinearGradient colors={["#FFFFFF", "#F8F9FA"]} style={styles.card}>
            <Input
              label="Unit Price ($)"
              value={unitPrice}
              onChangeText={setUnitPrice}
              keyboardType="numeric"
              required
            />
            <Input
              label="Current Stock"
              value={currentStock}
              onChangeText={setCurrentStock}
              keyboardType="numeric"
              required
            />
            <Input
              label="Minimum Order Qty"
              value={minimumOrderQty}
              onChangeText={setMinimumOrderQty}
              keyboardType="numeric"
              required
            />
          </LinearGradient>
        </AnimatedSection>

        {/* Status */}
        <AnimatedSection delay={300}>
          <View style={styles.sectionHeader}>
            <Ionicons name="toggle" size={24} color="#FA8232" />
            <Text style={styles.sectionTitle}>Product Status</Text>
          </View>
          <LinearGradient colors={["#FFFFFF", "#F8F9FA"]} style={styles.card}>
            <View style={styles.switchContainer}>
              <View style={styles.switchInfo}>
                <Text style={styles.switchLabel}>Publish Product</Text>
                <Text style={styles.switchDescription}>
                  {published === "1"
                    ? "Product is live and visible"
                    : "Product is hidden from customers"}
                </Text>
              </View>
              <Switch
                value={published === "1"}
                onValueChange={(value) => setPublished(value ? "1" : "0")}
                trackColor={{ false: "#ccc", true: "#FA8232" }}
                thumbColor={published === "1" ? "#fff" : "#f4f3f4"}
              />
            </View>
          </LinearGradient>
        </AnimatedSection>

        {/* Update Button */}
        <AnimatedSection delay={400}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Pressable
              style={styles.updateButton}
              onPress={handleUpdateProduct}
              disabled={isUpdating}
            >
              <LinearGradient
                colors={
                  isUpdating ? ["#FFC09F", "#FFB088"] : ["#FA8232", "#FF6B35"]
                }
                style={styles.updateButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isUpdating ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Ionicons name="checkmark-circle" size={24} color="#FFF" />
                )}
                <Text style={styles.updateButtonText}>
                  {isUpdating ? "Updating..." : "Update Product"}
                </Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </AnimatedSection>
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
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },

  /* Section */
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

  /* Thumbnail */
  thumbnailSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  thumbnailContainer: {
    position: "relative",
    alignSelf: "flex-start",
  },
  thumbnailImage: {
    width: 150,
    height: 150,
    borderRadius: 16,
    backgroundColor: "#F0F0F0",
  },
  changeThumbnailButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "#FFF",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  changeThumbnailText: {
    color: "#FA8232",
    fontSize: 13,
    fontWeight: "600",
  },
  uploadButton: {
    width: 150,
    height: 150,
    borderWidth: 2,
    borderColor: "#FA8232",
    borderStyle: "dashed",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF5F0",
  },
  uploadText: {
    marginTop: 8,
    fontSize: 13,
    color: "#FA8232",
    fontWeight: "600",
  },

  /* Image Manager */
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
    bottom: 6,
    left: 6,
    backgroundColor: "#27ae60",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  existingText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "700",
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

  /* Switch */
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  switchInfo: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 13,
    color: "#666",
  },

  /* Update Button */
  updateButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#FA8232",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  updateButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 10,
  },
  updateButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFF",
    letterSpacing: 0.5,
  },
});