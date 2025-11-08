// 📁 utils/images.ts

export const getImageSource = (
  path?: string | null,
  type: "teacher" | "course" = "course"
) => {
  // === 1️⃣ URL online ===
  if (path && (path.startsWith("http://") || path.startsWith("https://"))) {
    return { uri: path };
  }

  // === 2️⃣ Local image (nội bộ project) ===
  try {
    if (type === "teacher") {
      switch (path) {
        case "a1.png":
          return require("../assets/images/teacher/a1.png");
        default:
          return require("../assets/images/default-avatar.png");
      }
    }

    if (type === "course") {
      switch (path) {
        case "c1.png":
          return require("../assets/images/courses/a1.png");
        default:
          return require("../assets/images/default-avatar.png");
      }
    }
  } catch (err) {
    console.warn("[getImageSource] Image not found:", path);
  }

  // === 3️⃣ Fallback chung nếu lỗi ===
  return require("../assets/images/default-avatar.png");
};
