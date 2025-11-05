import { Redirect } from "expo-router";
import { useAuth } from "../src/context/AuthContext";

export default function Index() {
  const { user, loading } = useAuth();
  if (loading) return null; // có thể show spinner nếu thích
  return user ? <Redirect href="/(tabs)" /> : <Redirect href="/(auth)/login" />;
}
