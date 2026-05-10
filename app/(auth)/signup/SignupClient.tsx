"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import PrelaunchConfirmation from "./PrelaunchConfirmation";

interface Props {
  isPrelaunch: boolean;
}

export default function SignupClient({ isPrelaunch }: Props) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password.length < 6) {
      setError("Parola trebuie să aibă cel puțin 6 caractere");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: isPrelaunch ? { ref: "prelaunch" } : undefined,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success && isPrelaunch) {
    return <PrelaunchConfirmation email={email} />;
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f13]">
        <div className="w-full max-w-md px-4 text-center">
          <div className="bg-[#16161d] border border-[#2a2a3d] rounded-xl p-8">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-green-400 text-2xl">✓</span>
            </div>
            <h2 className="text-xl font-bold text-[#e2e2f0] mb-2">Verifică emailul</h2>
            <p className="text-[#6b7280] text-sm">
              Am trimis un link de confirmare la{" "}
              <strong className="text-[#e2e2f0]">{email}</strong>.
              Verifică inbox-ul și confirmă contul.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-block text-[#6366f1] hover:text-[#4f46e5] text-sm font-medium"
            >
              Înapoi la autentificare
            </Link>
          </div>
        </div>
      </div>
    );
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
          {isPrelaunch ? (
            <>
              <h1 className="text-2xl font-bold text-[#e2e2f0]">Înregistrează-te pentru lansare</h1>
              <p className="text-[#6b7280] mt-1 text-sm">Primești 30% reducere la Pro prima lună</p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-[#e2e2f0]">Creează cont gratuit</h1>
              <p className="text-[#6b7280] mt-1 text-sm">Începe să găsești clienți locali cu AI</p>
            </>
          )}
        </div>

        {isPrelaunch && (
          <div className="mb-4 flex items-center gap-2 bg-[#6366f1]/10 border border-[#6366f1]/25 rounded-xl px-4 py-3 text-sm text-[#9ca3af]">
            <span className="text-[#a3e635] font-bold text-base">✦</span>
            <span>
              Cod de reducere <strong className="text-white">PRELAUNCH30</strong> — 30% off Pro la lansare
            </span>
          </div>
        )}

        <div className="bg-[#16161d] border border-[#2a2a3d] rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#e2e2f0] mb-1.5">Email</label>
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
              <label className="block text-sm font-medium text-[#e2e2f0] mb-1.5">Parolă</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#1c1c26] border border-[#2a2a3d] rounded-lg px-3 py-2.5 text-[#e2e2f0] text-sm placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent"
                placeholder="Minim 6 caractere"
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
              {loading
                ? "Se creează contul..."
                : isPrelaunch
                ? "Înregistrează-te pentru lansare"
                : "Creează cont gratuit"}
            </button>
          </form>

          <p className="text-center text-sm text-[#6b7280] mt-4">
            Ai deja cont?{" "}
            <Link href="/login" className="text-[#6366f1] hover:text-[#4f46e5] font-medium">
              Autentifică-te
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
