import WithdrawHeader from "@/components/Header";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Withdraw = () => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("Active");

    const tabs = ["All Requests", "Active", "Pending Approval", "Denied"];

    // Dummy data for each tab
    const data = {
        Active: [
            { id: "1", amount: 50, date: "2026-01-20" },
            { id: "2", amount: 30, date: "2026-01-18" },
        ],
        "Pending Approval": [
            { id: "3", amount: 100, date: "2026-01-19" },
        ],
        Denied: [
            { id: "4", amount: 20, date: "2026-01-15" },
        ],
    };

    const renderItem = ({ item }: { item: { id: string; amount: number; date: string } }) => (
        <View style={styles.card}>
            <Text style={styles.amount}>${item.amount}</Text>
            <Text style={styles.date}>{item.date}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <WithdrawHeader title="Withdrawals" leftIcon="arrow-back" onLeftPress={() => router.back()} />
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
                        <Text style={activeTab === tab ? styles.activeTabText : styles.tabText}>
                            {tab}
                        </Text>
                    </Pressable>
                ))}
            </View>

            {/* Tab Content */}
            <FlatList
                data={data[activeTab]}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No {activeTab} withdrawals</Text>
                }
                contentContainerStyle={{ padding: 20 }}
            />
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
});
