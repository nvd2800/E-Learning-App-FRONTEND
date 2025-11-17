// src/services/api.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Platform } from "react-native";

// =======================
// 1. BASE URL – đổi theo IP LAN của bạn
// =======================
const API_BASE =
  process.env.EXPO_PUBLIC_API_URL ??
  Platform.select({
    ios: "http://192.168.1.128:4000",
    android: "http://192.168.1.128:4000",
    default: "http://localhost:4000",
  });

// =======================
// 2. Tạo instance axios
// =======================
export const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// =======================
// 3. Gắn token tự động
// =======================
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    console.log("Không đọc được token:", e);
  }
  return config;
});

// =======================
// 4. Export BASE_URL nếu cần
// =======================
export { API_BASE };
