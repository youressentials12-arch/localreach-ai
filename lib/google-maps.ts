import type { GooglePlaceResult } from "@/types";

const NOMINATIM = "https://nominatim.openstreetmap.org";
const UA = "LocalReach-AI/1.0 (contact@localreach.ai)";

// 3 mirror-uri Overpass — lansate în paralel, primul care răspunde câștigă
const OVERPASS_MIRRORS = [
  "https://overpass-api.de/api/interpreter",
  "https://lz4.overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

interface NominatimResult {
  lat: string;
  lon: string;
  boundingbox: [string, string, string, string];
  display_name: string;
}

interface OverpassElement {
  id: number;
  type: string;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

function getOSMTags(industry: string): string[] {
  const lower = industry.toLowerCase();

  if (lower.includes("restaurant") || lower.includes("restaur"))
    return ['["amenity"="restaurant"]', '["amenity"="fast_food"]', '["amenity"="cafe"]'];
  if (lower.includes("salon") || lower.includes("infrumusetare") || lower.includes("înfrumusețare") || lower.includes("beauty") || lower.includes("coafur"))
    return ['["shop"="hairdresser"]', '["shop"="beauty"]', '["shop"="cosmetics"]'];
  if (lower.includes("medical") || lower.includes("cabinet") || lower.includes("clinica") || lower.includes("clinică"))
    return ['["amenity"="doctors"]', '["amenity"="clinic"]', '["healthcare"="clinic"]'];
  if (lower.includes("stomatolog") || lower.includes("dentar") || lower.includes("dentist"))
    return ['["amenity"="dentist"]'];
  if (lower.includes("hotel") || lower.includes("pensiune") || lower.includes("cazare"))
    return ['["tourism"="hotel"]', '["tourism"="guest_house"]', '["tourism"="hostel"]'];
  if (lower.includes("fitness") || lower.includes("sala") || lower.includes("sală") || lower.includes("sport") || lower.includes("gym"))
    return ['["leisure"="fitness_centre"]', '["leisure"="sports_centre"]'];
  if (lower.includes("auto") || lower.includes("service") || lower.includes("masina") || lower.includes("mașin"))
    return ['["shop"="car_repair"]', '["amenity"="car_wash"]', '["shop"="car"]'];
  if (lower.includes("imobiliar") || lower.includes("agentie") || lower.includes("agenție"))
    return ['["office"="estate_agent"]'];
  if (lower.includes("magazin") || lower.includes("shop") || lower.includes("retail"))
    return ['["shop"~"."]'];
  if (lower.includes("constructii") || lower.includes("construcții"))
    return ['["craft"="construction"]', '["office"="construction"]'];
  if (lower.includes("farmacie") || lower.includes("pharmacy"))
    return ['["amenity"="pharmacy"]'];
  if (lower.includes("avocat") || lower.includes("notar") || lower.includes("juridic"))
    return ['["office"="lawyer"]', '["office"="notary"]'];
  if (lower.includes("contabil") || lower.includes("financiar"))
    return ['["office"="accountant"]'];

  return [`["name"~"${industry.split(" ")[0]}",i]`];
}

// Radius-based query (mult mai rapid decât bounding box pentru orașe mari)
function buildOverpassQuery(tags: string[], lat: number, lon: number, radiusM = 8000): string {
  const area = `(around:${radiusM},${lat},${lon})`;
  const nodeLines = tags.map((t) => `  node${t}${area};`).join("\n");
  const wayLines = tags.map((t) => `  way${t}${area};`).join("\n");
  // timeout:6 pe server = serverul renunță după 6s; clientul nostru așteaptă 8s
  return `[out:json][timeout:6];\n(\n${nodeLines}\n${wayLines}\n);\nout body center 25;`;
}

// Lansează toate mirror-urile în paralel — primul care răspunde câștigă (Promise.any)
async function fetchOverpass(query: string): Promise<{ elements: OverpassElement[] }> {
  const CLIENT_TIMEOUT_MS = 8000;
  const controllers = OVERPASS_MIRRORS.map(() => new AbortController());

  const attempts = OVERPASS_MIRRORS.map(async (mirror, i) => {
    const timer = setTimeout(() => controllers[i].abort(), CLIENT_TIMEOUT_MS);
    try {
      const res = await fetch(mirror, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": UA,
        },
        body: `data=${encodeURIComponent(query)}`,
        signal: controllers[i].signal,
      });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status} de la ${mirror}`);
      return (await res.json()) as { elements: OverpassElement[] };
    } catch (e) {
      clearTimeout(timer);
      throw e;
    }
  });

  try {
    const result = await Promise.any(attempts);
    // Anulează celelalte cereri rămase în zbor
    controllers.forEach((c) => c.abort());
    return result;
  } catch {
    throw new Error(
      "Serverele de căutare sunt momentan supraîncărcate. Încearcă din nou în câteva secunde."
    );
  }
}

function elementToPlace(el: OverpassElement): GooglePlaceResult | null {
  const tags = el.tags ?? {};
  const name = tags["name"];
  if (!name) return null;

  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;

  const addressParts = [
    tags["addr:street"] && tags["addr:housenumber"]
      ? `${tags["addr:street"]} ${tags["addr:housenumber"]}`
      : tags["addr:street"],
    tags["addr:city"],
    tags["addr:postcode"],
  ].filter(Boolean);

  const phone = tags["phone"] ?? tags["contact:phone"];
  const website = tags["website"] ?? tags["contact:website"] ?? tags["url"];
  const mapsUrl =
    lat && lon
      ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=18/${lat}/${lon}`
      : undefined;

  const typeTag =
    tags["amenity"] ??
    tags["shop"] ??
    tags["tourism"] ??
    tags["leisure"] ??
    tags["office"] ??
    tags["craft"] ??
    tags["healthcare"];

  return {
    place_id: `osm_${el.type}_${el.id}`,
    name,
    formatted_address: addressParts.length > 0 ? addressParts.join(", ") : undefined,
    formatted_phone_number: phone,
    website,
    rating: undefined,
    user_ratings_total: undefined,
    url: mapsUrl,
    types: typeTag ? [typeTag] : [],
  };
}

export async function searchPlaces(
  industry: string,
  location: string
): Promise<GooglePlaceResult[]> {
  // 1. Geocodare locație cu timeout de 5s
  const geoController = new AbortController();
  const geoTimer = setTimeout(() => geoController.abort(), 5000);

  let geoData: NominatimResult[];
  try {
    const geoUrl = `${NOMINATIM}/search?q=${encodeURIComponent(location)}&format=json&limit=1&addressdetails=0`;
    const geoRes = await fetch(geoUrl, {
      headers: { "User-Agent": UA, "Accept-Language": "ro" },
      signal: geoController.signal,
    });
    clearTimeout(geoTimer);
    if (!geoRes.ok) throw new Error(`status ${geoRes.status}`);
    geoData = (await geoRes.json()) as NominatimResult[];
  } catch {
    clearTimeout(geoTimer);
    throw new Error(
      `Nu am putut localiza "${location}". Verifică numele și încearcă din nou.`
    );
  }

  if (!geoData[0]) {
    throw new Error(
      `Locația "${location}" nu a fost găsită. Încearcă cu județul sau un oraș mai mare.`
    );
  }

  const lat = parseFloat(geoData[0].lat);
  const lon = parseFloat(geoData[0].lon);

  // 2. Căutare Overpass — radius 8km în jurul centrului orașului
  const tags = getOSMTags(industry);
  const query = buildOverpassQuery(tags, lat, lon);
  const overpassData = await fetchOverpass(query);
  const elements = overpassData.elements ?? [];

  const results: GooglePlaceResult[] = [];
  const seen = new Set<string>();

  for (const el of elements) {
    const place = elementToPlace(el);
    if (!place || seen.has(place.name)) continue;
    seen.add(place.name);
    results.push(place);
    if (results.length >= 20) break;
  }

  return results;
}

export async function getPlaceDetails(placeId: string): Promise<GooglePlaceResult> {
  return { place_id: placeId, name: "Necunoscut", types: [] };
}
