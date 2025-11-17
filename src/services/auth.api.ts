// src/services/authApi.ts
import { api } from "./api";

export const authApi = {
  login: (email: string, password: string) =>
    api.post("/api/auth/login", { email, password }),

  register: (name: string, email: string, password: string) =>
    api.post("/api/auth/register", { name, email, password }),

  me: () => api.get("/api/auth/me"),
};
