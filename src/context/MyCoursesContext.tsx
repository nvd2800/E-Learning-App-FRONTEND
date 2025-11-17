// ===============================
// src/context/MyCoursesContext.tsx
// ===============================
// Context quản lý khóa học của tôi + progress (0..100)
// Đã fix:
//  - Chuẩn hóa progress luôn là số nguyên 0..100
//  - Khi tính progress từ nơi khác (số thực 99.999...) sẽ được làm tròn về 100
//  - Completed tab lọc chính xác khi progress = 100

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

export type MyCourse = {
  id: string;
  title: string;
  teacher: string;
  price: string;
  image: string;
  progress: number; // % hoàn thành: luôn là số nguyên 0..100
};

type Ctx = {
  myCourses: MyCourse[];
  addCourse: (c: Omit<MyCourse, 'progress'>, progress?: number) => void;
  setProgress: (id: string, progress: number) => void;
  markCompleted: (id: string) => void;
  removeCourse: (id: string) => void;
  isOwned: (id: string) => boolean;
  clearAll: () => void;
  ready: boolean;
};

const STORAGE_KEY = 'myCourses.v1';
const MyCoursesContext = createContext<Ctx | undefined>(undefined);

// Hàm chuẩn hóa progress: ép về [0, 100] và làm tròn số nguyên
function normalizeProgress(p: number): number {
  const clamped = Math.max(0, Math.min(100, p));
  return Math.round(clamped);
}

export function MyCoursesProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [myCourses, setMyCourses] = useState<MyCourse[]>([]);

  // Hydrate từ AsyncStorage (hoặc seed demo lần đầu)
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed: MyCourse[] = JSON.parse(raw);

          // Đảm bảo dữ liệu cũ cũng được chuẩn hóa progress
          const normalized = parsed.map((c) => ({
            ...c,
            progress: normalizeProgress(c.progress ?? 0),
          }));

          setMyCourses(normalized);
        } else {
          // Seed demo: 1 ongoing, 1 hampir done, 1 completed
          const seed: MyCourse[] = [
            {
              id: 'c2',
              title: 'UX Research for Beginners',
              teacher: 'Olivia Wang',
              price: '$29',
              image:
                'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=800&auto=format&fit=crop',
              progress: 30,
            },
            {
              id: 'c7',
              title: 'Creative Art Design',
              teacher: 'Hanna Moore',
              price: '$39',
              image:
                'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop',
              progress: 70,
            },
            {
              id: 'c9',
              title: 'Palettes for Your App',
              teacher: 'Julia Kim',
              price: '$19',
              image:
                'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=800&auto=format&fit=crop',
              progress: 100,
            },
          ];
          setMyCourses(seed);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
        }
      } catch (e) {
        console.warn('[MyCourses] read error:', e);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  // Persist xuống AsyncStorage mỗi khi myCourses thay đổi
  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(myCourses)).catch(() => {});
  }, [myCourses, ready]);

  // Thêm khóa học mới (mặc định progress = 0)
  const addCourse: Ctx['addCourse'] = (c, progress = 0) =>
    setMyCourses((prev) =>
      prev.some((x) => x.id === c.id)
        ? prev
        : [
            ...prev,
            {
              ...c,
              progress: normalizeProgress(progress),
            },
          ]
    );

  // Set % hoàn thành cho 1 khóa học
  const setProgress: Ctx['setProgress'] = (id, p) => {
    const v = normalizeProgress(p);
    setMyCourses((prev) =>
      prev.map((x) => (x.id === id ? { ...x, progress: v } : x))
    );
  };

  // Đánh dấu hoàn thành
  const markCompleted: Ctx['markCompleted'] = (id) => setProgress(id, 100);

  // Xóa 1 khóa khỏi MyCourses
  const removeCourse = (id: string) =>
    setMyCourses((prev) => prev.filter((x) => x.id !== id));

  // Kiểm tra đã sở hữu khóa học chưa
  const isOwned = (id: string) => myCourses.some((x) => x.id === id);

  // Xóa hết (dùng cho nút Clear all)
  const clearAll = () => setMyCourses([]);

  const value = useMemo(
    () => ({
      myCourses,
      addCourse,
      setProgress,
      markCompleted,
      removeCourse,
      isOwned,
      clearAll,
      ready,
    }),
    [myCourses, ready]
  );

  // Khi chưa hydrate xong: hiển thị màn chờ
  if (!ready) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fff',
        }}
      >
        <ActivityIndicator size="large" color="#1eceda" />
        <Text
          style={{ marginTop: 10, fontSize: 16, color: '#374151' }}
        >
          Đang tải dữ liệu khóa học...
        </Text>
      </View>
    );
  }

  return (
    <MyCoursesContext.Provider value={value}>
      {children}
    </MyCoursesContext.Provider>
  );
}

export function useMyCourses() {
  const ctx = useContext(MyCoursesContext);
  if (!ctx)
    throw new Error('useMyCourses must be used within MyCoursesProvider');
  return ctx;
}
