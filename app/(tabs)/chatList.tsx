import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import InboxHeader from "@/components/Header";
import { router } from "expo-router";
const chatList = () => {
  return (
    <SafeAreaView>
      <InboxHeader
        title="Chat"
        leftIcon="arrow-back"
        onLeftPress={() => router.back()}
      />
    </SafeAreaView>
  );
};

export default chatList;
