import ProductsHeader from "@/components/Header";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MyProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch products every time screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log("📱 Screen focused - fetching products...");
      fetchProducts();
      return () => {
        console.log("📱 Screen unfocused");
      };
    }, [])
  );

  // const fetchProducts = async (isRefreshing = false) => {
  //   if (!isRefreshing) setLoading(true);
  //   try {
  //     const token = await AsyncStorage.getItem("seller_token");
  //     if (!token) {
  //       setLoading(false);
  //       return;
  //     }

  //     console.log("🔄 Fetching products from API...");
  //     const response = await axios.get(
  //       "https://yemi.store/api/v2/seller/products/list",
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           Accept: "application/json",
  //         },
  //       }
  //     );

  //     console.log("✅ Products fetched:", response.data);

  //     // Use the correct array
  //     const productsArray = Array.isArray(response.data)
  //       ? response.data
  //       : response.data.products || [];

  //     console.log("✅ Products fetched:", productsArray.length);
  //     setProducts(productsArray);
  //     // setProducts(Array.isArray(response.data) ? response.data : []);
  //   } catch (error) {
  //     console.log("❌ Error fetching products:", error);
  //     Alert.alert("Error", "Failed to fetch products");
  //   } finally {
  //     setLoading(false);
  //     setRefreshing(false);
  //   }
  // };

  const fetchProducts = async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    try {
      const token = await AsyncStorage.getItem("seller_token");
      if (!token) {
        setLoading(false);
        return;
      }

      console.log("🔄 Fetching products from API...");

      const response = await axios.get(
        "https://yemi.store/api/v2/seller/products/list",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      console.log("Full API response:", response.data);
      // Check where the products array is
      let productsArray: any[] = [];

      if (Array.isArray(response.data)) {
        productsArray = response.data;
      } else if (Array.isArray(response.data.products)) {
        productsArray = response.data.products;
      } else if (Array.isArray(response.data.products?.data)) {
        productsArray = response.data.products.data;
      } else {
        productsArray = [];
      }

      console.log("✅ Products extracted:", productsArray.length);

      setProducts(productsArray);
    } catch (error) {
      console.log("❌ Error fetching products:", error);
      Alert.alert("Error", "Failed to fetch products");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts(true);
  };

  const handleDeleteProduct = async (productId: number) => {
    const token = await AsyncStorage.getItem("seller_token");
    if (!token) return;

    Alert.alert(
      "Delete Product",
      "Are you sure you want to delete this product?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(
                `https://yemi.store/api/v2/seller/products/delete/${productId}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                  },
                }
              );
              // Remove from local state
              setProducts((prev) =>
                prev.filter((item) => item.id !== productId)
              );
              Alert.alert("Success", "Product deleted successfully!");
            } catch (error) {
              console.log("❌ Error deleting product:", error);
              Alert.alert("Error", "Failed to delete product.");
            }
          },
        },
      ]
    );
  };

  // Filter products
  const filteredProducts = products.filter((item) => {
    const matchesSearch = item.name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    if (filter === "All") return matchesSearch;
    if (filter === "Active")
      return matchesSearch && item.current_stock > 0 && item.status === 1;
    if (filter === "Draft")
      return matchesSearch && (item.status === 0 || item.published === 0);
    if (filter === "Out of Stock")
      return matchesSearch && item.current_stock === 0;
    return matchesSearch;
  });

  const renderStatusLabel = (item: any) => {
    if (item.status === 0 || item.published === 0)
      return (
        <Text
          style={[
            styles.statusLabel,
            { backgroundColor: "#ccc", color: "#555" },
          ]}
        >
          Draft
        </Text>
      );
    if (item.current_stock === 0)
      return (
        <Text
          style={[
            styles.statusLabel,
            { backgroundColor: "#eb3b5a", color: "#fff" },
          ]}
        >
          Out of Stock
        </Text>
      );
    if (item.current_stock < item.min_qty)
      return (
        <Text
          style={[
            styles.statusLabel,
            { backgroundColor: "#f7b731", color: "#fff" },
          ]}
        >
          Low Stock
        </Text>
      );
    return (
      <Text
        style={[
          styles.statusLabel,
          { backgroundColor: "#2dce89", color: "#fff" },
        ]}
      >
        Active
      </Text>
    );
  };

  const getProductImage = (item: any) => {
    // Try thumbnail_full_url first
    if (item.thumbnail_full_url?.status === 200 && item.thumbnail_full_url.path)
      return { uri: item.thumbnail_full_url.path };

    // Try images_full_url
    if (
      item.images_full_url?.[0]?.status === 200 &&
      item.images_full_url[0].path
    )
      return { uri: item.images_full_url[0].path };

    // Parse and try images JSON string
    let images: string[] = [];
    if (item.images) {
      try {
        images = Array.isArray(item.images)
          ? item.images
          : JSON.parse(item.images);
        images = images.filter((img) => img && img.trim() !== "");
      } catch {
        images = [];
      }
    }

    if (images.length > 0)
      return {
        uri: `https://yemi.store/storage/app/public/product/${images[0].trim()}`,
      };

    // Return undefined for no image (will show broken image icon)
    return undefined;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ProductsHeader
          title="My Products"
          leftIcon="arrow-back"
          onLeftPress={() => router.back()}
          rightIcon="add"
          onRightPress={() => router.push("/addProduct")}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FA8232" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ProductsHeader
        title="My Products"
        leftIcon="arrow-back"
        onLeftPress={() => router.back()}
        rightIcon="add"
        onRightPress={() => router.push("/addProduct")}
      />

      <View style={styles.content}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {products.length > 0 && (
          <View style={styles.filters}>
            {["All", "Active", "Draft", "Out of Stock"].map((type) => (
              <Pressable
                key={type}
                style={[
                  styles.filterButton,
                  filter === type && styles.activeFilterButton,
                ]}
                onPress={() => setFilter(type)}
              >
                <Text
                  style={[
                    styles.filterText,
                    filter === type && styles.activeFilterText,
                  ]}
                >
                  {type}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="add-circle-outline" size={80} color="#FA8232" />
            <Text style={styles.emptyText}>No products yet</Text>
            <Pressable
              style={styles.addButton}
              onPress={() => router.push("/addProduct")}
            >
              <Ionicons name="add" size={22} color="#fff" />
              <Text style={styles.addButtonText}>Add Your First Product</Text>
            </Pressable>
          </View>
        ) : filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No products found for this filter.
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) =>
              item.id?.toString() || Math.random().toString()
            }
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#FA8232"]}
                tintColor="#FA8232"
              />
            }
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Image
                  source={getProductImage(item)}
                  style={styles.productImage}
                  defaultSource={require("@/assets/images/icon.png")}
                />
                <View style={styles.cardContent}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={styles.productSKU}>SKU: {item.code}</Text>
                  <Text style={styles.productPrice}>${item.unit_price}</Text>
                  <Text style={styles.productStock}>
                    Stock: {item.current_stock} units
                  </Text>
                  {renderStatusLabel(item)}
                </View>
                <View style={styles.buttonContainer}>
                  <Pressable
                    onPress={() => {
                      console.log("🔧 Navigating to edit product:", item.id);
                      router.push({
                        pathname: "/editProduct",
                        params: { id: item.id.toString() },
                      });
                    }}
                    style={styles.editButton}
                  >
                    <Ionicons name="pencil" size={16} color="#fff" />
                  </Pressable>

                  <Pressable
                    onPress={() => handleDeleteProduct(item.id)}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash" size={16} color="#fff" />
                  </Pressable>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default MyProducts;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { flex: 1, padding: 20 },
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
  searchInput: {
    backgroundColor: "#f1f1f1",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    fontSize: 15,
  },
  filters: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
    flexWrap: "wrap",
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#f1f1f1",
    marginBottom: 8,
  },
  activeFilterButton: { backgroundColor: "#FA8232" },
  filterText: { color: "#555", fontWeight: "600", fontSize: 13 },
  activeFilterText: { color: "#fff" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#f1f1f1",
  },
  cardContent: { flex: 1 },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  productSKU: {
    fontSize: 12,
    color: "#888",
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: "700",
    marginVertical: 2,
    color: "#FA8232",
  },
  productStock: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  statusLabel: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    fontSize: 10,
    fontWeight: "600",
    alignSelf: "flex-start",
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
    marginTop: 10,
    marginBottom: 20,
    textAlign: "center",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FA8232",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
    fontSize: 15,
  },
  buttonContainer: {
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },
  editButton: {
    backgroundColor: "#2d98da",
    padding: 8,
    borderRadius: 8,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "#eb3b5a",
    padding: 8,
    borderRadius: 8,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
});
