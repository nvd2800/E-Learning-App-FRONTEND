//Tạo context lưu khóa học đã mua

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Course = {
  id: string;
  title: string;
  teacher: string;
  price: string;
  rating: string;
  lessons: string;
  image: string;
  badge?: string;
};

type Ctx = {
  myCourses: Course[];
  addCourse: (c: Course) => void;
  removeCourse: (id: string) => void;
  isOwned: (id: string) => boolean;
  clearAll: () => void;
};

const STORAGE_KEY = "my_courses";
const MyCoursesContext = createContext<Ctx | null>(null);

export function MyCoursesProvider({ children }: { children: React.ReactNode }) {
  const [myCourses, setMyCourses] = useState<Course[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setMyCourses(JSON.parse(raw));
      } catch {}
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(myCourses)).catch(() => {});
  }, [myCourses]);

  const addCourse = (c: Course) => {
    setMyCourses((prev) => (prev.some((x) => x.id === c.id) ? prev : [c, ...prev]));
  };

  const removeCourse = (id: string) => {
    setMyCourses((prev) => prev.filter((x) => x.id !== id));
  };

  const isOwned = (id: string) => myCourses.some((x) => x.id === id);

  const clearAll = () => setMyCourses([]);

  const value = useMemo(() => ({ myCourses, addCourse, removeCourse, isOwned, clearAll }), [myCourses]);

  return <MyCoursesContext.Provider value={value}>{children}</MyCoursesContext.Provider>;
}

export function useMyCourses() {
  const ctx = useContext(MyCoursesContext);
  if (!ctx) throw new Error("useMyCourses must be used within MyCoursesProvider");
  return ctx;
}
