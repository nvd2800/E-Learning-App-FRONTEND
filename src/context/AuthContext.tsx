// src/context/AuthContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api";

type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
};

type ContextType = {
  user: User | null;
  token: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (name: string, email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<ContextType | null>(null);
const TOKEN_KEY = "token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // lấy token -> gọi /api/auth/me
  useEffect(() => {
    (async () => {
      try {
        const t = await AsyncStorage.getItem(TOKEN_KEY);
        if (t) {
          api.defaults.headers.common["Authorization"] = `Bearer ${t}`;
          const { data } = await api.get("/api/auth/me");
          setUser(data.user as User);
          setToken(t);
        }
      } catch {
        await AsyncStorage.removeItem(TOKEN_KEY);
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // login
  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data } = await api.post("/api/auth/login", { email, password });

      const t = data.token as string;
      const u = data.user as User;

      await AsyncStorage.setItem(TOKEN_KEY, t);
      api.defaults.headers.common["Authorization"] = `Bearer ${t}`;

      setUser(u);
      setToken(t);

      return true;
    } catch (e) {
      console.log("signIn error:", (e as any)?.response?.data || e);
      return false;
    }
  };

  // register (nếu dùng qua context)
  const signUp = async (
    name: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      await api.post("/api/auth/register", { name, email, password });
      return true; // đăng ký xong chuyển qua màn login
    } catch (e) {
      console.log("signUp error:", (e as any)?.response?.data || e);
      return false;
    }
  };

  const signOut = async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, signIn, signUp, signOut, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
