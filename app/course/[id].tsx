// app/course/[id].tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../../src/services/api";

// ====== Types khớp backend ======
type Course = {
  id: string;
  title: string;
  teacher: string;
  price: number;
  rating: number | null;
  image?: string | null;
};

type LessonFromApi = {
  id: string;
  title: string;
  duration: number | null; // giây
  order: number;
  completed?: boolean;
  videoUrl: string | null;
};

type LessonItem = {
  id: string;
  title: string;
  durationMin: number;
  completed?: boolean;
  videoUrl: string;
};

type LessonSection = {
  id: string;
  courseId: string;
  sectionTitle: string;
  items: LessonItem[];
};

type TabKey = "overview" | "lessons" | "review";

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const courseId = id as string;
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<LessonSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("lessons");

  // ====== Load course + lessons từ backend ======
  useEffect(() => {
    if (!courseId) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);

        const [cRes, lRes] = await Promise.all([
          api.get(`/api/courses/${courseId}`),
          api.get(`/api/lessons/by-course/${courseId}`),
        ]);

        if (cancelled) return;

        console.log("[COURSE_DETAIL] courseId =", courseId);
        console.log("[COURSE_DETAIL] course =", cRes.data);
        console.log("[COURSE_DETAIL] lessons =", lRes.data);

        const rawCourse = cRes.data;
        const courseData = (rawCourse.course ?? rawCourse) as Course;

        const lessonsRaw = lRes.data;
        const lessonsArr: LessonFromApi[] = Array.isArray(lessonsRaw)
          ? lessonsRaw
          : (lessonsRaw.lessons ?? []);

        const section: LessonSection = {
          id: "main",
          courseId,
          sectionTitle: "Course content",
          items: lessonsArr
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((l) => ({
              id: l.id,
              title: l.title,
              durationMin: l.duration ? Math.round(l.duration / 60) : 0,
              completed: l.completed ?? false,
              videoUrl:
                l.videoUrl && l.videoUrl.startsWith("http")
                  ? l.videoUrl
                  : "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4",
            })),
        };

        setCourse(courseData);
        setSections([section]);
      } catch (err: any) {
        console.log(
          "[COURSE_DETAIL_ERROR]",
          err?.response?.status,
          err?.response?.data ?? String(err)
        );
        setCourse(null);
        setSections([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [courseId]);

  const totalLessons = useMemo(
    () => sections.reduce((sum, s) => sum + s.items.length, 0),
    [sections]
  );

  const onLessonPress = (ls: LessonItem) => {
    router.push({
      pathname: "/lesson/[id]",      // app/lesson/[id].tsx
      params: {
        id: ls.id,
        courseId,
        title: ls.title,
        videoUrl: ls.videoUrl,
      },
    });
  };

  if (loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <ActivityIndicator />
        <Text style={{ marginTop: 8, color: "#64748b" }}>Loading…</Text>
      </SafeAreaView>
    );
  }

  if (!course) {
    return (
      <SafeAreaView
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <Text>Không tìm thấy khóa học.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {!!course.image && (
        <Image
          source={{ uri: course.image }}
          style={{ width: "100%", height: 180 }}
        />
      )}

      {/* Thông tin cơ bản */}
      <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: "800" }}>{course.title}</Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            marginTop: 6,
          }}
        >
          <Ionicons name="star" size={14} color="#f59e0b" />
          <Text style={{ color: "#475569" }}>{course.rating ?? 0}</Text>
          <Text style={{ color: "#94a3b8" }}>
            {"  •  "}
            {totalLessons} lessons
          </Text>
        </View>
      </View>

      {/* TAB HEADER */}
      <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
          {(["overview", "lessons", "review"] as TabKey[]).map((key) => {
            const selected = activeTab === key;
            return (
              <TouchableOpacity
                key={key}
                onPress={() => setActiveTab(key)}
                activeOpacity={0.7}
              >
                <View
                  style={{ alignItems: "center", paddingVertical: 8, width: 110 }}
                >
                  <Text
                    style={{
                      fontWeight: selected ? "800" : "700",
                      color: selected ? "#06b6d4" : "#6b7280",
                      letterSpacing: 0.3,
                    }}
                  >
                    {key.toUpperCase()}
                  </Text>
                  <View
                    style={{
                      height: 3,
                      width: selected ? 82 : 0,
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

      {/* NỘI DUNG TABS */}
      {activeTab === "overview" && (
        <View style={{ padding: 16 }}>
          <Text style={{ fontWeight: "800", marginBottom: 8 }}>
            About this course
          </Text>
          <Text style={{ color: "#475569", lineHeight: 20 }}>
            Khóa học cung cấp kiến thức nền tảng về {course.title}. Bạn sẽ nắm
            vững quy trình, công cụ và các thực hành tốt nhất để bắt đầu nhanh
            chóng.
          </Text>

          <View style={{ marginTop: 16, gap: 8 }}>
            <Row label="Giảng viên" value={course.teacher} />
            <Row label="Giá" value={`$${course.price}`} />
            <Row label="Đánh giá" value={String(course.rating ?? 0)} />
          </View>
        </View>
      )}

      {activeTab === "lessons" && (
        <LessonsAccordion sections={sections} onLessonPress={onLessonPress} />
      )}

      {activeTab === "review" && (
        <View style={{ padding: 16 }}>
          <Text style={{ fontWeight: "800", marginBottom: 8 }}>
            Student reviews
          </Text>
          <Text style={{ color: "#64748b" }}>
            Chức năng đánh giá sẽ được bổ sung (MVP).
          </Text>
        </View>
      )}

      {/* Footer Add to cart */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderTopWidth: 1,
          borderTopColor: "#e2e8f0",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text
          style={{
            fontWeight: "900",
            fontSize: 18,
            color: "#0f172a",
          }}
        >
          ${course.price}
        </Text>
        <TouchableOpacity
          activeOpacity={0.9}
          style={{
            backgroundColor: "#06b6d4",
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "800" }}>Add to cart</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* ---------- Components phụ ---------- */
function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <Text style={{ color: "#64748b" }}>{label}</Text>
      <Text style={{ fontWeight: "700" }}>{value}</Text>
    </View>
  );
}

type LessonsAccordionProps = {
  sections: LessonSection[];
  onLessonPress: (ls: LessonItem) => void;
};

function LessonsAccordion({ sections, onLessonPress }: LessonsAccordionProps) {
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    if (sections.length > 0) setOpen(sections[0].id);
  }, [sections]);

  return (
    <FlatList
      data={sections}
      keyExtractor={(s) => s.id}
      contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
      renderItem={({ item: sec }) => {
        const opened = open === sec.id;
        return (
          <View
            style={{
              borderWidth: 1,
              borderColor: "#e2e8f0",
              borderRadius: 12,
              marginBottom: 12,
              overflow: "hidden",
            }}
          >
            <TouchableOpacity
              onPress={() => setOpen(opened ? null : sec.id)}
              style={{
                backgroundColor: "#f8fafc",
                paddingHorizontal: 12,
                paddingVertical: 12,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
              activeOpacity={0.7}
            >
              <Text style={{ fontWeight: "800" }}>{sec.sectionTitle}</Text>
              <Ionicons
                name={opened ? "chevron-up" : "chevron-down"}
                size={18}
                color="#0f172a"
              />
            </TouchableOpacity>

            {opened &&
              sec.items.map((ls, idx) => (
                <TouchableOpacity
                  key={ls.id}
                  onPress={() => onLessonPress(ls)}
                  activeOpacity={0.8}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 12,
                    borderTopWidth: 1,
                    borderTopColor: "#e2e8f0",
                    backgroundColor: idx === 1 ? "#ecfeff" : "#fff",
                    borderLeftWidth: idx === 1 ? 3 : 0,
                    borderLeftColor: idx === 1 ? "#06b6d4" : "transparent",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                      flex: 1,
                    }}
                  >
                    <Text style={{ color: "#334155", width: 26 }}>
                      {String(idx + 1).padStart(2, "0")}
                    </Text>
                    <Text style={{ fontWeight: "700", flex: 1 }}>
                      {ls.title}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {ls.completed ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color="#22c55e"
                      />
                    ) : (
                      <Ionicons
                        name="play-circle-outline"
                        size={18}
                        color="#94a3b8"
                      />
                    )}
                    <Text style={{ color: "#64748b" }}>
                      {ls.durationMin} mins
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
          </View>
        );
      }}
    />
  );
}
