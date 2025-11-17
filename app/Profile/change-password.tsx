// app/profile/change-password.tsx
import { router } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/context/AuthContext";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://192.168.1.128:4000";

export default function ChangePasswordScreen() {
  const { token } = useAuth() as any;
  const [current, setCurrent] = useState("");
  const [nextPwd, setNextPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    if (!current || !nextPwd) return Alert.alert("Lỗi", "Vui lòng nhập đủ thông tin");
    if (nextPwd.length < 6) return Alert.alert("Lỗi", "Mật khẩu mới tối thiểu 6 ký tự");
    if (nextPwd !== confirm) return Alert.alert("Lỗi", "Xác nhận mật khẩu không khớp");

    try {
      setSubmitting(true);
      const res = await fetch(`${BASE_URL}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword: current, newPassword: nextPwd }),
      });
      if (!res.ok) {
        const msg = (await res.text()) || "Đổi mật khẩu thất bại";
        throw new Error(msg);
      }
      Alert.alert("Thành công", "Đổi mật khẩu thành công");
      router.back();
    } catch (e: any) {
      Alert.alert("Lỗi", e?.message || "Không thể đổi mật khẩu");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.title}>Đổi mật khẩu</Text>

        <Text style={styles.label}>Mật khẩu hiện tại</Text>
        <TextInput
          value={current}
          onChangeText={setCurrent}
          secureTextEntry
          placeholder="Nhập mật khẩu hiện tại"
          style={styles.input}
        />

        <Text style={styles.label}>Mật khẩu mới</Text>
        <TextInput
          value={nextPwd}
          onChangeText={setNextPwd}
          secureTextEntry
          placeholder="Ít nhất 6 ký tự"
          style={styles.input}
        />

        <Text style={styles.label}>Nhập lại mật khẩu mới</Text>
        <TextInput
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          placeholder="Nhập lại"
          style={styles.input}
        />

        <TouchableOpacity onPress={onSubmit} disabled={submitting} style={styles.btnPrimary}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Cập nhật</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.btnGhost, { marginTop: 10 }]}
          activeOpacity={0.8}
        >
          <Text style={[styles.btnText, { color: "#111827" }]}>Hủy</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: "800", color: "#111827" },
  label: { marginTop: 12, marginBottom: 6, color: "#6b7280", fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  btnPrimary: {
    marginTop: 18,
    backgroundColor: "#111827",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  btnGhost: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  btnText: { color: "#fff", fontWeight: "800" },
});
