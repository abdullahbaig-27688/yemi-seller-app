import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import Heading from "@/components/heading";
import Input from "@/components/input"; // ✅ import reusable component
import PrimaryButton from "@/components/primaryButton";
import ImagePickerBox from "@/components/imagePickerBox";
import Textarea from "@/components/textarea";
import { router } from "expo-router";

const addProduct = () => {
  const [productName, setProductName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [catagory, setCatagory] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [quantity, setQuantity] = React.useState("");
  return (
    <View style={styles.container}>
      <Heading
        title="Add Product"
        leftIcon="close"
        onLeftPress={() => router.back()}
      />
      <Input
        label="Product Name"
        placeholder="Enter product name"
        value={productName}
        onChangeText={setProductName}
      />
      <Textarea
        label="Description"
        placeholder="Enter product description"
        value={description}
        onChangeText={setDescription}
      />
      <Input
        label="Catagory"
        placeholder="Enter product catagory"
        value={catagory}
        onChangeText={setCatagory}
      />
      <Input
        label="Price"
        placeholder="Enter product price"
        value={price}
        onChangeText={setPrice}
      />
      <Input
        label="Quantity"
        placeholder="Enter product quantity"
        value={quantity}
        onChangeText={setQuantity}
      />
      <ImagePickerBox
        label="Product Images"
        onImagesChange={(imgs) => console.log("Selected images:", imgs)}
      />
      <PrimaryButton
        title="Add Product"
        onPress={() => console.log("Product Added")}
      />
    </View>
  );
};

export default addProduct;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    // Top:20,
    paddingTop: 50,
    // justifyContent: "center",
    
  },
});
