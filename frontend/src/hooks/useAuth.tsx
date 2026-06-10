"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../lib/api";
import type { Operator } from "../types";

interface UseAuthResult {
  user: Operator | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithMfa: (userId: string, token: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  mfaRequired: boolean;
  pendingUserId: string | null;
}

function setCookie(name: string, value: string, days = 7) {
  if (typeof window === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  if (typeof window === "undefined") return null;
  const matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : null;
}

function deleteCookie(name: string) {
  if (typeof window === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
}

export function useAuth(redirectUnauthenticated = false): UseAuthResult {
  const [user, setUser] = useState<Operator | null>(null);
  const [loading, setLoading] = useState(true);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadMe() {
      try {
        const token = typeof window !== "undefined" ? (localStorage.getItem("auth_token") || getCookie("auth_token")) : null;
        if (!token) {
          if (redirectUnauthenticated) {
            router.replace("/login");
          }
          setLoading(false);
          return;
        }
        // Ensure synchronized
        if (typeof window !== "undefined" && !localStorage.getItem("auth_token")) {
          localStorage.setItem("auth_token", token);
        }
        if (typeof window !== "undefined" && !getCookie("auth_token")) {
          setCookie("auth_token", token, 7);
        }
        const res = await api.get("/auth/me");
        setUser(res.data.operator);
      } catch {
        localStorage.removeItem("auth_token");
        deleteCookie("auth_token");
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

    if (res.data.mfaRequired && res.data.userId) {
      setMfaRequired(true);
      setPendingUserId(res.data.userId);
      return;
    }

    localStorage.setItem("auth_token", res.data.token);
    setCookie("auth_token", res.data.token, 7);
    setUser(res.data.operator);
    setMfaRequired(false);
    setPendingUserId(null);
    router.replace("/dashboard");
  };

  const loginWithMfa = async (userId: string, token: string) => {
    const res = await api.post("/auth/2fa/login-verify", { userId, token });
    localStorage.setItem("auth_token", res.data.token);
    setCookie("auth_token", res.data.token, 7);
    setUser(res.data.operator);
    setMfaRequired(false);
    setPendingUserId(null);
    router.replace("/dashboard");
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await api.post("/auth/register", { name, email, password });
    localStorage.setItem("auth_token", res.data.token);
    setCookie("auth_token", res.data.token, 7);
    setUser(res.data.operator);
    router.replace("/dashboard");
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    deleteCookie("auth_token");
    setUser(null);
    setMfaRequired(false);
    setPendingUserId(null);
    router.replace("/login");
  };

  const refreshUser = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data.operator);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("qhord:user-updated", { detail: res.data.operator }));
      }
    } catch {
      /* ignore */
    }
  };

  return {
    user,
    loading,
    login,
    loginWithMfa,
    register,
    logout,
    refreshUser,
    mfaRequired,
    pendingUserId,
  };
}
