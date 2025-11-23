// api.js

// Base URL for backend API
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// -------------------------------
// Generate Itinerary
// -------------------------------
export async function generateItinerary(tripRequest) {
  const response = await fetch(`${API_URL}/api/v1/itinerary/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tripRequest),
  });

  if (!response.ok) {
    throw new Error(`generateItinerary failed (${response.status})`);
  }

  return response.json();
}

// -------------------------------
// Refine Itinerary
// -------------------------------
export async function refineItinerary(tripId, refineRequest) {
  const response = await fetch(`${API_URL}/api/v1/itinerary/${tripId}/refine`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(refineRequest),
  });

  if (!response.ok) {
    throw new Error(`refineItinerary failed (${response.status})`);
  }

  return response.json();
}

// -------------------------------
// Get Itinerary By ID
// -------------------------------
export async function getItinerary(tripId) {
  const response = await fetch(`${API_URL}/api/v1/itinerary/${tripId}`);

  if (!response.ok) {
    throw new Error(`getItinerary failed (${response.status})`);
  }

  return response.json();
}

// -------------------------------
// Get Recommendations
// -------------------------------
export async function getRecommendations(destination, category, limit = 10) {
  const url = new URL(`${API_URL}/api/v1/recommendations`);
  if (destination) url.searchParams.append("destination", destination);
  if (category) url.searchParams.append("category", category);
  url.searchParams.append("limit", limit);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`getRecommendations failed (${response.status})`);
  }

  return response.json();
}

// -------------------------------
// Map User Selections → Backend Format
// -------------------------------
export function mapSelectionsToPreferences(selections) {
  return {
    liked_tags: selections?.liked_tags || {},
    disliked_tags: selections?.disliked_tags || {},
    budget_level: selections?.budget_level ?? 2,
    pace: selections?.pace || "moderate",
    mobility_limited: selections?.mobility_limited || false,
    dietary_restrictions: selections?.dietary_restrictions || [],
  };
}

// -------------------------------
// Build request body for backend
// -------------------------------
export function createTripRequest(formData) {
  // Try multiple possible field names for dates (camelCase vs snake_case)
  const startDate =
    formData.start_date ??
    formData.startDate ??
    formData.checkInDate;

  const endDate =
    formData.end_date ??
    formData.endDate ??
    formData.checkOutDate;

  // Optional: log if dates are missing so it's easier to debug
  if (!startDate || !endDate) {
    console.warn("createTripRequest: missing start/end date in formData", formData);
  }

  return {
    destination: formData.destination,
    // Backend expects these exact snake_case keys:
    start_date: startDate,    // "YYYY-MM-DD"
    end_date: endDate,        // "YYYY-MM-DD"
    daily_start_hour: formData.start_hour ?? 9,
    daily_end_hour: formData.end_hour ?? 22,
    preferences: mapSelectionsToPreferences(
      formData.preferences || formData.selections || {}
    ),
  };
}