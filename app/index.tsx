// app/index.tsx
import { Redirect } from "expo-router";
import { useAuth } from "../src/context/AuthContext"; // đã có trong dự án của bạn

export default function Index() {
  const { user } = useAuth(); // giả định: null/undefined là chưa đăng nhập
  if (user) return <Redirect href="/(tabs)" />;
  return <Redirect href="/(auth)/login" />;
}
