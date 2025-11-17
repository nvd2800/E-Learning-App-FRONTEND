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
import { authApi } from "../../src/services/auth.api"; // 👈 dùng authApi, không gọi api trực tiếp

export default function RegisterScreen() {
  const { user, loading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  // Nếu đã login rồi thì không cho ở màn register nữa
  useEffect(() => {
    if (!loading && user) {
      router.replace("/(tabs)");
    }
  }, [loading, user, router]);

  const onRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      return Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
    }
    if (password.length < 6) {
      return Alert.alert("Lỗi", "Mật khẩu phải từ 6 ký tự trở lên");
    }
    if (password !== confirm) {
      return Alert.alert("Lỗi", "Mật khẩu nhập lại không khớp");
    }

    try {
      setSubmitting(true);

      // ✅ Gọi đúng API backend: POST /api/auth/register
      const res = await authApi.register(
        name.trim(),
        email.trim(),
        password
      );

      // axios đã throw nếu status >= 400 nên check nhẹ nhàng là đủ
      Alert.alert(
        "Thành công",
        "Tạo tài khoản thành công. Vui lòng đăng nhập!",
        [{ text: "OK", onPress: () => router.replace("/(auth)/login") }]
      );
    } catch (e: any) {
      console.log("Register error:", e?.response?.data || e?.message);
      const msg =
        e?.response?.data?.message ||
        (e?.response?.status === 409
          ? "Email đã được sử dụng"
          : "Không thể đăng ký, vui lòng thử lại");
      Alert.alert("Lỗi", msg);
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
          Tạo tài khoản
        </Text>

        <TextInput
          placeholder="Họ tên"
          value={name}
          onChangeText={setName}
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
          placeholder="Mật khẩu (>=6 ký tự)"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
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
          placeholder="Nhập lại mật khẩu"
          secureTextEntry
          value={confirm}
          onChangeText={setConfirm}
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
          onPress={onRegister}
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
            <Text style={{ color: "#fff", fontWeight: "700" }}>Đăng ký</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace("/(auth)/login")}
          style={{ marginTop: 16, alignItems: "center" }}
        >
          <Text style={{ color: "#0ea5e9", fontWeight: "600" }}>
            Đã có tài khoản? Đăng nhập
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
