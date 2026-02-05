import { useAuth } from "@/src/context/AuthContext";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ChatScreen: React.FC = () => {
  const { token } = useAuth();
  const params = useLocalSearchParams();
  const customerId = params.customerId as string;
  const customerName = params.customerName as string;

  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      if (!token) return;

      const response = await axios.get(
        `https://yemi.store/api/v2/seller/messages/list/customer`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Filter messages for this customer
      const customerMessages = response.data.chat.filter(
        (msg: any) => msg.customer.id.toString() === customerId
      );

      setMessages(customerMessages);

      // Scroll to bottom after messages load
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !token) return;

    try {
      console.log("TOKEN:", token);
      const messageText = encodeURIComponent(newMessage);

      await axios.post(
        `https://yemi.store/api/v2/seller/messages/send/customer?id=${customerId}&message=${messageText}`,
        {}, // empty body
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const newMsg = {
        id: Date.now(),
        message: newMessage,
        sent_by_seller: true,
        sent_by_customer: false,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, newMsg]);
      setNewMessage("");

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  if (loading)
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>{customerName}</Text>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageContainer,
                item.sent_by_seller ? styles.sent : styles.received,
              ]}
            >
              <Text style={styles.messageText}>{item.message}</Text>
              <Text style={styles.timeText}>
                {new Date(item.created_at).toLocaleTimeString()}
              </Text>
            </View>
          )}
          contentContainerStyle={{ padding: 10, paddingBottom: 10 }}
        />

        <View style={styles.inputContainer}>
          <TextInput
            value={newMessage}
            onChangeText={setNewMessage}
            style={styles.input}
            placeholder="Type a message..."
          />
          <Pressable style={styles.sendButton} onPress={sendMessage}>
            <Text style={{ color: "#fff" }}>Send</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  flex: { flex: 1 },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  messageContainer: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: "80%",
  },
  sent: { backgroundColor: "#DCF8C6", alignSelf: "flex-end" },
  received: { backgroundColor: "#ECECEC", alignSelf: "flex-start" },
  messageText: { fontSize: 16 },
  timeText: { fontSize: 10, color: "#666", marginTop: 2 },
  inputContainer: {
    flexDirection: "row",
    padding: 50,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 45,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 15,
    marginLeft: 10,
    borderRadius: 25,
  },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
});
