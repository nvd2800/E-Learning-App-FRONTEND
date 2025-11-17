// app/(tabs)/Profile.tsx
// ✅ Cập nhật để lấy số liệu ONGOING / COMPLETED từ MyCoursesContext (thay vì hard-code)

import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { memo, useMemo, useState } from "react";
import {
  Image,
  ImageErrorEventData,
  Modal,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../src/context/AuthContext";
import { useMyCourses } from "../../src/context/MyCoursesContext"; // 👈 thêm
import { useSavedCourses } from "../../src/context/SavedCoursesContext";

type Course = {
  id: string;
  title: string;
  teacher: string;
  price: string;
  rating: string;
  lessons: string;
  image: string;
};

const getAvatarFromName = (name?: string) => {
  const label = encodeURIComponent(name || "User");
  return `https://ui-avatars.com/api/?name=${label}&background=0ecfe0&color=ffffff&bold=true`;
};

/* ==== Khóa học đã lưu ==== */
const SavedItem = memo(({ item }: { item: Course }) => (
  <TouchableOpacity
    activeOpacity={0.9}
    style={styles.card}
    onPress={() => router.push(`/course/${item.id}`)}
  >
    <Image source={{ uri: item.image }} style={styles.thumb} />
    <View style={{ flex: 1, marginHorizontal: 12 }}>
      <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.cardTeacher}>{item.teacher}</Text>
      <Text style={styles.cardPrice}>{item.price}</Text>
      <View style={styles.metaRow}>
        <Ionicons name="star" size={12} color="#f59e0b" />
        <Text style={styles.metaText}>{item.rating}</Text>
        <Text style={styles.dot}> • </Text>
        <Text style={styles.metaText}>{item.lessons}</Text>
      </View>
    </View>
    <View style={styles.bookmark}>
      <MaterialIcons name="bookmark-border" size={18} color="#0ea5b7" />
    </View>
  </TouchableOpacity>
));

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const displayName = user?.name || "User";
  const fallbackAvatar = getAvatarFromName(displayName);
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatar || fallbackAvatar);
  const { saved, savedCount } = useSavedCourses();
  const [menuOpen, setMenuOpen] = useState(false);

  // 👇 lấy danh sách khóa học đã “mua” + progress từ context để tính ongoing/completed
  const { myCourses } = useMyCourses();
  const ongoingCount = useMemo(
    () => myCourses.filter(c => (c.progress ?? 0) > 0 && (c.progress ?? 0) < 100).length,
    [myCourses]
  );
  const completedCount = useMemo(
    () => myCourses.filter(c => (c.progress ?? 0) >= 100).length,
    [myCourses]
  );

  const onAvatarError = (_e: NativeSyntheticEvent<ImageErrorEventData>) => {
    if (avatarUrl !== fallbackAvatar) setAvatarUrl(fallbackAvatar);
  };

  // ✅ thay số liệu động cho 3 ô thống kê
  const stats = useMemo(
    () => [
      { key: "saved", value: String(savedCount), label: "Save", onPress: () => router.push("../Profile") },
      { key: "ongoing", value: String(ongoingCount), label: "On Going", onPress: () => router.push("/(tabs)/mycourses?tab=ongoing") },
      { key: "completed", value: String(completedCount), label: "Completed", onPress: () => router.push("/(tabs)/mycourses?tab=completed") },
    ],
    [savedCount, ongoingCount, completedCount]
  );

  const handleLogout = async () => {
    try {
      setMenuOpen(false);
      await signOut?.();
      router.replace("/(auth)/login");
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top"]}>
      {/* Header */}
      <View style={styles.topBar}>
        <View />
        <TouchableOpacity onPress={() => setMenuOpen(v => !v)} activeOpacity={0.8} style={styles.userChip}>
          <Image source={{ uri: avatarUrl }} onError={onAvatarError} style={styles.userChipAvatar} />
          <Text style={styles.userChipName} numberOfLines={1}>{displayName}</Text>
          <Ionicons name={menuOpen ? "chevron-up" : "chevron-down"} size={16} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* Dropdown */}
      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <TouchableOpacity activeOpacity={1} onPress={() => setMenuOpen(false)} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.08)" }}>
          <View style={[styles.dropdownModalCard, { top: insets.top + 44, right: 12 }]}>
            <TouchableOpacity style={styles.dropdownItem} onPress={() => { setMenuOpen(false); router.push("../Profile/info"); }}>
              <Text style={styles.dropdownText}>Thông tin cá nhân</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dropdownItem} onPress={() => { setMenuOpen(false); router.push("../Profile/change-password"); }}>
              <Text style={styles.dropdownText}>Đổi mật khẩu</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dropdownItem} onPress={handleLogout}>
              <Text style={[styles.dropdownText, { color: "#dc2626" }]}>Đăng xuất</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Content */}
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.bannerOuter}>
          <View style={styles.bannerInner}>
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop" }}
              style={styles.bannerImg}
            />
          </View>
          <Image source={{ uri: avatarUrl }} onError={onAvatarError} style={styles.avatar} />
        </View>

        <View style={{ alignItems: "center", marginTop: 42 }}>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.role}>UX/UI Designer</Text>
        </View>

        {/* Stats (ấn vào để điều hướng tới MyCourses với tab phù hợp) */}
        <View style={styles.statsRow}>
          {stats.map(s => (
            <TouchableOpacity key={s.key} style={styles.statBox} onPress={s.onPress} activeOpacity={0.7}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Saved courses */}
        <Text style={styles.sectionTitle}>Saved courses</Text>
        <View style={{ paddingHorizontal: 16, gap: 12 }}>
          {saved.map((c) => <SavedItem key={c.id} item={c} />)}
          {saved.length === 0 && <Text style={{ color: "#6b7280" }}>Bạn chưa lưu khóa học nào.</Text>}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ==== Styles ==== */
const styles = StyleSheet.create({
  topBar: {
    height: 44,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ecfeff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  userChipAvatar: { width: 24, height: 24, borderRadius: 12 },
  userChipName: { maxWidth: 160, fontWeight: "700", color: "#0ea5b7" },

  dropdownModalCard: {
    position: "absolute",
    width: 220,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 6 },
    }),
    overflow: "hidden",
  },
  dropdownItem: { paddingHorizontal: 14, paddingVertical: 12, backgroundColor: "#fff" },
  dropdownText: { color: "#111827", fontWeight: "600" },

  bannerOuter: { marginTop: 8, marginHorizontal: 16, position: "relative", overflow: "visible", height: 120 },
  bannerInner: { borderRadius: 14, overflow: "hidden", height: "100%", backgroundColor: "#f3f4f6" },
  bannerImg: { width: "100%", height: "100%" },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#fff",
    position: "absolute",
    left: "50%",
    transform: [{ translateX: -40 }],
    bottom: -40,
    backgroundColor: "#ecfeff",
  },

  name: { fontSize: 18, fontWeight: "800", color: "#111827" },
  role: { color: "#6b7280", marginTop: 4 },

  statsRow: { flexDirection: "row", justifyContent: "space-around", marginTop: 16, paddingHorizontal: 16 },
  statBox: { alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "800", color: "#111827" },
  statLabel: { color: "#6b7280", marginTop: 2 },

  sectionTitle: { marginTop: 20, marginBottom: 10, paddingHorizontal: 16, fontSize: 16, fontWeight: "700", color: "#111827" },

  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 1 },
    }),
  },
  thumb: { width: 64, height: 64, borderRadius: 10, backgroundColor: "#f3f4f6" },
  cardTitle: { fontWeight: "700", color: "#111827" },
  cardTeacher: { color: "#6b7280", fontSize: 12, marginTop: 2 },
  cardPrice: { color: "#06b6d4", fontWeight: "700", marginTop: 6 },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  metaText: { fontSize: 11, color: "#6b7280", marginLeft: 4 },
  dot: { color: "#9ca3af", marginHorizontal: 6 },
  bookmark: { marginLeft: 8, padding: 6, borderRadius: 999, backgroundColor: "#e0f7fb" },
});
