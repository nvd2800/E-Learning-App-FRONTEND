// app/(tabs)/index.tsx
// Trang Home – đồng bộ % hoàn thành từ backend với MyCourses
//  + Mỗi CourseCard chỉ gọi API /api/lessons/by-course/:courseId tối đa 1 lần
//    nhờ dùng useRef (tránh spam request như hình terminal của bạn)

import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react"; // ✅ thêm useRef
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/context/AuthContext";
import { useMyCourses } from "../../src/context/MyCoursesContext";
import { useSavedCourses } from "../../src/context/SavedCoursesContext";
import { api } from "../../src/services/api";
import { getImageSource } from "../../utils/images";

// ====== Types khớp backend hơn ======
type Course = {
  id: string;
  title: string;
  teacher: string;
  price: number;          // backend đang để number
  rating?: number | null; // có thể không có
  lessonsCount?: number;  // số bài học (nếu backend trả)
  image?: string | null;
  badge?: string;
  tag?: string;           // "recommended" | "inspires" | ...
};

type Teacher = { id: string; name: string; org: string; avatar: string };

// Có thể thay bằng API riêng nếu sau này bạn build backend cho Teacher
const TEACHERS_STATIC: Teacher[] = [
  {
    id: "t1",
    name: "Ramono Wutschner",
    org: "UX Studio",
    avatar:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "t2",
    name: "Olivia Wang",
    org: "Product School",
    avatar:
      "https://images.unsplash.com/photo-1525134479668-1bee5c7c6845?q=80&w=600&auto=format&fit=crop",
  },
];

export default function HomeScreen() {
  const { user } = useAuth();

  const [recommended, setRecommended] = useState<Course[]>([]);
  const [inspires, setInspires] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  // ====== Lấy course từ backend thật ======
  useEffect(() => {
    let stopped = false;

    const load = async () => {
      try {
        setLoading(true);

        // GET /api/courses  (backend bạn đã làm)
        const res = await api.get("/api/courses");
        const list = (res.data ?? []) as Course[];

        if (stopped) return;

        // Ưu tiên group theo tag nếu backend có field "tag"
        const rec = list.filter((c) => c.tag === "recommended");
        const insp = list.filter((c) => c.tag === "inspires");

        setRecommended(rec.length ? rec : list.slice(0, 3));
        setInspires(insp.length ? insp : list.slice(3, 6));

        // tạm dùng teacher tĩnh
        setTeachers(TEACHERS_STATIC);
      } catch (e) {
        console.log("Load courses error:", e);
        if (!stopped) {
          setRecommended([]);
          setInspires([]);
          setTeachers(TEACHERS_STATIC);
        }
      } finally {
        !stopped && setLoading(false);
      }
    };

    load();
    return () => {
      stopped = true;
    };
  }, []);

  const categories = useMemo(
    () => [
      { id: "1", name: "Business", color: "#1eceda", icon: "briefcase-outline" },
      { id: "2", name: "Design", color: "#8b5cf6", icon: "color-palette-outline" },
      { id: "3", name: "Code", color: "#ef4444", icon: "code-slash-outline" },
      { id: "4", name: "Writing", color: "#3b82f6", icon: "create-outline" },
      { id: "5", name: "Movie", color: "#7c3aed", icon: "film-outline" },
      { id: "6", name: "Language", color: "#f59e0b", icon: "language-outline" },
    ],
    []
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8, color: "#64748b" }}>Loading…</Text>
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
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 12,
              paddingHorizontal: 16,
            }}
          >
            {categories.map((c) => (
              <CategoryItem
                key={c.id}
                label={c.name}
                color={c.color}
                icon={c.icon as any}
                onPress={() =>
                  router.push({ pathname: "../(tabs)/Search", params: { q: c.name } })
                }
              />
            ))}
          </View>

          {/* Recommended for you */}
          <SectionHeader title="Recommended for you" link />
          <FlatList
            data={recommended}
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
            data={inspires}
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
            data={teachers}
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

