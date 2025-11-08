// app/(tabs)/Profile.tsx
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { memo, useMemo, useState } from "react";
import {
    Image,
    ImageErrorEventData,
    NativeSyntheticEvent,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/context/AuthContext";
// import axios from "axios"; // (API) Bật lại khi nối API

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

const SavedItem = memo(({ item }: { item: Course }) => (
  <TouchableOpacity activeOpacity={0.9} style={styles.card}>
    <Image source={{ uri: item.image }} style={styles.thumb} />
    <View style={{ flex: 1, marginHorizontal: 12 }}>
      <Text style={styles.cardTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.cardTeacher}>{item.teacher}</Text>

      <Text style={styles.cardPrice}>{item.price}</Text>
      <View style={styles.metaRow}>
        <Ionicons name="star" size={12} color="#f59e0b" />
        <Text style={styles.metaText}>{item.rating}</Text>
        <Text style={styles.dot}> • </Text>
        <Text style={styles.metaText}>{item.lessons}</Text>
      </View>
    </View>

    <TouchableOpacity style={styles.bookmark}>
      <MaterialIcons name="bookmark-border" size={18} color="#0ea5b7" />
    </TouchableOpacity>
  </TouchableOpacity>
));

export default function ProfileScreen() {
  const { user } = useAuth();
  const displayName = user?.name || "User";
  const fallbackAvatar = getAvatarFromName(displayName);
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatar || fallbackAvatar);

  const onAvatarError = (_e: NativeSyntheticEvent<ImageErrorEventData>) => {
    if (avatarUrl !== fallbackAvatar) setAvatarUrl(fallbackAvatar);
  };

  // ========= Saved courses (MOCK) =========
  const [savedCourses, setSavedCourses] = useState<Course[]>([
    {
      id: "c1",
      title: "Product Design",
      teacher: "Dennis Sweeney",
      price: "$190",
      rating: "4.5 (1233)",
      lessons: "12 lessons",
      image:
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "c2",
      title: "Website Design",
      teacher: "Ramono Wutschner",
      price: "$59",
      rating: "4.5 (1233)",
      lessons: "9 lessons",
      image:
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "c3",
      title: "Mobile UI Design",
      teacher: "Ramono Wutschner",
      price: "$320",
      rating: "4.5 (1233)",
      lessons: "12 lessons",
      image:
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "c4",
      title: "Digital Portrait",
      teacher: "Olivia Wang",
      price: "$67",
      rating: "4.5 (1233)",
      lessons: "12 lessons",
      image:
        "https://images.unsplash.com/photo-1520975682031-c0d61b570387?q=80&w=800&auto=format&fit=crop",
    },
  ]);

  const stats = useMemo(
    () => [
      { value: "25", label: "Save" },
      { value: "24", label: "On Going" },
      { value: "98", label: "Completed" },
    ],
    []
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Banner (outer) */}
        <View style={styles.bannerOuter}>
          <View style={styles.bannerInner}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop",
              }}
              style={styles.bannerImg}
            />
          </View>

          <Image
            source={{ uri: avatarUrl }}
            onError={onAvatarError}
            style={styles.avatar}
          />
        </View>

        {/* Name + role */}
        <View style={{ alignItems: "center", marginTop: 42 }}>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.role}>UX/UI Designer</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {stats.map((s) => (
            <View key={s.label} style={styles.statBox}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Saved courses */}
        <Text style={styles.sectionTitle}>Saved courses</Text>
        <View style={{ paddingHorizontal: 16, gap: 12 }}>
          {savedCourses.map((c) => (
            <SavedItem key={c.id} item={c} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ================== Styles ================== */

const styles = StyleSheet.create({
  bannerOuter: {
    marginTop: 8,
    marginHorizontal: 16,
    position: "relative",
    overflow: "visible",
    height: 120,
  },
  bannerInner: {
    borderRadius: 14,
    overflow: "hidden",
    height: "100%",
    backgroundColor: "#f3f4f6",
  },
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

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
    paddingHorizontal: 16,
  },
  statBox: { alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "800", color: "#111827" },
  statLabel: { color: "#6b7280", marginTop: 2 },

  sectionTitle: {
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
      },
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
  bookmark: {
    marginLeft: 8,
    padding: 6,
    borderRadius: 999,
    backgroundColor: "#e0f7fb",
  },
});