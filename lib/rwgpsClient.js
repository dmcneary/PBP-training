const RWGPS_BASE_URL = process.env.RWGPS_BASE_URL || "https://ridewithgps.com";
const DEFAULT_PAGE_SIZE = Number(process.env.RWGPS_PAGE_SIZE || 50);
const MAX_PAGE_SIZE = 100;

const toTrimmedString = (value) => {
  if (typeof value !== "string") return "";
  return value.trim();
};

const pickCredential = (overrideValue, envValue) => {
  const override = toTrimmedString(overrideValue);
  if (override) return override;
  return toTrimmedString(envValue);
};

const buildAuthHeaders = ({ apiKey, authToken }) => ({
  "x-rwgps-api-key": apiKey,
  "x-rwgps-auth-token": authToken,
  Accept: "application/json",
  "User-Agent": "PBPPlanner/1.0 (RWGPS import)"
});

const fetchJson = async (url, options) => {
  const response = await fetch(url, options);
  const bodyText = await response.text();
  let payload = null;

  if (bodyText) {
    try {
      payload = JSON.parse(bodyText);
    } catch (error) {
      payload = null;
    }
  }

  if (!response.ok) {
    const error = new Error("Ride with GPS request failed");
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload || {};
};

const getCurrentUser = async ({ apiKey, authToken }) => {
  const headers = buildAuthHeaders({ apiKey, authToken });
  const url = new URL("/api/v1/users/current.json", RWGPS_BASE_URL).toString();
  const payload = await fetchJson(url, { headers });
  return payload.user || payload;
};

const normalizeTripsPayload = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload.trips)) return payload.trips;
  if (Array.isArray(payload.results)) return payload.results;
  return [];
};

const extractNextPageUrl = (payload) => {
  const next =
    payload?.meta?.pagination?.next_page_url ||
    payload?.pagination?.next_page_url ||
    payload?.meta?.next_page_url ||
    payload?.next_page_url ||
    null;
  if (!next) return null;
  try {
    return new URL(next, RWGPS_BASE_URL).toString();
  } catch (error) {
    return null;
  }
};

const listTrips = async ({ apiKey, authToken, userId, limit = DEFAULT_PAGE_SIZE }) => {
  const headers = buildAuthHeaders({ apiKey, authToken });
  const pageSize = Math.max(1, Math.min(Number(limit) || DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE));

  let nextUrl = new URL(`/api/v1/users/${encodeURIComponent(userId)}/trips.json`, RWGPS_BASE_URL);
  nextUrl.searchParams.set("page", "1");
  nextUrl.searchParams.set("page_size", String(pageSize));

  const trips = [];
  while (nextUrl && trips.length < pageSize) {
    const payload = await fetchJson(nextUrl.toString(), { headers });
    const pageTrips = normalizeTripsPayload(payload);
    pageTrips.forEach((trip) => {
      if (trips.length < pageSize) {
        trips.push(trip);
      }
    });
    const next = extractNextPageUrl(payload);
    nextUrl = next ? new URL(next) : null;
    if (!next) break;
  }

  return trips;
};

module.exports = {
  RWGPS_BASE_URL,
  pickCredential,
  getCurrentUser,
  listTrips
};
