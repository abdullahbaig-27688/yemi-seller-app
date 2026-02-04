import ProductsHeader from "@/components/Header";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/* ---------------- ANIMATED PRODUCT CARD ---------------- */
const AnimatedProductCard = ({ item, index, onPress, onEdit, onDelete }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const getStatusConfig = () => {
    if (item.published === 0 || item.status === 0) {
      return { label: "Draft", color: "#95a5a6", icon: "document-text-outline" };
    }
    if (item.current_stock === 0) {
      return { label: "Out of Stock", color: "#e74c3c", icon: "alert-circle-outline" };
    }
    if (item.current_stock < item.min_qty) {
      return { label: "Low Stock", color: "#f39c12", icon: "warning-outline" };
    }
    return { label: "Active", color: "#27ae60", icon: "checkmark-circle-outline" };
  };

  const statusConfig = getStatusConfig();

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <LinearGradient
          colors={["#FFFFFF", "#F8F9FA"]}
          style={styles.card}
        >
          <View style={styles.cardContent}>
            <Image
              source={item.imageSource}
              style={styles.productImage}
              defaultSource={require("@/assets/images/icon.png")}
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={2}>
                {item.name}
              </Text>
              <View style={styles.skuContainer}>
                <Ionicons name="barcode-outline" size={14} color="#666" />
                <Text style={styles.productSKU}>SKU: {item.code}</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.productPrice}>${item.unit_price}</Text>
                <View style={styles.stockBadge}>
                  <Ionicons name="cube-outline" size={12} color="#666" />
                  <Text style={styles.productStock}>{item.current_stock}</Text>
                </View>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusConfig.color }]}>
                <Ionicons name={statusConfig.icon} size={12} color="#FFF" />
                <Text style={styles.statusText}>{statusConfig.label}</Text>
              </View>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              style={styles.editButton}
            >
              <LinearGradient
                colors={["#3498db", "#2980b9"]}
                style={styles.actionButtonGradient}
              >
                <Ionicons name="pencil" size={18} color="#fff" />
              </LinearGradient>
            </Pressable>

            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              style={styles.deleteButton}
            >
              <LinearGradient
                colors={["#e74c3c", "#c0392b"]}
                style={styles.actionButtonGradient}
              >
                <Ionicons name="trash" size={18} color="#fff" />
              </LinearGradient>
            </Pressable>
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

const MyProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();

  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const searchSlideAnim = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(searchSlideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const refreshParam = params.refresh;
  const resetFiltersParam = params.resetFilters;
  const updatedProductParam =
    (params as any).updatedProduct ??
    (params as URLSearchParams).get?.("updatedProduct");

  const fetchProducts = async (
    isRefreshing = false,
    updatedProductParam: any = null
  ) => {
    if (!isRefreshing) setLoading(true);
    try {
      const token = await AsyncStorage.getItem("seller_token");
      if (!token) {
        setLoading(false);
        return;
      }

      const params = new URLSearchParams();

      if (searchQuery && searchQuery.trim()) {
        params.append("search", searchQuery.trim());
      }

      if (filter && filter !== "All") {
        if (filter === "Active") {
          params.append("status", "1");
          params.append("published", "1");
        }
        if (filter === "Draft") {
          params.append("published", "0");
        }
        if (filter === "Out of Stock") {
          params.append("stock", "0");
        }
      }

      const queryString = params.toString();
      const url = queryString
        ? `https://yemi.store/api/v2/seller/products/list?${queryString}`
        : `https://yemi.store/api/v2/seller/products/list`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        try {
          const errData = await res.json();
          if (res.status === 500 && errData.message?.includes("could not be converted to string")) {
            Alert.alert(
              "Database Error",
              "Some products have corrupted data. Please contact support.",
              [{ text: "OK" }]
            );
          } else {
            Alert.alert("Error", "Failed to fetch products");
          }
        } catch (e) {
          Alert.alert("Error", "Failed to fetch products");
        }
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const data = await res.json();

      let productsArray: any[] = [];
      if (Array.isArray(data)) productsArray = data;
      else if (Array.isArray(data.products)) productsArray = data.products;
      else if (Array.isArray(data.products?.data)) productsArray = data.products.data;

      // Process products to add image sources
      const processedProducts = productsArray.map(product => ({
        ...product,
        imageSource: getProductImage(product)
      }));

      setProducts(processedProducts);
    } catch (error: any) {
      console.log("❌ Error fetching products:", error.message);
      Alert.alert("Error", "Failed to fetch products. Please check your connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (resetFiltersParam === "true") {
        setFilter("All");
        setSearchQuery("");
      }
      fetchProducts(false, updatedProductParam);
      return () => { };
    }, [refreshParam, resetFiltersParam])
  );

  useEffect(() => {
    if (resetFiltersParam === "true") return;
    fetchProducts(false, updatedProductParam);
  }, [searchQuery, filter]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts(true, updatedProductParam);
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
              const res = await fetch(
                `https://yemi.store/api/v2/seller/products/delete/${productId}`,
                {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                  },
                }
              );

              if (!res.ok) {
                Alert.alert("Error", "Failed to delete product.");
                return;
              }

              setProducts((prev) =>
                prev.filter((item) => item.id !== productId)
              );
              Alert.alert("Success", "Product deleted successfully!");
            } catch (error: any) {
              Alert.alert("Error", "Failed to delete product.");
            }
          },
        },
      ]
    );
  };

  const getProductImage = (item: any) => {
    if (item.thumbnail_full_url?.status === 200 && item.thumbnail_full_url.path)
      return { uri: item.thumbnail_full_url.path };

    if (
      item.images_full_url?.[0]?.status === 200 &&
      item.images_full_url[0].path
    )
      return { uri: item.images_full_url[0].path };

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

    return require("@/assets/images/icon.png");
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={["#FA8232", "#FF6B35"]}
          style={styles.header}
        >
          <ProductsHeader
            title="My Products"
            leftIcon="arrow-back"
            onLeftPress={() => router.back()}
            rightIcon="add"
            onRightPress={() => router.push("/addProduct")}
          />
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FA8232" />
          <Text style={styles.loadingText}>Loading products...</Text>
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
          <ProductsHeader
            title="My Products"
            leftIcon="arrow-back"
            onLeftPress={() => router.back()}
            rightIcon="add"
            onRightPress={() => router.push("/addProduct")}
          />
        </LinearGradient>
      </Animated.View>

      <View style={styles.content}>
        {/* Search Bar */}
        <Animated.View
          style={[
            styles.searchContainer,
            { transform: [{ translateY: searchSlideAnim }] },
          ]}
        >
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </Pressable>
            )}
          </View>
        </Animated.View>

        {/* Filters */}
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
                {filter === type ? (
                  <LinearGradient
                    colors={["#FA8232", "#FF6B35"]}
                    style={styles.activeFilterGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.activeFilterText}>{type}</Text>
                  </LinearGradient>
                ) : (
                  <Text style={styles.filterText}>{type}</Text>
                )}
              </Pressable>
            ))}
          </View>
        )}

        {/* Products List or Empty State */}
        {products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <LinearGradient
              colors={["#FFF5F0", "#FFFFFF"]}
              style={styles.emptyCard}
            >
              <View style={styles.emptyIconContainer}>
                <Ionicons name="cube-outline" size={80} color="#FA8232" />
              </View>
              <Text style={styles.emptyText}>No products found</Text>
              <Text style={styles.emptySubText}>
                {filter !== "All" || searchQuery
                  ? "Try changing your filters or search"
                  : "Add your first product to get started"}
              </Text>
              {filter === "All" && !searchQuery && (
                <Pressable
                  style={styles.addButton}
                  onPress={() => router.push("/addProduct")}
                >
                  <LinearGradient
                    colors={["#FA8232", "#FF6B35"]}
                    style={styles.addButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Ionicons name="add-circle" size={24} color="#fff" />
                    <Text style={styles.addButtonText}>Add Your First Product</Text>
                  </LinearGradient>
                </Pressable>
              )}
            </LinearGradient>
          </View>
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#FA8232"]}
                tintColor="#FA8232"
              />
            }
            renderItem={({ item, index }) => (
              <AnimatedProductCard
                item={item}
                index={index}
                onPress={() =>
                  router.push({
                    pathname: "/productDetails",
                    params: { productId: item.id.toString() },
                  })
                }
                onEdit={() =>
                  router.push({
                    pathname: "/editProduct",
                    params: { productId: item.id.toString() },
                  })
                }
                onDelete={() => handleDeleteProduct(item.id)}
              />
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default MyProducts;

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
    padding: 20,
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

  /* Search Bar */
  searchContainer: {
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1A1A1A",
  },

  /* Filters */
  filters: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  filterButton: {
    borderRadius: 20,
    overflow: "hidden",
  },
  activeFilterButton: {},
  activeFilterGradient: {
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  filterText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 14,
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: "#FFF",
    borderRadius: 20,
  },
  activeFilterText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

  /* Product Card */
  listContent: {
    paddingBottom: 20,
  },
  cardWrapper: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  cardContent: {
    flexDirection: "row",
    marginBottom: 12,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: "#F0F0F0",
  },
  productInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  productName: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
    color: "#1A1A1A",
    letterSpacing: -0.3,
  },
  skuContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  productSKU: {
    fontSize: 13,
    color: "#666",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FA8232",
    letterSpacing: -0.5,
  },
  stockBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  productStock: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFF",
    letterSpacing: 0.3,
  },

  /* Action Buttons */
  actionButtons: {
    flexDirection: "row",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    paddingTop: 12,
  },
  editButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  deleteButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  actionButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
  },

  /* Empty State */
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyCard: {
    width: "100%",
    borderRadius: 24,
    padding: 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(250, 130, 50, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 22,
    color: "#1A1A1A",
    marginBottom: 12,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  emptySubText: {
    fontSize: 15,
    color: "#666",
    marginBottom: 32,
    textAlign: "center",
    lineHeight: 22,
  },
  addButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#FA8232",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  addButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 28,
    gap: 10,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.3,
  },
});