import { ResizeMode, Video } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../../src/services/api";

export default function LessonPlayerScreen() {
  const { courseId, lessonId, title, videoUrl } = useLocalSearchParams<{
    courseId: string;
    lessonId: string;
    title: string;
    videoUrl: string;
  }>();

  const router = useRouter();
  const videoRef = useRef<Video | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onComplete = async () => {
    try {
      setSubmitting(true);
      await api.post(`/lessons/${lessonId}/complete`, { completed: true });
      Alert.alert("Hoàn thành", "Bạn đã hoàn thành bài học này!", [
        {
          text: "OK",
          onPress: () => router.back(), // quay lại Course Detail
        },
      ]);
    } catch (e: any) {
      console.log("complete lesson error:", e?.response?.data || e);
      Alert.alert("Lỗi", "Không cập nhật được trạng thái bài học");
    } finally {
      setSubmitting(false);
    }
  };

  if (!videoUrl) {
    return (
      <SafeAreaView
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <Text>Không có video cho bài học này.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      <View style={{ flex: 1 }}>
        <Video
          ref={videoRef}
          source={{ uri: String(videoUrl) }}
          style={{ width: "100%", height: 260, backgroundColor: "#000" }}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay
        />
      </View>

      <View
        style={{
          backgroundColor: "#fff",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
        }}
      >
        <Text style={{ fontWeight: "800", fontSize: 16, marginBottom: 8 }}>
          {title}
        </Text>

        <TouchableOpacity
          onPress={onComplete}
          disabled={submitting}
          style={{
            backgroundColor: "#16a34a",
            borderRadius: 10,
            paddingVertical: 12,
            alignItems: "center",
          }}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontWeight: "800" }}>
              Hoàn thành bài học
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 10, alignItems: "center" }}
        >
          <Text style={{ color: "#0ea5e9", fontWeight: "600" }}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
