"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "../../hooks/useAuth";

export default function LoginPage() {
  const { login, register, loading } = useAuth(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="card w-full max-w-md">
        <h2 className="mb-2 text-xl font-semibold">
          {mode === "login" ? "Sign in to GTM Control Tower" : "Create an operator account"}
        </h2>
        <p className="mb-4 text-xs text-slate-400">
          This is an internal execution layer for external GTM tools. Leads are never stored here.
        </p>
        <div className="mb-4 flex gap-2 text-xs">
          <button
            type="button"
            className={`flex-1 rounded-md px-2 py-1 ${
              mode === "login" ? "bg-slate-800 text-white" : "bg-slate-900 text-slate-400"
            }`}
            onClick={() => setMode("login")}
          >
            Sign in
          </button>
          <button
            type="button"
            className={`flex-1 rounded-md px-2 py-1 ${
              mode === "register" ? "bg-slate-800 text-white" : "bg-slate-900 text-slate-400"
            }`}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "register" && (
            <div>
              <label className="mb-1 block text-xs text-slate-300">Name</label>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={submitting}
              />
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs text-slate-300">Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={submitting}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-300">Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={submitting}
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={submitting || loading}
          >
            {submitting ? "Working..." : mode === "login" ? "Sign in" : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}

