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
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const EditProduct = () => {
  const { productId } = useLocalSearchParams(); // Get product ID from route
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
  const [thumbnail, setThumbnail] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

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
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        const token = await AsyncStorage.getItem("seller_token");
        const res = await axios.get(
          `https://yemi.store/api/v2/seller/products/${productId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const product = res.data;

        setName(product.name);
        setDescription(product.description);
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

        // Digital product
        setAuthor(product.author || "");
        setPublishingHouse(product.publishing_house || "");
        setDeliveryType(product.delivery_type || "");

        // Thumbnail & Images
        if (product.thumbnail) setThumbnail({ uri: product.thumbnail, name: "thumbnail.jpg", type: "image/jpeg" });
        if (Array.isArray(product.images))
          setImages(product.images.map((img: string, i: number) => ({ uri: img, name: `image_${i}.jpg`, type: "image/jpeg" })));

      } catch (err: any) {
        console.error("Error fetching product:", err.response?.data || err.message);
        Alert.alert("Error", "Failed to fetch product data.");
      }
    };

    fetchProduct();
  }, [productId]);

  // ------------------ Update Product Handler ------------------
  const handleUpdateProduct = async () => {
    if (!productId) return;
    try {
      setIsUpdating(true);

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
      formData.append("purchase_price", purchasePrice);
      formData.append("shipping_cost", shippingCost);
      formData.append("lang", "en");

      // Digital product fields
      if (productType.toLowerCase() === "digital") {
        formData.append("author", author);
        formData.append("publishing_house", publishingHouse);
        formData.append("delivery_type", deliveryType);
      }

      // Thumbnail
      if (thumbnail?.uri) {
        formData.append("thumbnail", {
          uri: thumbnail.uri,
          type: thumbnail.type || "image/jpeg",
          name: thumbnail.name || "thumbnail.jpg",
        });
      }

      // Images
      images.forEach((img, i) => {
        formData.append("images[]", {
          uri: img.uri,
          type: img.type || "image/jpeg",
          name: img.name || `image_${i}.jpg`,
        });
      });

      const res = await axios.post(
        `https://yemi.store/api/v2/seller/products/update/${productId}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        }
      );

      console.log("✅ Product updated:", res.data);
      Alert.alert("Success", "Product updated successfully!");
      router.back();
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        if (err.response) {
          console.error("❌ Axios response error:", err.response.data);
          Alert.alert(
            "Update Failed",
            err.response.data?.message || JSON.stringify(err.response.data)
          );
        } else {
          console.error("❌ Axios network/error:", err.message);
          Alert.alert("Update Failed", `Network or server error: ${err.message}`);
        }
      } else {
        console.error("❌ Unexpected error:", err);
        Alert.alert("Update Failed", "An unexpected error occurred.");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AddProductHeader
        title="Edit Product"
        leftIcon="arrow-back"
        onLeftPress={() => router.back()}
      />

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: "30%" }} showsVerticalScrollIndicator={false}>
        <Text style={styles.info}>Product Information</Text>
        <View style={styles.information}>
          <ImagePickerBox
            label="Product Thumbnail"
            onImagesChange={(uris) =>
              setThumbnail(
                uris[0]
                  ? { uri: uris[0].startsWith("file://") ? uris[0] : `file://${uris[0]}`, type: "image/jpeg", name: "thumbnail.jpg" }
                  : null
              )
            }
            existingImage={thumbnail?.uri} // optional prop for pre-filled image
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
            existingImages={images.map((i) => i.uri)} // optional prop
          />
          <Input label="Product Name" value={name} onChangeText={setName} required />
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
                setSelectedCategory(value);
                setSubCategoryId("");
                setSubSubCategoryId("");
              }}
            >
              <Picker.Item label="Select Category" value="" />

              {Array.isArray(categories) &&
                categories.map((cat) => (
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
              onValueChange={(value) => setBrandId(value)}
            >
              <Picker.Item label="Select Brand" value="" />

              {Array.isArray(brands) &&
                brands.map((b) => (
                  <Picker.Item
                    key={b.id}
                    label={b.name}
                    value={b.id}
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
              onValueChange={(value) => setProductType(value)}
            >
              <Picker.Item label="Physical" value="Physical" />
              <Picker.Item label="Digital" value="Digital" />
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

        {/* Repeat the General Setup, Pricing & Inventory, Buttons... */}
        {/* For brevity, you can copy the same sections from AddProduct.tsx */}
        {/* Ensure you replace `handleAddProduct` with `handleUpdateProduct` */}

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
  info: { fontSize: 24, color: "#FA8232", fontWeight: "500", marginBottom: 16, marginTop: 16 },
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
