// app/(tabs)/index.tsx
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/context/AuthContext";

type Course = {
  id: string;
  title: string;
  teacher: string;
  price: string;
  rating: string;
  lessons: string;
  image: string;
  badge?: string;
};
type Teacher = { id: string; name: string; org: string; avatar: string };

const MOCK_API =
  process.env.EXPO_PUBLIC_API_URL_MOCK || "https://690b72fe6ad3beba00f50368.mockapi.io/courses"; // đổi thành URL MockAPI của bạn

export default function HomeScreen() {
  const { user } = useAuth();

  const [recommended, setRecommended] = useState<Course[] | null>(null);
  const [inspires, setInspires] = useState<Course[] | null>(null);
  const [teachers, setTeachers] = useState<Teacher[] | null>(null);
  const [loading, setLoading] = useState(true);

  const categories = useMemo(
    () => [
      { id: "1", name: "Business",   color: "#1eceda", icon: "briefcase-outline" },
      { id: "2", name: "Design",     color: "#8b5cf6", icon: "color-palette-outline" },
      { id: "3", name: "Code",       color: "#ef4444", icon: "code-slash-outline" },
      { id: "4", name: "Writing",    color: "#3b82f6", icon: "create-outline" },
      { id: "5", name: "Movie",      color: "#7c3aed", icon: "film-outline" },
      { id: "6", name: "Language",   color: "#f59e0b", icon: "language-outline" },
    ],
    []
  );

  const loadHome = useCallback(async () => {
    const ctl = new AbortController();
    try {
      setLoading(true);

      // Gọi 3 endpoint mock (tự tạo trên MockAPI):
      // 1) /courses?tag=recommended
      // 2) /courses?tag=inspires
      // 3) /teachers
      const [r1, r2, r3] = await Promise.all([
        axios.get(`${MOCK_API}/courses`, { params: { tag: "recommended" }, signal: ctl.signal }),
        axios.get(`${MOCK_API}/courses`, { params: { tag: "inspires" }, signal: ctl.signal }),
        axios.get(`${MOCK_API}/teachers`, { signal: ctl.signal }),
      ]);

      setRecommended(Array.isArray(r1.data) ? r1.data : []);
      setInspires(Array.isArray(r2.data) ? r2.data : []);
      setTeachers(Array.isArray(r3.data) ? r3.data : []);
    } catch (e) {
      // Fallback dữ liệu tĩnh nếu API lỗi
      setRecommended([
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
          title: "UX Research for Beginners",
          teacher: "Olivia Wang",
          price: "$29",
          rating: "4.5 (1782)",
          lessons: "12 lessons",
          image:
            "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop",
          badge: "20% OFF",
        },
      ]);
      setInspires([
        {
          id: "c3",
          title: "Digital Portrait",
          teacher: "Ramono Wutschner",
          price: "$67",
          rating: "4.5 (657)",
          lessons: "12 lessons",
          image:
            "https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=800&auto=format&fit=crop",
        },
        {
          id: "c4",
          title: "Workspace Decor",
          teacher: "Ruth Diamond",
          price: "$19",
          rating: "4.5 (333)",
          lessons: "17 lessons",
          image:
            "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop",
        },
        {
          id: "c5",
          title: "Packaging Design",
          teacher: "Hui Anderson",
          price: "$89",
          rating: "4.5 (1233)",
          lessons: "14 lessons",
          image:
            "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop",
        },
      ]);
      setTeachers([
        {
          id: "t1",
          name: "Christian Hayes",
          org: "University of …",
          avatar:
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop",
        },
        {
          id: "t2",
          name: "Dennis Sweeney",
          org: "University of …",
          avatar:
            "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=400&auto=format&fit=crop",
        },
        {
          id: "t3",
          name: "Lily Carter",
          org: "Design School",
          avatar:
            "https://images.unsplash.com/photo-1541534401786-2077eed87a74?q=80&w=400&auto=format&fit=crop",
        },
      ]);
    } finally {
      setLoading(false);
    }
    return () => ctl.abort();
  }, []);

  useEffect(() => {
    let aborter: (() => void) | undefined;
    (async () => {
      aborter = await loadHome();
    })();
    return () => { aborter && aborter(); };
  }, [loadHome]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8, color: "#64748b" }}>Đang tải...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          {/* Header */}
          <View
            style={{
              paddingHorizontal: 16,
              paddingTop: 4,
              paddingBottom: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View>
              <Text style={{ color: "#00b4c6", fontSize: 12, marginBottom: 2 }}>
                What do you want to learn today?
              </Text>
              <Text style={{ fontSize: 24, fontWeight: "800" }}>
                Hello{user?.name ? `, ${user.name}!` : ", Rosie!"}
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity>
                <Ionicons name="cart-outline" size={22} />
              </TouchableOpacity>
              <TouchableOpacity>
                <Ionicons name="notifications-outline" size={22} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Promo Banner */}
          <View
            style={{
              marginHorizontal: 16,
              backgroundColor: "#1eceda",
              borderRadius: 16,
              overflow: "hidden",
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#fff", fontWeight: "800", marginBottom: 6 }}>
                PROJECT MANAGEMENT
              </Text>
              <Text style={{ color: "#fff", fontSize: 28, fontWeight: "900" }}>
                20% OFF
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: "#fff",
                  alignSelf: "flex-start",
                  marginTop: 10,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 8,
                }}
              >
                <Text style={{ fontWeight: "800", color: "#0f172a" }}>JOIN NOW</Text>
              </TouchableOpacity>
            </View>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1519241047957-be31d7379a5d?q=80&w=400&auto=format&fit=crop",
              }}
              style={{ width: 110, height: 110, borderRadius: 12, marginLeft: 12 }}
            />
          </View>

          {/* Categories */}
          <SectionHeader title="Categories" />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, paddingHorizontal: 16 }}>
            {categories.map((c) => (
              <CategoryItem key={c.id} label={c.name} color={c.color} icon={c.icon as any} />
            ))}
          </View>

          {/* Recommended for you */}
          <SectionHeader title="Recommended for you" link />
          <FlatList
            data={recommended ?? []}
            keyExtractor={(i) => i.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            renderItem={({ item }) => <CourseCard course={item} />}
            style={{ marginTop: 6 }}
          />

          {/* Course that inspires */}
          <SectionHeader title="Course that inspires" link />
          <FlatList
            data={inspires ?? []}
            keyExtractor={(i) => i.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            renderItem={({ item }) => <CourseCard course={item} />}
            style={{ marginTop: 6 }}
          />

          {/* Top teachers */}
          <SectionHeader title="Top teachers" link />
          <FlatList
            data={teachers ?? []}
            keyExtractor={(i) => i.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            renderItem={({ item }) => <TeacherCard t={item} />}
            style={{ marginTop: 6 }}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

/* ========== Components ========== */

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
      <Text style={{ fontSize: 18, fontWeight: "800" }}>{title}</Text>
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

function CategoryItem({
  label,
  color,
  icon,
}: {
  label: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <TouchableOpacity
      style={{
        width: "47%",
        backgroundColor: "#fff",
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: "#eef2f7",
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
      }}
      activeOpacity={0.8}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          backgroundColor: color,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name={icon} size={20} color="#fff" />
      </View>
      <Text style={{ fontWeight: "700" }}>{label}</Text>
    </TouchableOpacity>
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

function TeacherCard({ t }: { t: Teacher }) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={{
        width: 180,
        backgroundColor: "#fff",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#eef2f7",
        padding: 12,
        alignItems: "center",
      }}
    >
      <Image source={{ uri: t.avatar }} style={{ width: 80, height: 80, borderRadius: 40 }} />
      <Text style={{ fontWeight: "800", marginTop: 10 }}>{t.name}</Text>
      <Text numberOfLines={1} style={{ color: "#6b7280", marginTop: 2 }}>
        {t.org}
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 }}>
        <Ionicons name="star" size={14} color="#f59e0b" />
        <Text style={{ color: "#6b7280" }}>4.5 (1233)</Text>
      </View>
    </TouchableOpacity>
  );
}
