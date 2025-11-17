// app/profile/info.tsx
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/context/AuthContext";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://192.168.1.128:4000";

// Helper avatar (fallback)
const avatarOf = (name?: string) => {
  const label = encodeURIComponent(name || "User");
  return `https://ui-avatars.com/api/?name=${label}&background=0ecfe0&color=ffffff&bold=true`;
};

export default function ProfileInfoScreen() {
  const { user, token, setUser } = useAuth() as any; // setUser: nếu context có
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [avatar, setAvatar] = useState(user?.avatar ?? avatarOf(user?.name));

  // Lấy lại thông tin từ BE (nếu cần)
  useEffect(() => {
    let stop = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Fetch me failed");
        const me = await res.json();
        if (!stop) {
          setName(me.name ?? "");
          setEmail(me.email ?? "");
          setAvatar(me.avatar ?? avatarOf(me.name));
        }
      } catch (e) {
        // Không chặn UI nếu lỗi – dùng dữ liệu có sẵn từ context
      } finally {
        !stop && setLoading(false);
      }
    })();
    return () => {
      stop = true;
    };
  }, [token]);

  const onSave = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/auth/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, avatar }),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Update profile failed");
      }
      const updated = await res.json();

      // Cập nhật lại context nếu có setUser
      if (setUser) setUser(updated);

      Alert.alert("Thành công", "Cập nhật thông tin thành công");
      router.back();
    } catch (e: any) {
      Alert.alert("Lỗi", e?.message || "Không thể cập nhật");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8, color: "#64748b" }}>Đang tải…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.title}>Thông tin cá nhân</Text>

        {/* Avatar preview */}
        <View style={{ alignItems: "center", marginTop: 12, marginBottom: 16 }}>
          <Image
            source={{ uri: avatar || avatarOf(name) }}
            style={{ width: 90, height: 90, borderRadius: 45, backgroundColor: "#ecfeff" }}
          />
        </View>

        <Text style={styles.label}>Tên hiển thị</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Nhập tên"
          style={styles.input}
        />

        <Text style={styles.label}>Email (không đổi)</Text>
        <TextInput value={email} editable={false} style={[styles.input, { backgroundColor: "#f3f4f6" }]} />

        <Text style={styles.label}>Ảnh đại diện (URL)</Text>
        <TextInput
          value={avatar}
          onChangeText={setAvatar}
          placeholder="https://..."
          autoCapitalize="none"
          style={styles.input}
        />

        <TouchableOpacity onPress={onSave} style={styles.btnPrimary} activeOpacity={0.9}>
          <Text style={styles.btnText}>Lưu thay đổi</Text>
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
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "800", color: "#111827" },
  label: { marginTop: 10, marginBottom: 6, color: "#6b7280", fontWeight: "600" },
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
    backgroundColor: "#06b6d4",
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
