//1) Tạo context lưu khóa học đã lưu

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type SavedCourse = {
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
  ready: boolean;
  saved: SavedCourse[];
  savedCount: number;
  isSaved: (id: string) => boolean;
  toggleSave: (c: SavedCourse) => void; // nhấn lần 1 lưu, lần 2 bỏ lưu
  clearAll: () => void;
};

const STORAGE_KEY = "saved_courses";
const SavedCoursesContext = createContext<Ctx | null>(null);

export function SavedCoursesProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState<SavedCourse[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list)) setSaved(list);
        }
      } finally {
        setReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(saved)).catch(() => {});
  }, [saved, ready]);

  const isSaved = (id: string) => saved.some((c) => c.id === id);

  const toggleSave = (c: SavedCourse) =>
    setSaved((prev) => (prev.some((x) => x.id === c.id) ? prev.filter((x) => x.id !== c.id) : [c, ...prev]));

  const clearAll = () => setSaved([]);

  const value = useMemo(
    () => ({ ready, saved, savedCount: saved.length, isSaved, toggleSave, clearAll }),
    [ready, saved]
  );

  return <SavedCoursesContext.Provider value={value}>{children}</SavedCoursesContext.Provider>;
}

export function useSavedCourses() {
  const ctx = useContext(SavedCoursesContext);
  if (!ctx) throw new Error("useSavedCourses must be used within SavedCoursesProvider");
  return ctx;
}
