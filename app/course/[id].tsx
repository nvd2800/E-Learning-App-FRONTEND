// app/course/[id].tsx
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function CourseDetail() {
  const { id } = useLocalSearchParams();

  // (Dữ liệu tạm, sau này có thể gọi API bằng id)
  const course = {
    title: "UX Foundation: Introduction to UX Design",
    author: "Olivia Wang",
    lessons: "12 lessons",
    price: "$59",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=800&auto=format&fit=crop",
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={{ fontWeight: "700", fontSize: 16 }}>Course Detail</Text>
        <TouchableOpacity>
          <Ionicons name="bookmark-outline" size={22} color="#111" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Image source={{ uri: course.image }} style={{ width: "100%", height: 200 }} />
        <View style={{ padding: 16 }}>
          <Text style={{ fontWeight: "800", fontSize: 20 }}>{course.title}</Text>
          <Text style={{ color: "#6b7280", marginTop: 4 }}>{course.author}</Text>
          <Text style={{ marginTop: 8, color: "#10b981", fontWeight: "700" }}>{course.price}</Text>
          <Text style={{ marginTop: 4, color: "#6b7280" }}>{course.lessons}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
