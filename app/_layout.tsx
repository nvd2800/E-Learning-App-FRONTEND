// app/_layout.tsx
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../src/context/AuthContext";
import { MyCoursesProvider } from "../src/context/MyCoursesContext";
import { SavedCoursesProvider } from "../src/context/SavedCoursesContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <MyCoursesProvider>
          <SavedCoursesProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </SavedCoursesProvider>
        </MyCoursesProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
