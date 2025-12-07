import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useNavigation } from "expo-router";
import ChatHeader from "@/components/Header";

import axios from "axios";

interface Customer {
  id: number;
  name: string;
  image_full_url: { key: string; path: string | null; status: number };
}

interface Chat {
  id: number;
  message: string;
  updated_at: string;
  customer: Customer;
}

const InboxList: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const fetchChats = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("seller_token");
      const response = await axios.get(
        "https://yemi.store/api/v2/seller/messages/list/customer",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setChats(response.data.chat || []);
    } catch (error: any) {
      console.log(error.response?.data || error.message);
      Alert.alert("Error", "Failed to fetch chats. Please login again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const renderItem = ({ item }: { item: Chat }) => (
    <Pressable
      style={styles.chatItem}
      onPress={() =>
        navigation.navigate("chatList", {
          customerId: item.customer.id,
          customerName: item.customer.name,
        })
      }
    >
      <View style={styles.row}>
        <Image
          source={{
            uri: item.customer.image_full_url.key
              ? `https://yemi.store/storage/${item.customer.image_full_url.key}`
              : "https://via.placeholder.com/50",
          }}
          style={styles.avatar}
        />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.name}>{item.customer.name}</Text>
          <Text style={styles.message} numberOfLines={1}>
            {item.message}
          </Text>
        </View>
      </View>
      <Text style={styles.time}>
        {new Date(item.updated_at).toLocaleTimeString()}
      </Text>
    </Pressable>
  );

  if (loading)
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );

  return (
    <SafeAreaView style={styles.container}>
      <ChatHeader
        title="Chat"
        leftIcon="arrow-back"
        onLeftPress={() => router.back()}
      />
      {chats.length === 0 ? (
        <View style={styles.empty}>
          <Text>No chats available</Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />
      )}
    </SafeAreaView>
  );
};

export default InboxList;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  chatItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  row: { flexDirection: "row", alignItems: "center", flex: 1 },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  name: { fontSize: 16, fontWeight: "bold" },
  message: { fontSize: 14, color: "#666" },
  time: { fontSize: 12, color: "#999" },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
});
