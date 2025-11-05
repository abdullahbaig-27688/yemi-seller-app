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
        <Stack
          initialRouteName="getStarted" // ✅ Set initial route
          screenOptions={{ headerShown: false, gestureEnabled: false }}
        >
          <Stack.Screen name="getStarted" />
          <Stack.Screen name="index" />
          <Stack.Screen name="registerScreen" />
          <Stack.Screen name="loginScreen" />
          <Stack.Screen name="addProduct" />
          <Stack.Screen name="tab" />
          {/* Add your other screens here (e.g., addProduct, inventory, etc.) */}
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </ProductProvider>
  );
}
