import WithdrawHeader from "@/components/Header";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Withdraw = () => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("All Requests");
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(false);

    const tabs = ["All Requests", "Active", "Pending Approval", "Denied"];

    const STATUS_MAP = {
        "All Requests": "all",
        "Active": "approved",
        "Pending Approval": "pending",
        "Denied": "denied",
    };

    const fetchWithdrawals = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("seller_token");

            const status = STATUS_MAP[activeTab];

            const response = await fetch(
                `https://yemi.store/api/v2/seller/withdraw-list?status=${status}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            );

            const text = await response.text();
            const json = JSON.parse(text);

            if (json.success && json.data) {
                setWithdrawals(json.data);
            } else {
                setWithdrawals([]);
            }
        } catch (error) {
            console.error("Withdraw fetch error:", error);
            setWithdrawals([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWithdrawals();
    }, [activeTab]);

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.row}>
                <Text style={styles.amount}>${item.amount}</Text>
                <Text
                    style={[
                        styles.status,
                        item.status === "pending" && styles.pending,
                        item.status === "approved" && styles.approved,
                        item.status === "denied" && styles.denied,
                    ]}
                >
                    {item.status}
                </Text>
            </View>

            <Text style={styles.date}>
                {new Date(item.created_at).toDateString()}
            </Text>

            {item.transaction_note ? (
                <Text style={styles.note}>{item.transaction_note}</Text>
            ) : null}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <WithdrawHeader
                title="Withdrawals"
                leftIcon="arrow-back"
                onLeftPress={() => router.back()}
            />

            {/* Tabs */}
            <View style={styles.tabContainer}>
                {tabs.map((tab) => (
                    <Pressable
                        key={tab}
                        onPress={() => setActiveTab(tab)}
                        style={[
                            styles.tab,
                            activeTab === tab && styles.activeTab,
                        ]}
                    >
                        <Text
                            style={activeTab === tab ? styles.activeTabText : styles.tabText}
                        >
                            {tab}
                        </Text>
                    </Pressable>
                ))}
            </View>

            {/* Content */}
            {loading ? (
                <ActivityIndicator size="large" color="#FA8232" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={withdrawals}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderItem}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>
                            No {activeTab} withdrawals
                        </Text>
                    }
                    contentContainerStyle={{ padding: 20 }}
                />
            )}
        </SafeAreaView>
    );
};

export default Withdraw;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    tabContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 20,
        marginBottom: 10,
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: "#F0F0F0",
    },
    activeTab: {
        backgroundColor: "#FA8232",
    },
    tabText: {
        color: "#333",
        fontWeight: "600",
    },
    activeTabText: {
        color: "#fff",
        fontWeight: "700",
    },
    card: {
        backgroundColor: "#F6F5F6",
        padding: 15,
        borderRadius: 10,
        marginBottom: 12,
    },
    amount: {
        fontSize: 18,
        fontWeight: "700",
        color: "#FA8232",
    },
    date: {
        fontSize: 14,
        color: "#555",
        marginTop: 4,
    },
    emptyText: {
        textAlign: "center",
        marginTop: 50,
        fontSize: 16,
        color: "#888",
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    status: {
        fontSize: 12,
        fontWeight: "700",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        textTransform: "capitalize",
    },
    pending: { backgroundColor: "#FFE5B4", color: "#B26A00" },
    approved: { backgroundColor: "#D4F5E2", color: "#0A7A4A" },
    denied: { backgroundColor: "#FFD6D6", color: "#A10000" },
    note: {
        marginTop: 6,
        fontSize: 13,
        color: "#666",
    },

});
