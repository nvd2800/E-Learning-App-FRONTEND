import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/context/AuthContext";

export default function LoginScreen() {
  const { user, loading, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  // Nếu đã có user (đăng nhập từ lần trước) thì nhảy thẳng sang tabs
  useEffect(() => {
    if (!loading && user) {
      router.replace("/(tabs)");
    }
  }, [loading, user, router]);

  const onLogin = async () => {
  if (!email.trim() || !password) {
    return Alert.alert("Lỗi", "Vui lòng nhập email và mật khẩu");
  }

  try {
    setSubmitting(true);

    // signIn return true nếu login OK
    const ok = await signIn(email, password);

    if (ok) {
      router.replace("/(tabs)");   // 👉 chuyển sang tab chính
    } else {
      Alert.alert("Đăng nhập thất bại", "Email hoặc mật khẩu không đúng");
    }
  } catch (e: any) {
    console.log("Login error:", e?.response?.data ?? e);
    Alert.alert("Đăng nhập thất bại", "Vui lòng thử lại sau");
  } finally {
    setSubmitting(false);
  }
};


  if (loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, padding: 20, backgroundColor: "#f6f7fb" }}
    >
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Text style={{ fontSize: 28, fontWeight: "800", marginBottom: 20 }}>
          Đăng nhập
        </Text>

        <TextInput
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={{
            borderWidth: 1,
            borderColor: "#e5e7eb",
            borderRadius: 12,
            padding: 12,
            marginBottom: 12,
            backgroundColor: "#fff",
          }}
        />

        <TextInput
          placeholder="Mật khẩu"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={{
            borderWidth: 1,
            borderColor: "#e5e7eb",
            borderRadius: 12,
            padding: 12,
            marginBottom: 16,
            backgroundColor: "#fff",
          }}
        />

        <TouchableOpacity
          onPress={onLogin}
          disabled={submitting}
          style={{
            backgroundColor: "#111827",
            padding: 14,
            borderRadius: 12,
            alignItems: "center",
            opacity: submitting ? 0.8 : 1,
          }}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontWeight: "700" }}>Đăng nhập</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(auth)/register")}
          style={{ marginTop: 16, alignItems: "center" }}
        >
          <Text style={{ color: "#0ea5e9", fontWeight: "600" }}>
            Tạo tài khoản mới
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
