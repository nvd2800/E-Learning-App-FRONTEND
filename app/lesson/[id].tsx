// app/lesson/[id].tsx
import { ResizeMode, Video } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../../src/services/api";

type Params = {
  id?: string;
  courseId?: string;
  title?: string;
  videoUrl?: string;
};

export default function LessonPlayerScreen() {
  const router = useRouter();
  const { id, courseId, title, videoUrl } = useLocalSearchParams<Params>();
  const [completing, setCompleting] = useState(false);

  const lessonId = id as string;

  // Fallback nếu videoUrl từ backend không phải mp4 / không có http
  const safeVideoUrl = useMemo(() => {
    if (typeof videoUrl === "string" && videoUrl.startsWith("http")) {
      return videoUrl;
    }
    // demo video mp4 thật
    return "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
  }, [videoUrl]);

  if (!lessonId) {
    return (
      <SafeAreaView
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <Text>Không tìm thấy bài học.</Text>
      </SafeAreaView>
    );
  }

  const onComplete = async () => {
    try {
      setCompleting(true);
      await api.post(`/api/lessons/${lessonId}/complete`, {
        courseId: courseId ?? null,
      });

      Alert.alert("Hoàn thành", "Bạn đã hoàn thành bài học này.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      console.log("complete lesson error:", e?.response?.data || e);
      Alert.alert("Lỗi", "Không thể cập nhật tiến độ bài học.");
    } finally {
      setCompleting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      {/* VIDEO */}
      <View style={{ flex: 1 }}>
        <Video
          source={{ uri: safeVideoUrl }}
          style={{ width: "100%", height: "100%" }}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay
        />
      </View>

      {/* INFO + BUTTONS */}
      <View
        style={{
          backgroundColor: "#fff",
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 24,
        }}
      >
        <Text style={{ fontWeight: "800", fontSize: 16, marginBottom: 12 }}>
          {title ?? "Bài học"}
        </Text>

        <TouchableOpacity
          onPress={onComplete}
          disabled={completing}
          style={{
            backgroundColor: "#16a34a",
            paddingVertical: 12,
            borderRadius: 8,
            alignItems: "center",
          }}
          activeOpacity={0.9}
        >
          {completing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontWeight: "800" }}>
              Hoàn thành bài học
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            marginTop: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#0ea5e9", fontWeight: "600" }}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
