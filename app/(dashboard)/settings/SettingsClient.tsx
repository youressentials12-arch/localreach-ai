"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Check, Loader2, Sparkles, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import UpgradeButton from "@/components/shared/UpgradeButton";

interface Props {
  email:               string;
  plan:                "starter" | "pro" | "agency";
  hasSubscription:     boolean;
  showUpgradeSuccess:  boolean;
}

const PLAN_LABELS: Record<string, string> = {
  starter: "Starter",
  pro:     "Pro",
  agency:  "Agency",
};

const PLAN_FEATURES: Record<string, string[]> = {
  pro: [
    "Follow-up automat până la 7 pași",
    "Analytics avansat (cost, heatmap, hook-uri)",
    "Tracking deschideri și click-uri",
    "Până la 5.000 prospecți / lună",
    "Suport email prioritar",
  ],
  agency: [
    "Totul din Pro",
    "Clienți multipli (multi-workspace)",
    "Acces API complet",
    "Rapoarte white-label",
    "Suport dedicat + onboarding",
  ],
};

function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);

  async function openPortal() {
    setLoading(true);
    try {
      const res  = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else toast.error(data.error ?? "Nu s-a putut deschide portalul.");
    } catch {
      toast.error("Eroare de rețea. Încearcă din nou.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={openPortal}
      disabled={loading}
      className="flex items-center gap-2 text-sm text-[#6b7280] hover:text-[#e2e2f0] border border-[#2a2a3d] hover:border-[#6366f1]/40 px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <ExternalLink size={14} />}
      Gestionează abonamentul
    </button>
  );
}

export default function SettingsClient({ email, plan, hasSubscription, showUpgradeSuccess }: Props) {
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving]           = useState(false);
  const [message, setMessage]         = useState("");

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 6) { setMessage("Parola trebuie să aibă cel puțin 6 caractere"); return; }
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSaving(false);
    if (error) setMessage(error.message);
    else { setMessage("Parola a fost actualizată cu succes!"); setNewPassword(""); }
  }

  const isStarter = plan === "starter";

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-[#e2e2f0]">Setări</h1>
        <p className="text-[#6b7280] text-sm mt-0.5">Gestionează contul și preferințele tale</p>
      </div>

      {/* ── Plan & Facturare ── */}
      <div className="bg-[#16161d] border border-[#2a2a3d] rounded-xl p-6 space-y-5">
        <h2 className="text-sm font-semibold text-[#e2e2f0]">Plan &amp; Facturare</h2>

        {showUpgradeSuccess && (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-3 text-sm text-emerald-400">
            <Check size={15} />
            Upgrade reușit! Planul tău a fost actualizat la <strong>{PLAN_LABELS[plan]}</strong>.
          </div>
        )}

        {/* Current plan badge */}
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              isStarter
                ? "bg-[#2a2a3d] text-[#6b7280]"
                : "bg-[#6366f1]/20 text-[#6366f1] border border-[#6366f1]/30"
            }`}
          >
            {PLAN_LABELS[plan]}
          </span>
          <span className="text-sm text-[#6b7280]">plan activ</span>
        </div>

        {/* Manage active subscription */}
        {!isStarter && hasSubscription && (
          <div className="space-y-3">
            <p className="text-sm text-[#6b7280]">
              Modifică, anulează sau actualizează metoda de plată direct din portalul Stripe.
            </p>
            <ManageSubscriptionButton />
          </div>
        )}

        {/* Upgrade options for Starter */}
        {isStarter && (
          <div className="space-y-3 pt-1">
            <p className="text-sm text-[#6b7280]">Alege un plan pentru a debloca funcționalitățile avansate.</p>

            {/* Pro card */}
            <div className="border border-[#2a2a3d] hover:border-[#6366f1]/40 rounded-xl p-5 transition-colors space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-[#e2e2f0]">Pro</span>
                    <span className="text-xs bg-[#6366f1]/15 text-[#6366f1] px-2 py-0.5 rounded-full font-medium">Popular</span>
                  </div>
                  <p className="text-2xl font-bold text-[#e2e2f0]">€69<span className="text-sm font-normal text-[#6b7280]">/lună</span></p>
                </div>
                <UpgradeButton plan="pro">
                  <Sparkles size={14} />
                  Upgrade la Pro
                </UpgradeButton>
              </div>
              <ul className="space-y-1.5">
                {PLAN_FEATURES.pro.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-[#9ca3af]">
                    <Check size={13} className="text-[#6366f1] shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Agency card */}
            <div className="border border-[#2a2a3d] hover:border-[#8b5cf6]/40 rounded-xl p-5 transition-colors space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-[#e2e2f0] mb-1">Agency</p>
                  <p className="text-2xl font-bold text-[#e2e2f0]">€149<span className="text-sm font-normal text-[#6b7280]">/lună</span></p>
                </div>
                <UpgradeButton
                  plan="agency"
                  className="bg-[#8b5cf6] hover:bg-[#7c3aed] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
                >
                  <Sparkles size={14} />
                  Upgrade la Agency
                </UpgradeButton>
              </div>
              <ul className="space-y-1.5">
                {PLAN_FEATURES.agency.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-[#9ca3af]">
                    <Check size={13} className="text-[#8b5cf6] shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* ── Cont ── */}
      <div className="bg-[#16161d] border border-[#2a2a3d] rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-[#e2e2f0]">Cont</h2>

        <div>
          <label className="block text-xs text-[#6b7280] font-medium mb-1">Email</label>
          <div className="bg-[#1c1c26] border border-[#2a2a3d] rounded-lg px-3 py-2.5 text-sm text-[#6b7280]">
            {email}
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-3">
          <div>
            <label className="block text-xs text-[#6b7280] font-medium mb-1">Parolă nouă</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full bg-[#1c1c26] border border-[#2a2a3d] rounded-lg px-3 py-2.5 text-[#e2e2f0] text-sm placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent"
              placeholder="Noua parolă..."
            />
          </div>

          {message && (
            <p className={`text-sm ${message.includes("succes") ? "text-green-400" : "text-red-400"}`}>
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

      {/* ── API Keys ── */}
      <div className="bg-[#16161d] border border-[#2a2a3d] rounded-xl p-6 space-y-3">
        <h2 className="text-sm font-semibold text-[#e2e2f0]">API Keys</h2>
        <p className="text-sm text-[#6b7280]">
          Configurează API keys-urile în fișierul{" "}
          <code className="bg-[#1c1c26] px-1.5 py-0.5 rounded text-[#6366f1] text-xs font-mono">.env.local</code>{" "}
          din rădăcina proiectului.
        </p>
        <div className="space-y-2">
          {[
            { key: "ANTHROPIC_API_KEY",  label: "Anthropic (Claude AI)" },
            { key: "GOOGLE_MAPS_API_KEY", label: "Google Maps Places API" },
            { key: "STRIPE_SECRET_KEY",  label: "Stripe (Plăți)" },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between bg-[#1c1c26] rounded-lg px-3 py-2">
              <div>
                <p className="text-xs font-medium text-[#e2e2f0]">{label}</p>
                <p className="text-xs text-[#6b7280] font-mono">{key}</p>
              </div>
              <span className="text-xs text-[#6b7280] bg-[#2a2a3d] px-2 py-0.5 rounded">.env.local</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
