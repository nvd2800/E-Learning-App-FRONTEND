// app/(tabs)/Search.tsx
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { memo, useMemo } from "react";
import { FlatList, Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Topic = { id: string; label: string };
type Category = { id: string; title: string; icon: keyof typeof Ionicons.glyphMap };
type Course = {
  id: string;
  title: string;
  teacher: string;
  price: string;
  rating: string;
  lessons: string;
  image: string;
  badge?: string;  // ví dụ: "Best-seller" hoặc "20% Off"
};

const HOT_TOPICS: Topic[] = [
  { id: "java", label: "Java" },
  { id: "sql", label: "SQL" },
  { id: "js", label: "Javascript" },
  { id: "py", label: "Python" },
  { id: "dmk", label: "Digital marketing" },
  { id: "ps", label: "Photoshop" },
  { id: "wc", label: "Watercolor" },
];

const CATEGORIES: Category[] = [
  { id: "biz", title: "Business", icon: "briefcase-outline" as any },
  { id: "design", title: "Design", icon: "color-palette-outline" as any },
  { id: "code", title: "Code", icon: "code-slash-outline" as any },
  { id: "movie", title: "Movie", icon: "film-outline" as any },
  { id: "lang", title: "Language", icon: "language-outline" as any },
];

const RECOMMENDS: Course[] = [
  {
    id: "1",
    title: "Website Design",
    teacher: "Ramono Wutschner",
    price: "$590",
    rating: "4.5 (1233)",
    lessons: "9 lessons",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800&auto=format&fit=crop",
    badge: "Best-seller",
  },
  {
    id: "2",
    title: "UX Research For…",
    teacher: "Olivia Wang",
    price: "$290",
    rating: "4.5 (1782)",
    lessons: "12 lessons",
    image:
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=800&auto=format&fit=crop",
    badge: "20% Off",
  },
];

const Chip = memo(({ label }: { label: string }) => (
  <TouchableOpacity style={styles.chip}>
    <Text style={styles.chipText}>{label}</Text>
  </TouchableOpacity>
));

const CategoryItem = memo(({ item }: { item: Category }) => (
  <TouchableOpacity style={styles.catItem}>
    <View style={styles.catLeft}>
      <Ionicons name={item.icon as any} size={20} color="#0ea5b7" />
      <Text style={styles.catTitle}>{item.title}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
  </TouchableOpacity>
));

const CourseCard = memo(({ item }: { item: Course }) => {
  return (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardImageWrap}>
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        {item.badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        ) : null}
        <TouchableOpacity style={styles.bookmarkBtn}>
          <Ionicons name="bookmark-outline" size={18} color="#111827" />
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: 8, paddingTop: 6, paddingBottom: 10 }}>
        <Text numberOfLines={2} style={styles.courseTitle}>
          {item.title}
        </Text>
        <Text style={styles.teacher}>{item.teacher}</Text>
        <Text style={styles.price}>{item.price}</Text>

        <View style={styles.metaRow}>
          <Ionicons name="star" size={12} color="#f59e0b" />
          <Text style={styles.metaText}>{item.rating}</Text>
          <Text style={styles.dot}> • </Text>
          <Text style={styles.metaText}>{item.lessons}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

export default function SearchScreen() {
  const topicRows = useMemo(() => {
    return (
      <View style={styles.chipsWrap}>
        {HOT_TOPICS.map((t) => (
          <Chip key={t.id} label={t.label} />
        ))}
      </View>
    );
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Search + Filter */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color="#9ca3af" />
            <TextInput
              placeholder="Search course"
              placeholderTextColor="#9ca3af"
              style={styles.searchInput}
              returnKeyType="search"
            />
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <MaterialIcons name="tune" size={18} color="#fff" />
            <Text style={styles.filterText}>Filter</Text>
          </TouchableOpacity>
        </View>

        {/* Hot topics */}
        <Text style={styles.sectionTitle}>Hot topics</Text>
        {topicRows}

        {/* Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity>
            <Text style={styles.viewMore}>View more</Text>
          </TouchableOpacity>
        </View>
        <View style={{ gap: 10 }}>
          {CATEGORIES.map((c) => (
            <CategoryItem key={c.id} item={c} />
          ))}
        </View>

        {/* Recommended */}
        <View style={[styles.sectionHeader, { marginTop: 18 }]}>
          <Text style={styles.sectionTitle}>Recommended for you</Text>
          <TouchableOpacity>
            <Text style={styles.viewMore}>View more</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={RECOMMENDS}
          keyExtractor={(it) => it.id}
          renderItem={({ item }) => <CourseCard item={item} />}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
          style={{ marginTop: 8 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 8,
    alignItems: "center",
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
      ios: { shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
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
  sectionTitle: { paddingHorizontal: 16, marginTop: 16, fontSize: 16, fontWeight: "700", color: "#111827" },
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
  cardImageWrap: { width: "100%", height: 120, position: "relative", backgroundColor: "#f3f4f6" },
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
