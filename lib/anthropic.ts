import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AIAnalysisResult, GeneratedHooks, QualificationCriteria } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

const jsonModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.7,
  },
});

const CRITERIA_LABELS: Record<string, string> = {
  no_website: "Nu are website",
  weak_website: "Website slab / neoptimizat",
  low_reviews: "Sub 20 recenzii Google",
  low_rating: "Rating Google sub 4.0",
  no_review_responses: "Nu răspunde la recenzii",
  no_social_media: "Fără prezență activă pe social media",
  new_business: "Afacere deschisă de mai puțin de 2 ani",
  incomplete_contact: "Informații de contact incomplete",
};

function extractJSON(text: string): string {
  const cleaned = text.trim();
  // Strip markdown fences if present
  const fenceStripped = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  // Extract from first { to last }
  const start = fenceStripped.indexOf("{");
  const end = fenceStripped.lastIndexOf("}");
  if (start !== -1 && end !== -1) {
    return fenceStripped.slice(start, end + 1);
  }
  return fenceStripped;
}

export async function analyzeBusinessOpportunity(
  businessName: string,
  category: string,
  website: string | undefined,
  rating: number | undefined,
  reviewsCount: number | undefined,
  address: string | undefined,
  serviceOffered: string,
  criteria: QualificationCriteria
): Promise<AIAnalysisResult> {
  const criteriaList = Object.entries(criteria)
    .filter(([, v]) => v)
    .map(([k]) => `- ${CRITERIA_LABELS[k] ?? k}`)
    .join("\n");

  const prompt = `Ești un expert în calificarea oportunităților de business development.

Analizează această afacere locală și determină cât de bună este oportunitatea pentru cineva care oferă: "${serviceOffered}".

DATE AFACERE:
- Nume: ${businessName}
- Categorie: ${category || "Necunoscut"}
- Website: ${website || "Nu are website"}
- Rating Google: ${rating ?? "N/A"}/5 (${reviewsCount ?? 0} recenzii)
- Locație: ${address || "Necunoscut"}

CRITERII DE CALIFICARE:
${criteriaList || "Niciun criteriu specific"}

Returnează un JSON cu exact această structură:
{
  "opportunity_score": <număr întreg 0-100>,
  "pain_points": ["pain point 1", "pain point 2", "pain point 3"],
  "analysis_summary": "rezumat 2-3 propoziții în română despre de ce această afacere are nevoie de serviciu"
}`;

  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const result = await jsonModel.generateContent(prompt);
      const text = result.response.text();
      return JSON.parse(extractJSON(text)) as AIAnalysisResult;
    } catch (err) {
      lastError = err as Error;
      if (attempt === 0) await new Promise((r) => setTimeout(r, 1500));
    }
  }
  throw lastError;
}

export async function generateHooks(
  businessName: string,
  category: string,
  address: string | undefined,
  rating: number | undefined,
  reviewsCount: number | undefined,
  website: string | undefined,
  painPoints: string[],
  serviceOffered: string,
  channels: string[],
  tone: string
): Promise<GeneratedHooks> {
  const toneDescriptions: Record<string, string> = {
    direct: "direct și la obiect",
    empathetic: "empatic și înțelegător",
    curious: "curios și intrigant",
    provocative: "provocator și îndrăzneț",
    professional: "profesional și formal",
  };

  const channelInstructions = channels
    .map((ch) => {
      if (ch === "email")
        return `"email": { "subject": "<max 9 cuvinte, personalizat pentru ${businessName}>", "content": "<3-4 propoziții de deschidere care menționează un detaliu specific despre afacere, NU începe cu Bună ziua/Mă numesc>" }`;
      if (ch === "phone")
        return `"phone": { "content": "<script 30 secunde: salut scurt, referință la ceva specific despre afacere, propunere de valoare în 1 propoziție, întrebare deschisă>" }`;
      if (ch === "instagram")
        return `"instagram": { "content": "<max 3 propoziții, ton conversațional, menționează că ai văzut ceva specific, CTA clar>" }`;
      if (ch === "facebook")
        return `"facebook": { "content": "<max 3 propoziții, ton conversațional, menționează că ai văzut ceva specific, CTA clar>" }`;
      if (ch === "linkedin")
        return `"linkedin": { "content": "<max 100 cuvinte, ton profesional dar cald, referință la activitatea de business>" }`;
      return "";
    })
    .filter(Boolean)
    .join(",\n  ");

  const prompt = `Ești un expert în cold outreach pentru piața românească. Scrii mesaje care sună uman și specific.

CONTEXT:
- Afacere: ${businessName}
- Categorie: ${category || "Necunoscut"}
- Locație: ${address || "Necunoscut"}
- Rating: ${rating ?? "N/A"}/5 (${reviewsCount ?? 0} recenzii)
- Website: ${website || "Nu are website"}
- Pain points: ${painPoints.join(", ") || "necunoscute"}
- Serviciu oferit: ${serviceOffered}
- Ton: ${toneDescriptions[tone] ?? tone}

Generează hook-uri de outreach personalizate DOAR pentru canalele cerute: ${channels.join(", ")}.

Returnează JSON cu exact această structură (doar canalele cerute):
{
  ${channelInstructions}
}`;

  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const result = await jsonModel.generateContent(prompt);
      const text = result.response.text();
      return JSON.parse(extractJSON(text)) as GeneratedHooks;
    } catch (err) {
      lastError = err as Error;
      if (attempt === 0) await new Promise((r) => setTimeout(r, 1500));
    }
  }
  throw lastError;
}
