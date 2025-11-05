import axios from "axios";
import { Platform } from "react-native";

const envURL = process.env.EXPO_PUBLIC_API_URL;
const fallback = Platform.select({
  ios: "http://192.168.1.23:4000",   // đổi IP LAN của PC bạn
  android: "http://10.0.2.2:4000",   // Emulator Android
  default: "http://localhost:4000",
}) as string;

export const API_URL = envURL || fallback;

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});
