"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SettingsClient({ email }: { email: string }) {
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 6) {
      setMessage("Parola trebuie să aibă cel puțin 6 caractere");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSaving(false);
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Parola a fost actualizată cu succes!");
      setNewPassword("");
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-[#e2e2f0]">Setări</h1>
        <p className="text-[#6b7280] text-sm mt-0.5">
          Gestionează contul și preferințele tale
        </p>
      </div>

      {/* Account info */}
      <div className="bg-[#16161d] border border-[#2a2a3d] rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-[#e2e2f0]">Cont</h2>

        <div>
          <label className="block text-xs text-[#6b7280] font-medium mb-1">
            Email
          </label>
          <div className="bg-[#1c1c26] border border-[#2a2a3d] rounded-lg px-3 py-2.5 text-sm text-[#6b7280]">
            {email}
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-3">
          <div>
            <label className="block text-xs text-[#6b7280] font-medium mb-1">
              Parolă nouă
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-[#1c1c26] border border-[#2a2a3d] rounded-lg px-3 py-2.5 text-[#e2e2f0] text-sm placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent"
              placeholder="Noua parolă..."
            />
          </div>

          {message && (
            <p
              className={`text-sm ${
                message.includes("succes") ? "text-green-400" : "text-red-400"
              }`}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="bg-[#6366f1] hover:bg-[#4f46e5] disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {saving ? "Se salvează..." : "Schimbă parola"}
          </button>
        </form>
      </div>

      {/* API Keys info */}
      <div className="bg-[#16161d] border border-[#2a2a3d] rounded-xl p-6 space-y-3">
        <h2 className="text-sm font-semibold text-[#e2e2f0]">API Keys</h2>
        <p className="text-sm text-[#6b7280]">
          Configurează API keys-urile în fișierul{" "}
          <code className="bg-[#1c1c26] px-1.5 py-0.5 rounded text-[#6366f1] text-xs font-mono">
            .env.local
          </code>{" "}
          din rădăcina proiectului.
        </p>
        <div className="space-y-2">
          {[
            { key: "ANTHROPIC_API_KEY", label: "Anthropic (Claude AI)" },
            { key: "GOOGLE_MAPS_API_KEY", label: "Google Maps Places API" },
            { key: "STRIPE_SECRET_KEY", label: "Stripe (Plăți)" },
          ].map(({ key, label }) => (
            <div
              key={key}
              className="flex items-center justify-between bg-[#1c1c26] rounded-lg px-3 py-2"
            >
              <div>
                <p className="text-xs font-medium text-[#e2e2f0]">{label}</p>
                <p className="text-xs text-[#6b7280] font-mono">{key}</p>
              </div>
              <span className="text-xs text-[#6b7280] bg-[#2a2a3d] px-2 py-0.5 rounded">
                .env.local
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
