import ProductsHeader from "@/components/Header";
import { useAuth } from "@/src/context/AuthContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";



// Temporary category lookup map
const CATEGORY_MAP: Record<string, string> = {
    "1": "Electronics",
    "2": "Clothing",
    "3": "Books",
    // add other category ids and names here
};

interface Product {
    id: number;
    name: string;
    code: string;
    product_type: string;
    unit_price: number;
    tax: number;
    tax_type: string | null;
    discount: number;
    current_stock: number;
    details: string;
    images_full_url: { path: string; status: number }[];
    thumbnail_full_url: { path: string; status: number };
    status: number;
    published: number;
    category_ids: string | null;
}

const ProductDetails = () => {
    const { token } = useAuth();
    const router = useRouter();
    const params = useLocalSearchParams();
    const productId = params.productId;

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch product from API
    const fetchProductDetail = async () => {
        if (!productId || !token) {
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(
                `https://yemi.store/api/v2/seller/products/edit/${productId}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            );

            if (!res.ok) {
                const errData = await res.json();
                console.error("❌ Failed to fetch product:", errData);
                Alert.alert("Error", "Failed to fetch product details");
                setLoading(false);
                return;
            }

            const data = await res.json();
            const productData = Array.isArray(data) ? data[0] : data;
            setProduct(productData);
        } catch (error) {
            console.error("❌ Error fetching product:", error);
            Alert.alert("Error", "Failed to fetch product details");
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchProductDetail();
    }, [productId, token]);


    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FA8232" />
                <Text>Loading product details...</Text>
            </View>
        );
    }

    if (!product) {
        return (
            <View style={styles.loadingContainer}>
                <Text>No product found</Text>
            </View>
        );
    }

    // Parse categories
    let categories: string[] = [];
    if (product.category_ids) {
        try {
            const parsed = JSON.parse(product.category_ids);
            categories = parsed.map((c: any) => CATEGORY_MAP[c.id] || `ID ${c.id}`);
        } catch {
            categories = [];
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <ProductsHeader
                title="Product Details"
                leftIcon="arrow-back"
                onLeftPress={() => router.replace("/myProducts")}
            />

            <ScrollView style={styles.scrollContainer}>
                {/* Banner */}
                {product.thumbnail_full_url?.status === 200 && (
                    <Image
                        source={{ uri: product.thumbnail_full_url.path }}
                        style={styles.bannerImage}
                        resizeMode="cover"
                    />
                )}

                {/* Product Gallery */}
                {product.images_full_url?.length > 0 && (
                    <FlatList
                        horizontal
                        data={product.images_full_url}
                        keyExtractor={(item) => item.path}
                        renderItem={({ item }) => (
                            <Image
                                source={{ uri: item.path }}
                                style={styles.galleryImage}
                                resizeMode="contain"
                            />
                        )}
                        showsHorizontalScrollIndicator={false}
                        style={{ marginVertical: 10 }}
                    />
                )}

                {/* General Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>General Information</Text>
                    <Text style={styles.label}>Category:</Text>
                    <Text style={styles.value}>
                        {categories.length > 0 ? categories.join(", ") : "Category not found"}
                    </Text>
                    <Text style={styles.label}>Product Type:</Text>
                    <Text style={styles.value}>{product.product_type}</Text>
                    <Text style={styles.label}>Product SKU:</Text>
                    <Text style={styles.value}>{product.code}</Text>
                </View>

                {/* Price Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Price Information</Text>
                    <Text style={styles.label}>Unit Price:</Text>
                    <Text style={styles.value}>€{product.unit_price.toFixed(2)}</Text>
                    <Text style={styles.label}>Tax:</Text>
                    <Text style={styles.value}>
                        €{product.tax.toFixed(2)} ({product.tax_type || "exclude"})
                    </Text>
                    <Text style={styles.label}>Discount:</Text>
                    <Text style={styles.value}>€{product.discount.toFixed(2)}</Text>
                </View>

                {/* Stock & Description */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Stock & Description</Text>
                    <Text style={styles.label}>Stock Status:</Text>
                    <Text style={styles.value}>
                        {product.current_stock > 0 ? `In Stock: ${product.current_stock}` : "Out of Stock"}
                    </Text>
                    <Text style={styles.label}>Description:</Text>
                    <Text style={styles.value}>{product.details}</Text>
                </View>

                {/* Status */}
                <View style={styles.section}>
                    <Text style={styles.label}>Status:</Text>
                    <Text style={styles.value}>
                        {product.status === 1 && product.published === 1
                            ? "Active"
                            : "Draft / Inactive"}
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default ProductDetails;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    scrollContainer: { flex: 1, padding: 15 },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    bannerImage: { width: "100%", height: 250, borderRadius: 10, backgroundColor: "#f1f1f1" },
    galleryImage: { width: 120, height: 120, borderRadius: 10, marginRight: 10, backgroundColor: "#f9f9f9" },
    section: { marginVertical: 10, paddingVertical: 10, borderBottomWidth: 0.5, borderColor: "#ccc" },
    sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
    label: { fontSize: 14, fontWeight: "600", color: "#555", marginTop: 5 },
    value: { fontSize: 14, color: "#333", marginBottom: 5 },
});
