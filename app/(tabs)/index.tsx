// app/(tabs)/index.tsx
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/context/AuthContext";
import { useMyCourses } from "../../src/context/MyCoursesContext";
import { getImageSource } from "../../utils/images";

type Course = {
  id: string;
  title: string;
  teacher: string;
  price: string;
  rating: string;
  lessons: string;
  image: string;
  badge?: string;
  tag?: string; // recommended | inspires (nếu bạn gắn tag trong db.json)
};
type Teacher = { id: string; name: string; org: string; avatar: string };

const BASE_URL = "http://192.168.1.128:3000"; // 👈 Đổi thành IP LAN máy bạn (Android emulator: 10.0.2.2, iOS sim: 127.0.0.1)

export default function HomeScreen() {
  const { user } = useAuth();

  // ====== STATE ======
  const [recommended, setRecommended] = useState<Course[]>([]);
  const [inspires, setInspires] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  // ====== FETCH DATA TỪ JSON SERVER (không axios) ======
  useEffect(() => {
    let stopped = false;

    const load = async () => {
      try {
        setLoading(true);

        // Nếu bạn gắn tag cho course trong db.json, ta có thể query theo tag:
        // /courses?tag=recommended  và  /courses?tag=inspires
        const [recRes, inspRes, teaRes] = await Promise.all([
          fetch(`${BASE_URL}/courses?tag=recommended`),
          fetch(`${BASE_URL}/courses?tag=inspires`),
          fetch(`${BASE_URL}/teachers`),
        ]);

        const [recJson, inspJson, teaJson] = await Promise.all([
          recRes.json(),
          inspRes.json(),
          teaRes.json(),
        ]);

        if (!stopped) {
          // Nếu backend chưa có tag, bạn có thể thay bằng fetch tất cả /courses, rồi tách theo field nào đó
          setRecommended(Array.isArray(recJson) ? recJson : []);
          setInspires(Array.isArray(inspJson) ? inspJson : []);
          setTeachers(Array.isArray(teaJson) ? teaJson : []);
        }
      } catch (e) {
        if (!stopped) {
          // Lỗi API -> để mảng rỗng; không dùng dữ liệu tĩnh theo yêu cầu
          setRecommended([]);
          setInspires([]);
          setTeachers([]);
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
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, paddingHorizontal: 16 }}>
            {categories.map((c) => (
              <CategoryItem key={c.id} label={c.name} color={c.color} icon={c.icon as any} />
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

/* ========== Components (giữ nguyên UI) ========== */

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

// function CourseCard({ course }: { course: Course }) {
//   return (
//     <TouchableOpacity
//       onPress={() => router.push(`/course/${course.id}`)} // ✅ điều hướng tuyệt đối
//       activeOpacity={0.9}
//       style={{
//         width: 240,
//         backgroundColor: "#fff",
//         borderRadius: 16,
//         borderWidth: 1,
//         borderColor: "#eef2f7",
//         overflow: "hidden",
//       }}
//     >
//       <View style={{ position: "relative" }}>
//         <Image source={{ uri: course.image }} style={{ width: 240, height: 120 }} />
//         {course.badge && (
//           <View
//             style={{
//               position: "absolute",
//               top: 8,
//               left: 8,
//               backgroundColor: "#10b981",
//               paddingHorizontal: 8,
//               paddingVertical: 4,
//               borderRadius: 8,
//             }}
//           >
//             <Text style={{ color: "#fff", fontWeight: "800", fontSize: 12 }}>
//               {course.badge}
//             </Text>
//           </View>
//         )}
//       </View>

//       <View style={{ padding: 12 }}>
//         <Text numberOfLines={2} style={{ fontWeight: "800", fontSize: 15 }}>
//           {course.title}
//         </Text>
//         <Text style={{ color: "#6b7280", marginTop: 2 }}>{course.teacher}</Text>

//         <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 }}>
//           <Text style={{ color: "#16a34a", fontWeight: "800" }}>{course.price}</Text>
//           <Text style={{ color: "#6b7280" }}>•</Text>
//           <Ionicons name="star" size={14} color="#f59e0b" />
//           <Text style={{ color: "#6b7280" }}>{course.rating}</Text>
//           <Text style={{ color: "#6b7280" }}>• {course.lessons}</Text>
//         </View>
//       </View>
//     </TouchableOpacity>
//   );
// }

// function CourseCard({ course }: { course: Course }) {
//   return (
//     <TouchableOpacity
//       onPress={() => router.push(`/course/${course.id}`)}
//       activeOpacity={0.9}
//       style={{
//         width: 240,
//         backgroundColor: "#fff",
//         borderRadius: 16,
//         borderWidth: 1,
//         borderColor: "#eef2f7",
//         overflow: "hidden",
//       }}
//     >
//       <View style={{ position: "relative" }}>
//         <Image
//           source={getImageSource(course.image, "course")}
//           style={{ width: 240, height: 120 }}
//         />
//         {course.badge && (
//           <View
//             style={{
//               position: "absolute",
//               top: 8,
//               left: 8,
//               backgroundColor: "#10b981",
//               paddingHorizontal: 8,
//               paddingVertical: 4,
//               borderRadius: 8,
//             }}
//           >
//             <Text style={{ color: "#fff", fontWeight: "800", fontSize: 12 }}>
//               {course.badge}
//             </Text>
//           </View>
//         )}
//       </View>

//       <View style={{ padding: 12 }}>
//         <Text numberOfLines={2} style={{ fontWeight: "800", fontSize: 15 }}>
//           {course.title}
//         </Text>
//         <Text style={{ color: "#6b7280", marginTop: 2 }}>{course.teacher}</Text>

//         <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 }}>
//           <Text style={{ color: "#16a34a", fontWeight: "800" }}>{course.price}</Text>
//           <Text style={{ color: "#6b7280" }}>•</Text>
//           <Ionicons name="star" size={14} color="#f59e0b" />
//           <Text style={{ color: "#6b7280" }}>{course.rating}</Text>
//           <Text style={{ color: "#6b7280" }}>• {course.lessons}</Text>
//         </View>
//       </View>
//     </TouchableOpacity>
//   );
// }
function CourseCard({ course }: { course: Course }) {
  const { addCourse, isOwned } = useMyCourses();
  const owned = isOwned(course.id);

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

        {/* Nút mua / đã mua */}
        <View style={{ marginTop: 10, flexDirection: "row", justifyContent: "flex-end" }}>
          {owned ? (
            <View
              style={{
                backgroundColor: "#e5f7ef",
                borderColor: "#16a34a",
                borderWidth: 1,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: "#16a34a", fontWeight: "700" }}>ĐÃ MUA</Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => addCourse(course)}
              activeOpacity={0.8}
              style={{
                backgroundColor: "#06b6d4",
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 8,
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
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 }}>
        <Ionicons name="star" size={14} color="#f59e0b" />
        <Text style={{ color: "#6b7280" }}>4.5 (1233)</Text>
      </View>
    </TouchableOpacity>
  );
}

