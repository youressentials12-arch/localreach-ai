"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";
import type { QualificationCriteria } from "@/types";

const INDUSTRIES = [
  "Restaurante",
  "Saloane înfrumusețare",
  "Cabinete medicale",
  "Magazine fizice",
  "Servicii auto",
  "Firme construcții",
  "Hoteluri / Pensiuni",
  "Cabinete stomatologice",
  "Fitness / Sală sport",
  "Agenții imobiliare",
  "Altele",
];

const CRITERIA_OPTIONS: { key: keyof QualificationCriteria; label: string }[] = [
  { key: "no_website", label: "Nu are website" },
  { key: "weak_website", label: "Website slab / neoptimizat" },
  { key: "low_reviews", label: "Sub 20 recenzii Google" },
  { key: "low_rating", label: "Rating Google sub 4.0" },
  { key: "no_review_responses", label: "Nu răspunde la recenzii Google" },
  { key: "no_social_media", label: "Fără prezență activă pe social media" },
  { key: "new_business", label: "Afacere deschisă de mai puțin de 2 ani" },
  {
    key: "incomplete_contact",
    label: "Informații de contact incomplete pe Google Maps",
  },
];

export default function CampaignWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [serviceOffered, setServiceOffered] = useState("");
  const [description, setDescription] = useState("");
  const [targetIndustry, setTargetIndustry] = useState("");
  const [customIndustry, setCustomIndustry] = useState("");
  const [targetLocation, setTargetLocation] = useState("");
  const [criteria, setCriteria] = useState<QualificationCriteria>({});

  const toggleCriterion = (key: keyof QualificationCriteria) => {
    setCriteria((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  async function handleSubmit() {
    setLoading(true);
    setError("");

    const industry =
      targetIndustry === "Altele" ? customIndustry : targetIndustry;

    const res = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name || `${industry} · ${targetLocation}`,
        description,
        service_offered: serviceOffered,
        target_industry: industry,
        target_location: targetLocation,
        qualification_criteria: criteria,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Eroare la salvare");
      setLoading(false);
      return;
    }

    router.push(`/campaigns/${data.campaign.id}`);
  }

  const steps = ["Serviciul tău", "Ținta", "Criterii"];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((label, i) => {
          const stepNum = i + 1;
          const done = step > stepNum;
          const active = step === stepNum;
          return (
            <div key={stepNum} className="flex items-center gap-2 flex-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                  done
                    ? "bg-green-500 text-white"
                    : active
                    ? "bg-[#6366f1] text-white"
                    : "bg-[#2a2a3d] text-[#6b7280]"
                }`}
              >
                {done ? <Check size={12} /> : stepNum}
              </div>
              <span
                className={`text-sm ${
                  active ? "text-[#e2e2f0] font-medium" : "text-[#6b7280]"
                }`}
              >
                {label}
              </span>
              {i < steps.length - 1 && (
                <div className="flex-1 h-px bg-[#2a2a3d]" />
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-[#16161d] border border-[#2a2a3d] rounded-xl p-6">
        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[#e2e2f0]">Serviciul tău</h2>
            <p className="text-sm text-[#6b7280]">
              Spune-ne ce oferi — AI-ul va găsi afacerile care au nevoie exact de asta.
            </p>

            <div>
              <label className="block text-sm font-medium text-[#e2e2f0] mb-1.5">
                Nume campanie (opțional)
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#1c1c26] border border-[#2a2a3d] rounded-lg px-3 py-2.5 text-[#e2e2f0] text-sm placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent"
                placeholder="ex: Web Design Restaurante Cluj"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#e2e2f0] mb-1.5">
                Ce serviciu / oportunitate oferi? *
              </label>
              <input
                value={serviceOffered}
                onChange={(e) => setServiceOffered(e.target.value)}
                required
                className="w-full bg-[#1c1c26] border border-[#2a2a3d] rounded-lg px-3 py-2.5 text-[#e2e2f0] text-sm placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent"
                placeholder="ex: Web design, Management Social Media, SEO, Meta Ads..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#e2e2f0] mb-1.5">
                Descrie pe scurt ce aduce serviciul tău afacerii
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-[#1c1c26] border border-[#2a2a3d] rounded-lg px-3 py-2.5 text-[#e2e2f0] text-sm placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent resize-none"
                placeholder="ex: Creez site-uri profesionale care atrag clienți noi și cresc vânzările online..."
              />
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[#e2e2f0]">Ținta ta</h2>
            <p className="text-sm text-[#6b7280]">
              Ce tip de afaceri cauți și unde?
            </p>

            <div>
              <label className="block text-sm font-medium text-[#e2e2f0] mb-1.5">
                Industria țintă *
              </label>
              <select
                value={targetIndustry}
                onChange={(e) => setTargetIndustry(e.target.value)}
                className="w-full bg-[#1c1c26] border border-[#2a2a3d] rounded-lg px-3 py-2.5 text-[#e2e2f0] text-sm focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent"
              >
                <option value="">Selectează industria...</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>

            {targetIndustry === "Altele" && (
              <div>
                <label className="block text-sm font-medium text-[#e2e2f0] mb-1.5">
                  Specifică industria
                </label>
                <input
                  value={customIndustry}
                  onChange={(e) => setCustomIndustry(e.target.value)}
                  className="w-full bg-[#1c1c26] border border-[#2a2a3d] rounded-lg px-3 py-2.5 text-[#e2e2f0] text-sm placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent"
                  placeholder="ex: Librării, Florării, Optici..."
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#e2e2f0] mb-1.5">
                Locația *
              </label>
              <input
                value={targetLocation}
                onChange={(e) => setTargetLocation(e.target.value)}
                className="w-full bg-[#1c1c26] border border-[#2a2a3d] rounded-lg px-3 py-2.5 text-[#e2e2f0] text-sm placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent"
                placeholder="ex: Cluj-Napoca, București sector 2, Timișoara..."
              />
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[#e2e2f0]">
              Criterii de calificare
            </h2>
            <p className="text-sm text-[#6b7280]">
              Selectează ce caracteristici trebuie să aibă afacerile pentru a fi
              oportunități bune. (Selectează cel puțin una)
            </p>

            <div className="space-y-2">
              {CRITERIA_OPTIONS.map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#1c1c26] hover:bg-[#2a2a3d] cursor-pointer transition-colors"
                >
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                      criteria[key]
                        ? "bg-[#6366f1] border-[#6366f1]"
                        : "border-[#2a2a3d]"
                    }`}
                    onClick={() => toggleCriterion(key)}
                  >
                    {criteria[key] && <Check size={12} className="text-white" />}
                  </div>
                  <span className="text-sm text-[#e2e2f0]">{label}</span>
                  <input
                    type="checkbox"
                    checked={!!criteria[key]}
                    onChange={() => toggleCriterion(key)}
                    className="sr-only"
                  />
                </label>
              ))}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-sm text-red-400">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#2a2a3d]">
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 1}
            className="flex items-center gap-1.5 text-sm text-[#6b7280] hover:text-[#e2e2f0] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} />
            Înapoi
          </button>

          {step < 3 ? (
            <button
              onClick={() => {
                if (step === 1 && !serviceOffered.trim()) return;
                if (
                  step === 2 &&
                  (!targetIndustry ||
                    !targetLocation.trim() ||
                    (targetIndustry === "Altele" && !customIndustry.trim()))
                )
                  return;
                setStep((s) => s + 1);
              }}
              className="flex items-center gap-1.5 bg-[#6366f1] hover:bg-[#4f46e5] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Continuă
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-1.5 bg-[#6366f1] hover:bg-[#4f46e5] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {loading ? "Se salvează..." : "Creează campania"}
              {!loading && <Check size={16} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
