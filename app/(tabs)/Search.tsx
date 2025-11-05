import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const API_BASE =
  process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.128:4000"; // hoặc mockapi base

type Category = { id: string; name: string; icon: keyof typeof Ionicons.glyphMap };
type Course = {
  id: string;
  title: string;
  teacher: string;
  price: string;
  rating: string;
  lessons: string;
  image: string; // URL hoặc dùng helper getImageSource nếu bạn đã làm map local
  badge?: string;
};

export default function SearchScreen() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recom, setRecom] = useState<Course[]>([]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [t, c, r] = await Promise.all([
        axios.get<string[]>(`${API_BASE}/search/hot-topics`),
        axios.get<Category[]>(`${API_BASE}/categories`),
        axios.get<Course[]>(`${API_BASE}/courses`, { params: { tag: "recommended" } }),
      ]);
      setTopics(t.data || []);
      setCategories(
        (c.data || []).map((x) => ({
          ...x,
          icon: (x.icon as any) || "briefcase-outline",
        }))
      );
      setRecom(r.data || []);
    } catch (e) {
      // fallback demo nếu backend trống
      setTopics(["Java", "SQL", "Javascript", "Python", "Digital marketing", "Photoshop", "Watercolor"]);
      setCategories([
        { id: "1", name: "Business", icon: "briefcase-outline" },
        { id: "2", name: "Design", icon: "color-palette-outline" },
        { id: "3", name: "Code", icon: "code-slash-outline" },
        { id: "4", name: "Movie", icon: "film-outline" },
        { id: "5", name: "Language", icon: "language-outline" },
      ]);
      setRecom([
        {
          id: "c1",
          title: "Website Design",
          teacher: "Ramono Wutschner",
          price: "$59",
          rating: "4.5 (1233)",
          lessons: "9 lessons",
          image:
            "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800&auto=format&fit=crop",
          badge: "Best-seller",
        },
        {
          id: "c2",
          title: "UX Research For Beginners",
          teacher: "Olivia Wang",
          price: "$29",
          rating: "4.5 (1782)",
          lessons: "12 lessons",
          image:
            "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop",
          badge: "20% OFF",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const filteredRecom = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return recom;
    return recom.filter(
      (x) =>
        x.title.toLowerCase().includes(k) ||
        x.teacher.toLowerCase().includes(k)
    );
  }, [q, recom]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator />
          <Text style={{ color: "#64748b", marginTop: 8 }}>Đang tải...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          {/* Search + Filter */}
          <View style={{ flexDirection: "row", padding: 16, gap: 10 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: "#f1f5f9",
                borderRadius: 12,
                paddingHorizontal: 12,
                height: 44,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Ionicons name="search" size={18} color="#64748b" />
              <TextInput
                placeholder="Search course"
                value={q}
                onChangeText={setQ}
                style={{ flex: 1 }}
              />
            </View>
            <TouchableOpacity
              style={{
                backgroundColor: "#10bcd4",
                paddingHorizontal: 14,
                borderRadius: 12,
                height: 44,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 6,
              }}
            >
              <Ionicons name="filter" size={18} color="#fff" />
              <Text style={{ color: "#fff", fontWeight: "700" }}>Filter</Text>
            </TouchableOpacity>
          </View>

          {/* Hot topics */}
          <Text style={{ fontWeight: "800", fontSize: 16, paddingHorizontal: 16 }}>
            Hot topics
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 16, marginTop: 10 }}>
            {topics.map((t, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setQ(t)}
                style={{
                  borderWidth: 1,
                  borderColor: "#10bcd4",
                  borderRadius: 20,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                }}
              >
                <Text style={{ color: "#10bcd4", fontWeight: "600" }}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Categories */}
          <SectionHeader title="Categories" />
          <View style={{ paddingHorizontal: 16, gap: 10 }}>
            {categories.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={{
                  borderWidth: 1,
                  borderColor: "#e5e7eb",
                  borderRadius: 14,
                  padding: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      backgroundColor: "#eef7fb",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name={c.icon} size={18} color="#10bcd4" />
                  </View>
                  <Text style={{ fontWeight: "700" }}>{c.name}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Recommended for you */}
          <SectionHeader title="Recommended for you" link />
          <FlatList
            horizontal
            data={filteredRecom}
            keyExtractor={(i) => i.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            renderItem={({ item }) => <CourseCard course={item} />}
            style={{ marginTop: 6 }}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function SectionHeader({ title, link }: { title: string; link?: boolean }) {
  return (
    <View
      style={{
        paddingHorizontal: 16,
        marginTop: 18,
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Text style={{ fontWeight: "800", fontSize: 16 }}>{title}</Text>
      {link ? (
        <TouchableOpacity>
          <Text style={{ color: "#3b82f6", fontWeight: "600" }}>View more</Text>
        </TouchableOpacity>
      ) : (
        <View />
      )}
    </View>
  );
}

function CourseCard({ course }: { course: Course }) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={{
        width: 240,
        backgroundColor: "#fff",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#eef2f7",
        overflow: "hidden",
      }}
    >
      <View style={{ position: "relative" }}>
        <Image source={{ uri: course.image }} style={{ width: 240, height: 120 }} />
        {course.badge && (
          <View
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              backgroundColor: "#10b981",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 12 }}>
              {course.badge}
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={{
            position: "absolute",
            right: 8,
            bottom: 8,
            backgroundColor: "#fff",
            borderRadius: 20,
            padding: 6,
          }}
        >
          <MaterialIcons name="bookmark-border" size={18} />
        </TouchableOpacity>
      </View>

      <View style={{ padding: 12 }}>
        <Text numberOfLines={2} style={{ fontWeight: "800", fontSize: 15 }}>
          {course.title}
        </Text>
        <Text style={{ color: "#6b7280", marginTop: 2 }}>{course.teacher}</Text>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 }}>
          <Text style={{ color: "#16a34a", fontWeight: "800" }}>{course.price}</Text>
          <Text style={{ color: "#6b7280" }}>•</Text>
          <Ionicons name="star" size={14} color="#f59e0b" />
          <Text style={{ color: "#6b7280" }}>{course.rating}</Text>
          <Text style={{ color: "#6b7280" }}>• {course.lessons}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