/* ===== Components ===== */

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
  onPress,
}: {
  label: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
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

/* ==== CourseCard: giữ logic MyCourses + SavedCourses ==== */
function CourseCard({ course }: { course: Course }) {
  const { addCourse, isOwned, setProgress } = useMyCourses();
  const { isSaved, toggleSave } = useSavedCourses();

  const owned = isOwned(course.id);
  const saved = isSaved(course.id);

  const ratingText =
    typeof course.rating === "number" ? course.rating.toFixed(1) : "4.5";

  const lessonsText =
    typeof course.lessonsCount === "number"
      ? `${course.lessonsCount} lessons`
      : "3 lessons";

  // Chuẩn hóa object khi lưu vào SavedCourses
  const handleToggleSave = () => {
    toggleSave({
      id: course.id,
      title: course.title,
      teacher: course.teacher,
      price: `$${course.price}`,
      image: course.image || "",
      rating: "",
      lessons: "",
    });
  };

  // ✅ Dùng ref để đảm bảo mỗi card chỉ gọi API sync progress tối đa 1 lần
  const syncedOnceRef = useRef(false);

  useEffect(() => {
    // Nếu chưa mua thì không sync, reset cờ
    if (!owned) {
      syncedOnceRef.current = false;
      return;
    }

    // Nếu đã sync rồi thì bỏ qua, tránh gọi API lặp lại
    if (syncedOnceRef.current) return;
    syncedOnceRef.current = true;

    const syncProgress = async () => {
      try {
        const res = await api.get(`/api/lessons/by-course/${course.id}`);
        const lessons = (res.data ?? []) as { completed?: boolean }[];
        const total = lessons.length;
        if (!total) return;

        const done = lessons.filter((ls) => ls.completed).length;
        const percent = Math.round((done / total) * 100);

        setProgress(course.id, percent);
      } catch (err) {
        console.log("Sync lesson progress error:", err);
      }
    };

    syncProgress();
  }, [owned, course.id, setProgress]); // Effect không bị loop vì đã có syncedOnceRef

  return (
    <TouchableOpacity
      onPress={() => router.push(`/course/${course.id}`)}
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
      {/* Image */}
      <View style={{ position: "relative" }}>
        <Image
          source={getImageSource(course.image || "", "course")}
          style={{ width: 240, height: 120 }}
        />
        {!!course.badge && (
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
      </View>

      {/* Body */}
      <View style={{ padding: 12 }}>
        <Text numberOfLines={2} style={{ fontWeight: "800", fontSize: 15 }}>
          {course.title}
        </Text>
        <Text style={{ color: "#6b7280", marginTop: 2 }}>{course.teacher}</Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginTop: 8,
          }}
        >
          <Text style={{ color: "#16a34a", fontWeight: "800" }}>
            ${course.price}
          </Text>
          <Text style={{ color: "#6b7280" }}>•</Text>
          <Ionicons name="star" size={14} color="#f59e0b" />
          <Text style={{ color: "#6b7280" }}>{ratingText}</Text>
          <Text style={{ color: "#6b7280" }}>• {lessonsText}</Text>
        </View>

        {/* Action bar */}
        <View
          style={{
            height: 46,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 12,
            paddingBottom: 10,
          }}
        >
          {/* Bookmark */}
          <TouchableOpacity
            onPress={handleToggleSave}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: saved ? "#e0f7fb" : "#f3f4f6",
            }}
            activeOpacity={0.8}
          >
            <MaterialIcons
              name={saved ? "bookmark" : "bookmark-border"}
              size={20}
              color={saved ? "#0ea5e9" : "#9ca3af"}
            />
          </TouchableOpacity>

          {/* Mua / ĐÃ MUA */}
          {owned ? (
            <View
              style={{
                backgroundColor: "#e5f7ef",
                borderColor: "#16a34a",
                borderWidth: 1,
                height: 36,
                borderRadius: 8,
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 16,
              }}
            >
              <Text style={{ color: "#16a34a", fontWeight: "700" }}>ĐÃ MUA</Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() =>
                addCourse(
                  {
                    id: course.id,
                    title: course.title,
                    teacher: course.teacher,
                    price: `$${course.price}`,
                    image: course.image || "",
                  },
                  0
                )
              }
              activeOpacity={0.8}
              style={{
                backgroundColor: "#06b6d4",
                height: 36,
                borderRadius: 8,
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 16,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "800" }}>Mua</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function TeacherCard({ t }: { t: Teacher }) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push(`../teacher/${t.id}`)}
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
      <Image
        source={getImageSource(t.avatar, "teacher")}
        style={{ width: 80, height: 80, borderRadius: 40 }}
      />
      <Text style={{ fontWeight: "800", marginTop: 10 }}>{t.name}</Text>
      <Text numberOfLines={1} style={{ color: "#6b7280", marginTop: 2 }}>
        {t.org}
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
          marginTop: 6,
        }}
      >
        <Ionicons name="star" size={14} color="#f59e0b" />
        <Text style={{ color: "#6b7280" }}>4.5 (1233)</Text>
      </View>
    </TouchableOpacity>
  );
}
