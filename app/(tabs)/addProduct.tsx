import Heading from "@/components/heading";
import ImagePickerBox from "@/components/imagePickerBox";
import Input from "@/components/input";
import PrimaryButton from "@/components/primaryButton";
import { useProducts } from "@/src/context/ProductContext";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert,View, ScrollView, StyleSheet } from "react-native";


const AddProduct = () => {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [productType, setProductType] = useState("digital");
  const [digitalProductType, setDigitalProductType] = useState("ready_product");
  const [digitalFileReady, setDigitalFileReady] = useState("");
  const [images, setImages] = useState([]);
  const [thumbnail, setThumbnail] = useState("");
  const [discountType, setDiscountType] = useState("percent");
  const [tax, setTax] = useState("");
  const [lang, setLang] = useState("en");
  const [unitPrice, setUnitPrice] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [code, setCode] = useState("");
  const [minOrderQty, setMinOrderQty] = useState("1");
   const { addProduct } = useProducts();

  // const handleAddProduct = async () => {
  //   try {
  //     // const token = "YOUR_SELLER_TOKEN"; // ⚠️ Replace this with your actual token
  //     const token = await AsyncStorage.getItem("seller_token");

  //     const formData = new FormData();
  //     formData.append("name", name);
  //     formData.append("category_id", categoryId);
  //     formData.append("product_type", productType);
  //     formData.append("digital_product_type", digitalProductType);
  //     formData.append("digital_file_ready", digitalFileReady);
  //     formData.append("images", images.join(","));
  //     formData.append("thumbnail", thumbnail);
  //     formData.append("discount_type", discountType);
  //     formData.append("tax", tax);
  //     formData.append("lang", lang);
  //     formData.append("unit_price", unitPrice);
  //     formData.append("purchase_price", purchasePrice);
  //     formData.append("discount", discount);
  //     formData.append("code", code);
  //     formData.append("minimum_order_qty", minOrderQty);

  //     const response = await axios.post(
  //       "https://yemi.store/api/v2/seller/products/add",
  //       formData,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           "Content-Type": "multipart/form-data",
  //         },
  //       }
  //     );

  //     Alert.alert("Success", "Product added successfully!");
  //     router.push("/inventory");
  //   } catch (error) {
  //     console.error("Error adding product:", error.response?.data || error);
  //     Alert.alert(
  //       "Error",
  //       "Failed to add product. Please check your token or inputs."
  //     );
  //   }
  // };


    const handleAddProduct = () => {
    const newProduct = {
      name,
      category_id: categoryId,
      product_type: productType,
      digital_product_type: digitalProductType,
      digital_file_ready: digitalFileReady,
      images,
      thumbnail,
      discount_type: discountType,
      tax,
      lang,
      unit_price: unitPrice,
      purchase_price: purchasePrice,
      discount,
      code,
      minimum_order_qty: minOrderQty,
      created_at: new Date().toISOString(),
    };

    addProduct(newProduct);
    Alert.alert("Success", "Product added locally for demo!");
    router.push("/inventory");
  };
  return (
    <View style={styles.container}>
 <ScrollView showsVerticalScrollIndicator={false} >
      <Heading
        title="Add Product"
        leftIcon="close"
        onLeftPress={() => router.back()}
      />

      <Input label="Product Name" value={name} onChangeText={setName} />
      <Input
        label="Category ID"
        value={categoryId}
        onChangeText={setCategoryId}
      />
      <Input
        label="Product Type"
        value={productType}
        onChangeText={setProductType}
      />
      <Input
        label="Digital Product Type"
        value={digitalProductType}
        onChangeText={setDigitalProductType}
      />
      <Input
        label="Digital File Ready"
        value={digitalFileReady}
        onChangeText={setDigitalFileReady}
      />
      <ImagePickerBox label="Images" onImagesChange={setImages} />
      <Input label="Thumbnail" value={thumbnail} onChangeText={setThumbnail} />
      <Input
        label="Discount Type"
        value={discountType}
        onChangeText={setDiscountType}
      />
      <Input label="Tax (%)" value={tax} onChangeText={setTax} />
      <Input label="Language" value={lang} onChangeText={setLang} />
      <Input label="Unit Price" value={unitPrice} onChangeText={setUnitPrice} />
      <Input
        label="Purchase Price"
        value={purchasePrice}
        onChangeText={setPurchasePrice}
      />
      <Input label="Discount" value={discount} onChangeText={setDiscount} />
      <Input label="Code" value={code} onChangeText={setCode} />
      <Input
        label="Minimum Order Qty"
        value={minOrderQty}
        onChangeText={setMinOrderQty}
      />

      <PrimaryButton title="Add Product" onPress={handleAddProduct} />
    </ScrollView>
    </View>
   
  );
};

export default AddProduct;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    paddingTop: 50,
  },
});
