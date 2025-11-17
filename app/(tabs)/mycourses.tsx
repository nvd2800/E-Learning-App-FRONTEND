// ===============================
// app/(tabs)/mycourses.tsx
// ===============================
// Màn "My Courses" với 3 tab:
//  - ALL: tất cả khóa học
//  - ON GOING: 0 < progress < 100
//  - COMPLETED: progress = 100
// Đã fix:
//  - Khi progress = 100 sẽ chuyển sang tab Completed
//  - Luôn hiển thị "% Complete" kể cả khi 100%

import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MyCourse, useMyCourses } from '../../src/context/MyCoursesContext';

type TabKey = 'all' | 'ongoing' | 'completed';

export default function MyCoursesScreen() {
  const { myCourses, removeCourse, clearAll } = useMyCourses();

  // Tab hiện tại
  const [active, setActive] = useState<TabKey>('all');

  // Helper: clamp progress 0..100 (phòng dữ liệu cũ)
  const clampProgress = (p: number) => Math.max(0, Math.min(100, Math.round(p)));

  // Lọc danh sách theo tab
  const data = useMemo(() => {
    const list = myCourses.map((c) => ({
      ...c,
      progress: clampProgress(c.progress),
    }));

    if (active === 'completed') {
      // Completed: chỉ khóa học có progress = 100
      return list.filter((c) => c.progress === 100);
    }
    if (active === 'ongoing') {
      // On going: 0 < progress < 100
      return list.filter((c) => c.progress > 0 && c.progress < 100);
    }
    // ALL: trả về tất cả
    return list;
  }, [myCourses, active]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>My Courses</Text>
        {myCourses.length > 0 && (
          <TouchableOpacity onPress={clearAll}>
            <Text style={styles.clearAll}>Clear all</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        bounces={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Banner trên cùng */}
        <View style={styles.banner}>
          <View style={styles.bannerCard}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.bannerSmall}>Courses that boost</Text>
              <Text style={styles.bannerBig}>your career!</Text>
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.bannerBtn}
              >
                <Text style={{ color: '#06b6d4', fontWeight: '800' }}>
                  Check Now
                </Text>
              </TouchableOpacity>
            </View>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1590031905470-a1cf3f1f4b04?w=400&auto=format&fit=crop',
              }}
              style={{ width: 90, height: 90, borderRadius: 12 }}
            />
          </View>
        </View>

        {/* Tabs: ALL | ON GOING | COMPLETED */}
        <View style={styles.tabsRow}>
          {(['all', 'ongoing', 'completed'] as TabKey[]).map((key) => {
            const sel = active === key;
            return (
              <TouchableOpacity
                key={key}
                onPress={() => setActive(key)}
                activeOpacity={0.7}
                style={styles.tabBtn}
              >
                <Text
                  style={[
                    styles.tabText,
                    sel && styles.tabTextActive,
                  ]}
                >
                  {key === 'all'
                    ? 'ALL'
                    : key === 'ongoing'
                    ? 'ON GOING'
                    : 'COMPLETED'}
                </Text>
                <View
                  style={[styles.tabBar, sel && styles.tabBarActive]}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Trạng thái rỗng cho từng tab */}
        {data.length === 0 && (
          <View style={{ alignItems: 'center', paddingTop: 40 }}>
            <Text style={{ color: '#64748b' }}>
              {active === 'all'
                ? 'Chưa có khóa học nào.'
                : active === 'ongoing'
                ? 'Chưa có khóa học đang học.'
                : 'Chưa có khóa học đã hoàn thành.'}
            </Text>
          </View>
        )}

        {/* Danh sách khóa học */}
        <FlatList
          data={data}
          keyExtractor={(i) => i.id}
          scrollEnabled={false} // cho ScrollView cha lo việc cuộn
          contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
          renderItem={({ item }) => (
            <CourseRow
              item={item}
              onRemove={() => removeCourse(item.id)}
            />
          )}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

/** 1 hàng khóa học + progress bar */
function CourseRow({
  item,
  onRemove,
}: {
  item: MyCourse;
  onRemove: () => void;
}) {
  // Đảm bảo progress hiển thị là số nguyên 0..100
  const progress = Math.max(
    0,
    Math.min(100, Math.round(item.progress ?? 0))
  );

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push(`/course/${item.id}`)}
      style={styles.card}
    >
      <Image source={{ uri: item.image }} style={styles.thumb} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text numberOfLines={1} style={styles.cardTitle}>
          {item.title}
        </Text>

        {/* Thời lượng mô phỏng: có thể thay bằng dữ liệu thật từ backend */}
        <Text style={styles.cardSub}>
          ~ {Math.max(1, Math.round((240 * progress) / 100))} mins
        </Text>

        {/* Text % hoàn thành – luôn hiển thị kể cả 100% */}
        <Text style={styles.percentText}>{progress}% Complete</Text>

        {/* Thanh progress */}
        <View style={styles.progressTrack}>
          <View
            style={[styles.progressFill, { width: `${progress}%` }]}
          />
        </View>
      </View>

      {/* Nút xóa khóa học khỏi MyCourses */}
      <TouchableOpacity onPress={onRemove} style={styles.removeBtn}>
        <Text style={{ color: '#ef4444', fontWeight: '700' }}>×</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

/* ================== Styles ================== */
const styles = StyleSheet.create({
  headerRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 20, fontWeight: '800', color: '#111827' },
  clearAll: { color: '#ef4444', fontWeight: '700' },

  banner: { paddingHorizontal: 16, marginTop: 4 },
  bannerCard: {
    backgroundColor: '#7dd3fc',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bannerSmall: { color: '#0b5566', fontWeight: '800' },
  bannerBig: {
    color: '#0b5566',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
  bannerBtn: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },

  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 14,
    marginBottom: 10,
  },
  tabBtn: { alignItems: 'center', paddingVertical: 6, width: 130 },
  tabText: { color: '#6b7280', fontWeight: '700', letterSpacing: 0.3 },
  tabTextActive: { color: '#06b6d4' },
  tabBar: {
    height: 3,
    width: 0,
    backgroundColor: 'transparent',
    borderRadius: 3,
    marginTop: 6,
  },
  tabBarActive: { width: 82, backgroundColor: '#06b6d4' },

  card: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 1 },
    }),
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
  },
  cardTitle: { fontWeight: '800', color: '#111827' },
  cardSub: { color: '#9ca3af', marginTop: 2, fontSize: 12 },

  percentText: { color: '#06b6d4', fontWeight: '700', marginTop: 8 },
  progressTrack: {
    height: 6,
    backgroundColor: '#e6f6fa',
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#06b6d4',
    borderRadius: 999,
  },

  removeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 6,
    borderRadius: 8,
    backgroundColor: '#fff0f0',
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
});
