import type { GooglePlaceResult, QualificationCriteria } from "@/types";

export function preliminaryFilter(
  place: GooglePlaceResult,
  criteria: QualificationCriteria
): boolean {
  // Returns true if place matches at least one criterion (worth analyzing)
  if (criteria.no_website && !place.website) return true;
  if (criteria.weak_website && !place.website) return true;
  if (
    criteria.low_reviews &&
    place.user_ratings_total !== undefined &&
    place.user_ratings_total < 20
  )
    return true;
  if (
    criteria.low_rating &&
    place.rating !== undefined &&
    place.rating < 4.0
  )
    return true;
  if (criteria.no_social_media) return true; // Can't detect from Maps, include anyway
  if (criteria.new_business) return true;
  if (criteria.incomplete_contact && !place.formatted_phone_number) return true;

  // If no criteria matched, still include (let AI decide)
  return true;
}
