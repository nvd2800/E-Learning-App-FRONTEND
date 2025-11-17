// app/(tabs)/Search.tsx
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 🔥 ĐỔI IP/PORT CHO ĐÚNG BACKEND CỦA BẠN
const API_BASE = "http://192.168.1.128:4000/api";

type Topic = { id: string; label: string };
type Category = { id: string; title: string; icon: keyof typeof Ionicons.glyphMap };

// Kiểu dữ liệu KHÓA HỌC theo backend Prisma
type Course = {
  id: string;
  title: string;
  description?: string | null;
  image?: string | null;
  price: number;
  createdAt?: string;
};

const HOT_TOPICS: Topic[] = [
  { id: "java", label: "Java" },
  { id: "sql", label: "SQL" },
  { id: "rn", label: "React Native" },
  { id: "py", label: "Python" },
];

const CATEGORIES: Category[] = [
  { id: "biz", title: "Business", icon: "briefcase-outline" as any },
  { id: "design", title: "Design", icon: "color-palette-outline" as any },
  { id: "code", title: "Code", icon: "code-slash-outline" as any },
  { id: "lang", title: "Language", icon: "language-outline" as any },
];

const CourseCard = memo(({ item }: { item: Course }) => (
  <TouchableOpacity
    style={styles.card}
    activeOpacity={0.9}
    onPress={() => router.push(`/course/${item.id}`)}
  >
    <View style={styles.cardImageWrap}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.cardImage} />
      ) : (
        <View
          style={[
            styles.cardImage,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          <Text style={{ color: "#9ca3af", fontSize: 12 }}>No image</Text>
        </View>
      )}

      <TouchableOpacity style={styles.bookmarkBtn}>
        <Ionicons name="bookmark-outline" size={18} color="#111827" />
      </TouchableOpacity>
    </View>

    <View style={{ paddingHorizontal: 8, paddingTop: 6, paddingBottom: 10 }}>
      <Text numberOfLines={2} style={styles.courseTitle}>
        {item.title}
      </Text>
      {item.description ? (
        <Text numberOfLines={2} style={styles.teacher}>
          {item.description}
        </Text>
      ) : (
        <Text style={styles.teacher}>No description</Text>
      )}
      <Text style={styles.price}>${item.price}</Text>
    </View>
  </TouchableOpacity>
));

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ✅ Hàm gọi API backend:
  // - Nếu có keyword -> /courses?search=keyword
  // - Nếu rỗng      -> /courses  (tất cả khoá học)
  const fetchCourses = async (keyword: string) => {
    const trimmed = keyword.trim();
    let url = `${API_BASE}/courses`;
    if (trimmed) {
      url += `?search=${encodeURIComponent(trimmed)}`;
    }

    try {
      setLoading(true);
      const res = await fetch(url);
      const data = (await res.json()) as Course[];
      setResults(data);
      setFirstLoad(false);
    } catch (e) {
      console.log("Search error", e);
      setResults([]);
      setFirstLoad(false);
    } finally {
      setLoading(false);
    }
  };

  // 👉 Lần đầu mở màn hình: load tất cả khoá học
  useEffect(() => {
    fetchCourses("");
  }, []);

  // 👉 Click vào Hot topic: fill query + search ngay
  const onTopicPress = (label: string) => {
    setQuery(label);
    fetchCourses(label);
  };

  // 👉 Debounce khi gõ
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchCourses(query);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const renderResult = useCallback(
    ({ item }: { item: Course }) => <CourseCard item={item} />,
    []
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top"]}>
      {/* ô tìm kiếm cố định */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="#9ca3af" />
          <TextInput
            placeholder="Search course by name..."
            placeholderTextColor="#9ca3af"
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <MaterialIcons name="tune" size={18} color="#fff" />
          <Text style={styles.filterText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Nội dung cuộn */}
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Hot topics */}
        <Text style={styles.sectionTitle}>Hot topics</Text>
        <View style={styles.chipsWrap}>
          {HOT_TOPICS.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={styles.chip}
              onPress={() => onTopicPress(t.label)}
            >
              <Text style={styles.chipText}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity>
            <Text style={styles.viewMore}>View more</Text>
          </TouchableOpacity>
        </View>
        <View style={{ gap: 10 }}>
          {CATEGORIES.map((c) => (
            <TouchableOpacity key={c.id} style={styles.catItem}>
              <View style={styles.catLeft}>
                <Ionicons name={c.icon} size={20} color="#0ea5b7" />
                <Text style={styles.catTitle}>{c.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Results */}
        <View style={[styles.sectionHeader, { marginTop: 18 }]}>
          <Text style={styles.sectionTitle}>Results</Text>
        </View>

        {loading ? (
          <View style={{ alignItems: "center", paddingVertical: 16 }}>
            <ActivityIndicator />
            <Text style={{ marginTop: 8, color: "#6b7280" }}>
              Đang tìm kiếm…
            </Text>
          </View>
        ) : results.length === 0 ? (
          <Text
            style={{
              paddingHorizontal: 16,
              marginTop: 8,
              color: "#6b7280",
            }}
          >
            {firstLoad
              ? "Đang tải dữ liệu khoá học..."
              : "Không tìm thấy khóa học phù hợp"}
          </Text>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(it) => it.id}
            renderItem={renderResult}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            style={{ marginTop: 8 }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ====== STYLES ====== */
const styles = StyleSheet.create({
  searchRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#fff",
    zIndex: 10,
  },
  searchBox: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    gap: 8,
  },
  searchInput: { flex: 1, color: "#111827", paddingVertical: 6 },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#06b6d4",
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 2 },
    }),
  },
  filterText: { color: "#fff", fontWeight: "600" },
  sectionHeader: {
    marginTop: 18,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    paddingHorizontal: 16,
    marginTop: 16,
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  viewMore: { color: "#06b6d4", fontWeight: "600" },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#22d3ee",
    backgroundColor: "#ecfeff",
  },
  chipText: { color: "#06b6d4", fontWeight: "600", fontSize: 12 },
  catItem: {
    marginHorizontal: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  catLeft: { flexDirection: "row", gap: 10, alignItems: "center" },
  catTitle: { fontSize: 15, color: "#111827", fontWeight: "600" },
  card: {
    width: 220,
    borderRadius: 14,
    backgroundColor: "#fff",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardImageWrap: {
    width: "100%",
    height: 120,
    position: "relative",
    backgroundColor: "#f3f4f6",
  },
  cardImage: { width: "100%", height: "100%" },
  badge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#14b8a6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  bookmarkBtn: {
    position: "absolute",
    right: 8,
    bottom: 8,
    backgroundColor: "#fff",
    borderRadius: 999,
    padding: 6,
  },
  courseTitle: { fontWeight: "700", color: "#111827" },
  teacher: { marginTop: 2, color: "#6b7280", fontSize: 12 },
  price: { marginTop: 4, color: "#06b6d4", fontWeight: "700" },
  metaRow: { marginTop: 4, flexDirection: "row", alignItems: "center" },
  metaText: { fontSize: 11, color: "#6b7280", marginLeft: 4 },
  dot: { color: "#9ca3af", marginHorizontal: 6 },
});
