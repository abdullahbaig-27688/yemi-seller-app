import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

// 🧩 Context Providers
import { AuthProvider } from "@/src/context/AuthContext";
import { ProductProvider } from "@/src/context/ProductContext";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    // 🔐 AuthProvider MUST be outermost
    <AuthProvider>
      <ProductProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack
            screenOptions={{
              headerShown: false,
              gestureEnabled: false,
            }}
          >
            {/* Public / Auth Screens */}
            <Stack.Screen name="getStarted" />
            <Stack.Screen name="index" />
            <Stack.Screen name="registerScreen" />
            <Stack.Screen name="loginScreen" />
            <Stack.Screen name="forgotPassword" />

            {/* App Screens */}
            <Stack.Screen name="(tabs)" />
            {/* <Stack.Screen name="addProduct" /> */}
          </Stack>

          <StatusBar style="auto" />
        </ThemeProvider>
      </ProductProvider>
    </AuthProvider>
  );
}