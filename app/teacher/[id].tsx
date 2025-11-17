// ✅ app/teacher/[id].tsx — màn hình hồ sơ giảng viên với 3 tab: OVERVIEW | REVIEWS | COURSES TAUGHT
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
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

const BASE_URL = "http://192.168.1.128:3000"; // đổi theo LAN của bạn

type Teacher = {
  id: string;
  name: string;
  org: string;
  avatar: string;
  bio?: string;        // (tùy backend)
  rating?: number;     // (tùy backend)
  reviewsCount?: number;
};

type Course = {
  id: string;
  title: string;
  teacher: string;     // hoặc teacherId nếu backend của bạn có field này
  price: string;
  rating: string;
  lessons: string;
  image: string;
};

type Review = {
  id: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
};

type TabKey = "overview" | "reviews" | "courses";

export default function TeacherProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [tab, setTab] = useState<TabKey>("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let stop = false;
    (async () => {
      try {
        setLoading(true);

        // lấy thông tin giảng viên
        const tRes = await fetch(`${BASE_URL}/teachers/${id}`);
        const tJson = await tRes.json();

        // lấy course theo teacher (nếu DB dùng teacherId: /courses?teacherId=${id})
        const cRes = await fetch(`${BASE_URL}/courses?teacher=${encodeURIComponent(tJson.name)}`);
        const cJson = await cRes.json();

        // (tuỳ chọn) nếu bạn chưa có reviews trong db.json, trả mảng rỗng
        let rJson: Review[] = [];
        try {
          const rRes = await fetch(`${BASE_URL}/reviews?teacherId=${id}`);
          rJson = (await rRes.json()) ?? [];
        } catch {}

        if (!stop) {
          setTeacher(tJson);
          setCourses(Array.isArray(cJson) ? cJson : []);
          setReviews(Array.isArray(rJson) ? rJson : []);
        }
      } catch {
        if (!stop) {
          setTeacher(null);
          setCourses([]);
          setReviews([]);
        }
      } finally {
        !stop && setLoading(false);
      }
    })();
    return () => {
      stop = true;
    };
  }, [id]);

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return teacher?.rating ?? 4.5;
    const s = reviews.reduce((a, b) => a + b.rating, 0);
    return Math.round((s / reviews.length) * 10) / 10;
  }, [reviews, teacher]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8, color: "#64748b" }}>Loading…</Text>
      </SafeAreaView>
    );
  }

  if (!teacher) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Không tìm thấy giảng viên.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Header */}
        <View style={{ padding: 16, flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Image
            source={{ uri: teacher.avatar }}
            style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: "#f3f4f6" }}
          />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: "800" }}>{teacher.name}</Text>
            <Text style={{ color: "#6b7280", marginTop: 2 }}>{teacher.org}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 }}>
              <Ionicons name="star" size={14} color="#f59e0b" />
              <Text style={{ color: "#475569", fontWeight: "700" }}>
                {avgRating} <Text style={{ color: "#94a3b8", fontWeight: "400" }}>
                  ({teacher.reviewsCount ?? reviews.length} reviews)
                </Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={{ paddingHorizontal: 16, marginTop: 6 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
            {(["overview", "reviews", "courses"] as TabKey[]).map((k) => {
              const sel = tab === k;
              return (
                <TouchableOpacity key={k} onPress={() => setTab(k)} activeOpacity={0.7}>
                  <View style={{ alignItems: "center", paddingVertical: 8, width: 120 }}>
                    <Text style={{ color: sel ? "#06b6d4" : "#6b7280", fontWeight: sel ? "800" : "700" }}>
                      {k === "overview" ? "OVERVIEW" : k === "reviews" ? "REVIEWS" : "COURSES"}
                    </Text>
                    <View
                      style={{
                        height: 3,
                        width: sel ? 82 : 0,
                        backgroundColor: "#06b6d4",
                        borderRadius: 3,
                        marginTop: 6,
                      }}
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={{ height: 1, backgroundColor: "#e2e8f0" }} />
        </View>

        {/* Tab contents */}
        {tab === "overview" && (
          <View style={{ padding: 16 }}>
            <Text style={{ fontWeight: "800", marginBottom: 8 }}>About</Text>
            <Text style={{ color: "#475569", lineHeight: 20 }}>
              {teacher.bio ||
                "Giảng viên có nhiều năm kinh nghiệm giảng dạy và thực hành trong lĩnh vực. Đam mê chia sẻ kiến thức, chú trọng thực hành và dự án thực tế."}
            </Text>
          </View>
        )}

        {tab === "reviews" && (
          <View style={{ paddingHorizontal: 16, paddingTop: 10, gap: 10 }}>
            {reviews.length === 0 ? (
              <Text style={{ color: "#64748b" }}>Chưa có đánh giá.</Text>
            ) : (
              reviews.map((r) => (
                <View
                  key={r.id}
                  style={{
                    borderWidth: 1,
                    borderColor: "#e5e7eb",
                    borderRadius: 12,
                    padding: 12,
                    backgroundColor: "#fff",
                    gap: 6,
                  }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ fontWeight: "700" }}>{r.user}</Text>
                    <Text style={{ color: "#94a3b8", fontSize: 12 }}>{r.date}</Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Ionicons name="star" size={14} color="#f59e0b" />
                    <Text style={{ color: "#475569", fontWeight: "700" }}>{r.rating}</Text>
                  </View>
                  <Text style={{ color: "#475569" }}>{r.comment}</Text>
                </View>
              ))
            )}
          </View>
        )}

        {tab === "courses" && (
          <FlatList
            data={courses}
            keyExtractor={(i) => i.id}
            scrollEnabled={false}
            contentContainerStyle={{ padding: 16, gap: 12 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => router.push(`/course/${item.id}`)} // 👉 vào chi tiết khóa học
                style={{
                  flexDirection: "row",
                  borderWidth: 1,
                  borderColor: "#e5e7eb",
                  borderRadius: 12,
                  backgroundColor: "#fff",
                  padding: 10,
                }}
              >
                <Image source={{ uri: item.image }} style={{ width: 80, height: 80, borderRadius: 10 }} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text numberOfLines={2} style={{ fontWeight: "800" }}>
                    {item.title}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 }}>
                    <Ionicons name="star" size={14} color="#f59e0b" />
                    <Text style={{ color: "#475569" }}>{item.rating}</Text>
                    <Text style={{ color: "#94a3b8" }}>• {item.lessons}</Text>
                  </View>
                  <Text style={{ color: "#06b6d4", fontWeight: "800", marginTop: 6 }}>{item.price}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
