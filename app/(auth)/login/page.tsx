"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f13]">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="text-xl font-bold text-[#e2e2f0]">LocalReach AI</span>
          </div>
          <h1 className="text-2xl font-bold text-[#e2e2f0]">Bine ai revenit</h1>
          <p className="text-[#6b7280] mt-1 text-sm">Autentifică-te în contul tău</p>
        </div>

        <div className="bg-[#16161d] border border-[#2a2a3d] rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#e2e2f0] mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#1c1c26] border border-[#2a2a3d] rounded-lg px-3 py-2.5 text-[#e2e2f0] text-sm placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent"
                placeholder="tu@exemplu.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#e2e2f0] mb-1.5">
                Parolă
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#1c1c26] border border-[#2a2a3d] rounded-lg px-3 py-2.5 text-[#e2e2f0] text-sm placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#6366f1] hover:bg-[#4f46e5] disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors"
            >
              {loading ? "Se autentifică..." : "Autentifică-te"}
            </button>
          </form>

          <p className="text-center text-sm text-[#6b7280] mt-4">
            Nu ai cont?{" "}
            <Link href="/signup" className="text-[#6366f1] hover:text-[#4f46e5] font-medium">
              Înregistrează-te
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
