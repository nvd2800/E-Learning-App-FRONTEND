// src/context/AuthContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api";

type User = { id: string; name: string; email: string };
type ContextType = {
  user: User | null;
  token: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<ContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const t = await AsyncStorage.getItem("token");
      if (t) {
        try {
          const { data } = await api.get("/api/auth/me", {
            headers: { Authorization: `Bearer ${t}` },
          });
          setUser(data.user);
          setToken(t);
        } catch {
          await AsyncStorage.removeItem("token");
        }
      }
      setLoading(false);
    })();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data } = await api.post("/api/auth/login", { email, password });
    await AsyncStorage.setItem("token", data.token);
    setUser(data.user);
    setToken(data.token);
  };

  const signUp = async (name: string, email: string, password: string) => {
    const { data } = await api.post("/api/auth/register", {
      name,
      email,
      password,
    });
    await AsyncStorage.setItem("token", data.token);
    setUser(data.user);
    setToken(data.token);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem("token");
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
