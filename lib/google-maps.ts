import type { GooglePlaceResult } from "@/types";

// OpenStreetMap Nominatim + Overpass API — gratuit, fără API key

const NOMINATIM = "https://nominatim.openstreetmap.org";
const OVERPASS = "https://overpass-api.de/api/interpreter";
const UA = "LocalReach-AI/1.0 (contact@localreach.ai)";

interface NominatimResult {
  boundingbox: [string, string, string, string]; // [south, north, west, east]
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

// Mapare industrie → taguri OSM
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

  // Fallback — caută după nume
  return [`["name"~"${industry.split(" ")[0]}",i]`];
}

function buildOverpassQuery(tags: string[], south: string, west: string, north: string, east: string): string {
  const bbox = `(${south},${west},${north},${east})`;
  const nodeLines = tags.map((t) => `  node${t}${bbox};`).join("\n");
  const wayLines = tags.map((t) => `  way${t}${bbox};`).join("\n");
  return `[out:json][timeout:30];\n(\n${nodeLines}\n${wayLines}\n);\nout body center 20;`;
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
  const mapsUrl = lat && lon
    ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=18/${lat}/${lon}`
    : undefined;

  const typeTag =
    tags["amenity"] ?? tags["shop"] ?? tags["tourism"] ??
    tags["leisure"] ?? tags["office"] ?? tags["craft"] ??
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
  // 1. Geocodare locație
  const geoUrl = `${NOMINATIM}/search?q=${encodeURIComponent(location)}&format=json&limit=1&addressdetails=0`;
  const geoRes = await fetch(geoUrl, {
    headers: { "User-Agent": UA, "Accept-Language": "ro" },
  });

  if (!geoRes.ok) throw new Error(`Geocodare eșuată: ${geoRes.status}`);
  const geoData = (await geoRes.json()) as NominatimResult[];

  if (!geoData[0]) {
    throw new Error(`Locația "${location}" nu a fost găsită pe hartă.`);
  }

  const [south, north, west, east] = geoData[0].boundingbox;

  // 2. Căutare Overpass
  const tags = getOSMTags(industry);
  const query = buildOverpassQuery(tags, south, west, north, east);

  const overpassRes = await fetch(OVERPASS, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": UA,
    },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!overpassRes.ok) throw new Error(`Overpass API error: ${overpassRes.status}`);

  const overpassData = await overpassRes.json() as { elements: OverpassElement[] };
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

// Place details nu mai e necesar — toate datele vin din Text Search
export async function getPlaceDetails(
  placeId: string
): Promise<GooglePlaceResult> {
  // Cu OSM, datele complete vin deja din searchPlaces
  // Această funcție returnează un placeholder dacă e apelată direct
  return {
    place_id: placeId,
    name: "Necunoscut",
    types: [],
  };
}
