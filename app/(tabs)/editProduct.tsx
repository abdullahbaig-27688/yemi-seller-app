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
import { router, useLocalSearchParams } from "expo-router";

interface Product {
  id?: number;
  name: string;
  description: string;
  category_id?: string;
  sub_category_id?: string;
  sub_sub_category_id?: string;
  brand_id?: string;
  product_type: string;
  code?: string;
  unit_price?: string;
  minimum_order_qty?: string;
  current_stock?: string;
  discount_type?: string;
  discount?: string;
  tax?: string;
  purchase_price?: string;
  shipping_cost?: string;
  unit?: string;
  published?: string;
  thumbnail?: any;
  images?: any[];
}

const EditProduct = () => {
  const { productId } = useLocalSearchParams(); // if editing
  const [product, setProduct] = useState<Product>({
    name: "",
    description: "",
    product_type: "physical",
    minimum_order_qty: "1",
    current_stock: "0",
    discount_type: "percent",
    discount: "0",
    tax: "0",
    unit: "100",
    shipping_cost: "0",
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [subSubCategoryId, setSubSubCategoryId] = useState("");
  const [brands, setBrands] = useState<any[]>([]);
  const [brandId, setBrandId] = useState("");
  const [thumbnail, setThumbnail] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [taxCalculation, setTaxCalculation] = useState("");

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

  // ------------------ Fetch Categories & Brands ------------------
  useEffect(() => {
    fetch("https://yemi.store/api/v1/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("Error fetching categories:", err));

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

  // ------------------ Fetch Product Data if Editing ------------------
  useEffect(() => {
    if (productId) {
      const fetchProduct = async () => {
        try {
          const token = await AsyncStorage.getItem("seller_token");
          if (!token) return;

          const res = await fetch(
            `https://yemi.store/api/v2/seller/products/edit/${productId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const data = await res.json();
          if (!res.ok) {
            console.error("Failed to fetch product:", data);
            return;
          }

          setProduct({
            name: data.name || "",
            description: data.description || "",
            product_type: data.product_type || "physical",
            code: data.code || "",
            unit_price: data.unit_price?.toString() || "0",
            minimum_order_qty: data.minimum_order_qty?.toString() || "1",
            current_stock: data.current_stock?.toString() || "0",
            discount_type: data.discount_type || "percent",
            discount: data.discount?.toString() || "0",
            tax: data.tax?.toString() || "0",
            purchase_price: data.purchase_price?.toString() || "0",
            shipping_cost: data.shipping_cost?.toString() || "0",
            unit: data.unit?.toString() || "100",
          });

          setSelectedCategory(data.category_id || "");
          setSubCategoryId(data.sub_category_id || "");
          setSubSubCategoryId(data.sub_sub_category_id || "");
          setBrandId(data.brand_id || "");
          setTaxCalculation(data.tax_calculation || "");

          setThumbnail(data.thumbnail ? { uri: data.thumbnail } : null);
          setImages(
            data.images
              ? (Array.isArray(data.images) ? data.images : [data.images]).map(
                  (imgUrl: string) => ({ uri: imgUrl })
                )
              : []
          );
        } catch (err) {
          console.error("Error fetching product:", err);
        }
      };
      fetchProduct();
    }
  }, [productId]);

  // ------------------ Submit Handler ------------------
  const handleUpdateProduct = async (publish: boolean) => {
    try {
      const token = await AsyncStorage.getItem("seller_token");
      if (!token) {
        Alert.alert("Error", "Seller token not found. Please log in again.");
        return;
      }
      // Log the product state before submission
      console.log("🔄 Preparing to update product with data:", {
        product,
        selectedCategory,
        subCategoryId,
        subSubCategoryId,
        brandId,
        publish,
        thumbnail,
        images,
      });
      const formData = new FormData();
      formData.append("_method", "PUT"); // Important!
      formData.append("name", product.name);
      formData.append("description", product.description);
      formData.append("category_id", selectedCategory || "1");
      formData.append("sub_category_id", subCategoryId || "");
      formData.append("sub_sub_category_id", subSubCategoryId || "");
      formData.append("brand_id", brandId || "");
      formData.append("product_type", product.product_type);
      // formData.append("code", product.code || `SKU-${Date.now()}`);
      formData.append(
        "code",
        product.code ? Number(product.code).toString() : Date.now().toString()
      );
      formData.append("unit_price", product.unit_price || "0");
      formData.append("minimum_order_qty", product.minimum_order_qty || "1");
      formData.append("current_stock", product.current_stock || "0");
      formData.append("discount_type", product.discount_type || "percent");
      formData.append("discount", product.discount || "0");
      formData.append("tax", product.tax || "0");
      formData.append("tax_calculation", taxCalculation || "");
      formData.append("lang", "en");
      formData.append(
        "purchase_price",
        product.purchase_price || product.unit_price || "0"
      );
      formData.append("shipping_cost", product.shipping_cost || "0");
      formData.append("unit", product.unit || "100");
      formData.append("published", publish ? "1" : "0");

      // Thumbnail
      if (thumbnail) {
        if (thumbnail.uri.startsWith("file://")) {
          const fileInfo = await FileSystem.getInfoAsync(thumbnail.uri);
          const localUri = fileInfo.exists ? fileInfo.uri : thumbnail.uri;
          formData.append("thumbnail", {
            uri: localUri,
            type: thumbnail.type || "image/jpeg",
            name: thumbnail.name || "thumbnail.jpg",
          });
        } else {
          formData.append("existing_thumbnail", thumbnail.uri);
        }
      }

      // Product Images
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if (img.uri.startsWith("file://")) {
          const fileInfo = await FileSystem.getInfoAsync(img.uri);
          const localUri = fileInfo.exists ? fileInfo.uri : img.uri;
          formData.append("images[]", {
            uri: localUri,
            type: img.type || "image/jpeg",
            name: img.name || `product_image_${i}.jpg`,
          });
        }
      }

      console.log("🔄 Sending update request to API...");
      const res = await fetch(
        `https://yemi.store/api/v2/seller/products/update/${productId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: formData,
        }
      );

      const data = await res.json();
      console.log("🔄 API Response:", data);
      if (!res.ok) {
        console.error("❌ Upload failed:", data);
        Alert.alert("Error", "Failed to save product.");
        return;
      }

      Alert.alert("Success", `Product ${publish ? "published" : "saved"}!`);
      console.log("✅ Product updated successfully!");
      router.replace({
        pathname: "/myProducts",
        params: { updatedProduct: JSON.stringify(data) },
      });
    } catch (err: any) {
      console.error("❌ Save product error:", err.message);
      Alert.alert(
        "Error",
        "Failed to save product. Check your network or images."
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AddProductHeader
        title={productId ? "Edit Product" : "Add Product"}
        leftIcon="arrow-back"
        onLeftPress={() => router.back()}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: "30%" }}
        showsVerticalScrollIndicator={false}
      >
        {/* Product Information */}
        <Text style={styles.info}>Product Information</Text>
        <View style={styles.information}>
          <ImagePickerBox
            label="Product Thumbnail"
            existingImages={thumbnail ? [thumbnail.uri] : []}
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
            existingImages={images.map((img) => img.uri)}
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
          <Input
            label="Product Name"
            value={product.name}
            onChangeText={(text) => setProduct({ ...product, name: text })}
            required
          />
          <Input
            label="Description"
            value={product.description}
            onChangeText={(text) =>
              setProduct({ ...product, description: text })
            }
            multiline
            inputStyle={{ textAlignVertical: "top", height: 120 }}
          />
        </View>

        {/* General Setup */}
        <Text style={styles.info}>General Setup</Text>
        <View style={styles.setup}>
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

          <Text style={styles.inputLabel}>Sub Category</Text>
          <Input
            value={subCategoryId}
            onChangeText={setSubCategoryId}
            placeholder="Enter Sub Category ID"
          />

          <Text style={styles.inputLabel}>Sub Sub Category</Text>
          <Input
            value={subSubCategoryId}
            onChangeText={setSubSubCategoryId}
            placeholder="Enter Sub Sub Category ID"
          />

          <Text style={styles.inputLabel}>Brand</Text>
          <View style={styles.inputForm}>
            <Picker selectedValue={brandId} onValueChange={setBrandId}>
              <Picker.Item label="Select Brand" value="" />
              {brands.map((b) => (
                <Picker.Item key={b.id} label={b.name} value={b.id} />
              ))}
            </Picker>
          </View>

          <Text style={styles.inputLabel}>
            Product Type <Text style={styles.requiredStar}>*</Text>
          </Text>
          <View style={styles.inputForm}>
            <Picker
              selectedValue={product.product_type}
              onValueChange={(v) => setProduct({ ...product, product_type: v })}
            >
              <Picker.Item label="Physical" value="physical" />
              <Picker.Item label="Digital" value="digital" />
            </Picker>
          </View>

          <Input
            label="Product SKU"
            value={product.code}
            onChangeText={(text) => setProduct({ ...product, code: text })}
          />
        </View>

        {/* Pricing & Inventory */}
        <Text style={styles.price}>Pricing & Inventory</Text>
        <View style={styles.information}>
          <Input
            label="Unit Price"
            value={product.unit_price}
            onChangeText={(text) =>
              setProduct({ ...product, unit_price: text })
            }
            keyboardType="numeric"
          />
          <Input
            label="Minimum Order Qty"
            value={product.minimum_order_qty}
            onChangeText={(text) =>
              setProduct({ ...product, minimum_order_qty: text })
            }
            keyboardType="numeric"
          />
          <Input
            label="Current Stock"
            value={product.current_stock}
            onChangeText={(text) =>
              setProduct({ ...product, current_stock: text })
            }
            keyboardType="numeric"
          />
          <Text style={styles.inputLabel}>Discount Type</Text>
          <View style={styles.inputForm}>
            <Picker
              selectedValue={product.discount_type}
              onValueChange={(text) =>
                setProduct({ ...product, discount_type: text })
              }
            >
              <Picker.Item label="Percentage" value="percent" />
              <Picker.Item label="Flat" value="flat" />
            </Picker>
          </View>
          <Input
            label="Discount Amount"
            value={product.discount}
            onChangeText={(text) => setProduct({ ...product, discount: text })}
            keyboardType="numeric"
          />
          <Input
            label="Tax (%)"
            value={product.tax}
            onChangeText={(text) => setProduct({ ...product, tax: text })}
            keyboardType="numeric"
          />
          <Text style={styles.inputLabel}>Tax Calculation</Text>
          <View style={styles.inputForm}>
            <Picker
              selectedValue={taxCalculation}
              onValueChange={(v) => setTaxCalculation(v)}
            >
              <Picker.Item label="Select Tax Calculation" value="" />
              <Picker.Item label="Include with Product" value="include" />
              <Picker.Item label="Exclude with Product" value="exclude" />
            </Picker>
          </View>
          <Input
            label="Purchase Price"
            value={product.purchase_price}
            onChangeText={(text) =>
              setProduct({ ...product, purchase_price: text })
            }
            keyboardType="numeric"
          />
          <Input
            label="Unit"
            value={product.unit}
            onChangeText={(text) => setProduct({ ...product, unit: text })}
          />
          <Input
            label="Shipping Cost"
            value={product.shipping_cost}
            onChangeText={(text) =>
              setProduct({ ...product, shipping_cost: text })
            }
            keyboardType="numeric"
          />
        </View>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <PrimaryButton
            title="Save as Draft"
            onPress={() => handleUpdateProduct(false)}
            variant="outline"
          />
          <PrimaryButton
            title={productId ? "Update Product" : "Publish Product"}
            onPress={() => handleUpdateProduct(true)}
            variant="primary"
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
    marginBottom: 15,
  },
  info: { fontSize: 24, color: "#FA8232", fontWeight: "500", marginBottom: 16 },
  price: {
    fontSize: 24,
    color: "#FA8232",
    fontWeight: "500",
    marginBottom: 16,
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
    marginBottom: 15,
  },
  inputLabel: { marginBottom: 5, fontSize: 15, fontWeight: "600" },
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
    marginTop: 20,
  },
});
