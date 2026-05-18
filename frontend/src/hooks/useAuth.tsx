"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../lib/api";
import type { Operator } from "../types";

interface UseAuthResult {
  user: Operator | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export function useAuth(redirectUnauthenticated = false): UseAuthResult {
  const [user, setUser] = useState<Operator | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadMe() {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
        if (!token) {
          if (redirectUnauthenticated) {
            router.replace("/login");
          }
          setLoading(false);
          return;
        }
        const res = await api.get("/auth/me");
        setUser(res.data.operator);
      } catch {
        localStorage.removeItem("auth_token");
        if (redirectUnauthenticated) {
          router.replace("/login");
        }
      } finally {
        setLoading(false);
      }
    }

    loadMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("auth_token", res.data.token);
    setUser(res.data.operator);
    router.replace("/dashboard");
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await api.post("/auth/register", { name, email, password });
    localStorage.setItem("auth_token", res.data.token);
    setUser(res.data.operator);
    router.replace("/dashboard");
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    setUser(null);
    router.replace("/login");
  };

  return { user, loading, login, register, logout };
}

