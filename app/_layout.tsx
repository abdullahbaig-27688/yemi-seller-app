import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

// 🧩 Import the ProductProvider
import { ProductProvider } from "@/src/context/ProductContext";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    // ✅ Wrap your whole app inside ProductProvider
    <ProductProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" /> {/* Splash entry */}
          <Stack.Screen name="getStarted" />
          <Stack.Screen
            name="registerScreen"
            options={{
              gestureEnabled: false, // 👈 disables swipe-back gesture
            }}
          />
          <Stack.Screen
            name="loginScreen"
            options={{
              gestureEnabled: false, // 👈 disables swipe-back gesture
            }}
          />
          {/* Add your other screens here (e.g., addProduct, inventory, etc.) */}
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </ProductProvider>
  );
}
