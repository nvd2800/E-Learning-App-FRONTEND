// app/(tabs)/mycourses.tsx
import { router } from "expo-router";
import React from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMyCourses } from "../../src/context/MyCoursesContext";

export default function MyCoursesScreen() {
  const { myCourses, removeCourse, clearAll } = useMyCourses();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ paddingHorizontal: 16, paddingVertical: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: 20, fontWeight: "800" }}>My Courses</Text>
        {myCourses.length > 0 && (
          <TouchableOpacity onPress={clearAll}>
            <Text style={{ color: "#ef4444", fontWeight: "700" }}>Clear all</Text>
          </TouchableOpacity>
        )}
      </View>

      {myCourses.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 16 }}>
          <Text style={{ color: "#64748b" }}>Chưa có khóa học nào. Hãy mua từ màn hình Home.</Text>
        </View>
      ) : (
        <FlatList
          data={myCourses}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/course/${item.id}`)}
              activeOpacity={0.9}
              style={{
                flexDirection: "row",
                backgroundColor: "#fff",
                padding: 10,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#e5e7eb",
              }}
            >
              <Image source={{ uri: item.image }} style={{ width: 80, height: 80, borderRadius: 10 }} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text numberOfLines={2} style={{ fontWeight: "800" }}>{item.title}</Text>
                <Text style={{ color: "#6b7280", marginTop: 2 }}>{item.teacher}</Text>

                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
                  <Text style={{ color: "#06b6d4", fontWeight: "800" }}>{item.price}</Text>
                  <TouchableOpacity onPress={() => removeCourse(item.id)}>
                    <Text style={{ color: "#ef4444", fontWeight: "700" }}>Gỡ</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}
