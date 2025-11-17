// src/services/lessonApi.ts
import { api } from "./api";

export type LessonFromApi = {
  id: string;
  title: string;
  duration?: number | null; // giây
  order?: number | null;
  videoUrl?: string | null;
  // completed?: boolean;  // nếu backend có field này thì thêm
};

export async function fetchLessonsByCourse(courseId: string) {
  const res = await api.get(`/api/lessons/by-course/${courseId}`, {
    params: { t: Date.now() }, // tránh cache 304
  });

  console.log(
    "[fetchLessonsByCourse] raw =",
    JSON.stringify(res.data, null, 2)
  );

  // 🔥 Backend trả thẳng array nên cast luôn:
  return res.data as LessonFromApi[];
}

export async function completeLesson(lessonId: string) {
  const res = await api.post(`/api/lessons/${lessonId}/complete`);
  return res.data;
}
