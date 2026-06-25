const Activity = require("../models/activities");
const {
  pickCredential,
  getCurrentUser,
  listTrips
} = require("../lib/rwgpsClient");

const RWGPS_SOURCE = "rwgps";

const toNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const pickFirstNumber = (...values) => {
  for (const value of values) {
    const next = toNumber(value);
    if (next !== null) return next;
  }
  return null;
};

const parseDate = (...values) => {
  for (const value of values) {
    if (!value) continue;
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
};

const toDurationParts = (trip) => {
  const totalSeconds = Math.max(
    0,
    Math.round(
      pickFirstNumber(
        trip.moving_time,
        trip.movingTime,
        trip.elapsed_time,
        trip.duration,
        trip.time
      ) || 0
    )
  );
  return {
    totalSeconds,
    durationMins: Math.floor(totalSeconds / 60),
    durationSecs: totalSeconds % 60
  };
};

const toDistanceMiles = (trip) => {
  const miles = pickFirstNumber(
    trip.distance_miles,
    trip.distance_mi,
    trip.distanceMiles
  );
  if (miles !== null) return miles;

  const km = pickFirstNumber(
    trip.distance_km,
    trip.distance_kilometers,
    trip.distanceKm
  );
  if (km !== null) return km * 0.621371;

  const meters = pickFirstNumber(
    trip.distance_meters,
    trip.distance_meter,
    trip.distance_m,
    trip.meters
  );
  if (meters !== null) return meters / 1609.344;

  const fallback = toNumber(trip.distance);
  if (fallback === null) return 0;
  if (fallback > 500) return fallback / 1609.344;
  return fallback;
};

const toSportType = (trip) => {
  const raw = String(trip.activity_type || trip.sport || "").toLowerCase();
  if (!raw) return "cycling";
  if (raw.includes("run")) return "running";
  if (raw.includes("swim")) return "swimming";
  if (raw.includes("hike")) return "hiking";
  if (raw.includes("row")) return "rowing";
  return "cycling";
};

const normalizeTrip = (trip) => {
  const sourceId = toNumber(trip.id) !== null ? String(trip.id) : null;
  if (!sourceId) return null;

  const date = parseDate(trip.departed_at, trip.started_at, trip.created_at);
  const { totalSeconds, durationMins, durationSecs } = toDurationParts(trip);
  const distanceMiles = Number(toDistanceMiles(trip).toFixed(2));
  const title = String(trip.name || "").trim() || `RWGPS Ride ${date.toLocaleDateString()}`;
  const description = String(trip.description || "").trim() || "Imported from Ride with GPS.";
  const externalUrl = trip.url || `https://ridewithgps.com/trips/${sourceId}`;

  return {
    sourceId,
    activity: {
      actTitle: title,
      actDesc: description,
      actDate: date.toISOString(),
      distance: Math.max(0, distanceMiles),
      durationMins,
      durationSecs,
      sportType: toSportType(trip),
      source: RWGPS_SOURCE,
      externalUrl,
      movingTimeSecs: totalSeconds,
      avgHeartRate: pickFirstNumber(trip.avg_hr, trip.avg_heart_rate, trip.average_heartrate),
      avgPower: pickFirstNumber(trip.avg_power, trip.average_power),
      elevationGainFeet: pickFirstNumber(
        trip.elevation_gain_ft,
        trip.elevationGainFt,
        trip.elevation_gain_feet
      )
    }
  };
};

const importTrips = async (req, res) => {
  const allowServerCredentials = process.env.RWGPS_ALLOW_SERVER_CREDENTIAL_IMPORTS === "true";
  const apiKey = pickCredential(req.body?.apiKey, allowServerCredentials ? process.env.RWGPS_API_KEY : "");
  const authToken = pickCredential(req.body?.authToken, allowServerCredentials ? process.env.RWGPS_AUTH_TOKEN : "");
  const limit = Math.max(1, Math.min(Number(req.body?.limit) || 20, 100));

  if (!apiKey || !authToken) {
    return res.status(400).json({
      error: "RWGPS credentials are required. Provide apiKey and authToken for this import."
    });
  }

  try {
    const rwgpsUser = await getCurrentUser({ apiKey, authToken });
    const rwgpsUserId = rwgpsUser?.id;

    if (!rwgpsUserId) {
      return res.status(502).json({ error: "Unable to resolve Ride with GPS user profile." });
    }

    const trips = await listTrips({
      apiKey,
      authToken,
      userId: rwgpsUserId,
      limit
    });

    const imported = [];
    const skipped = [];

    for (const trip of trips) {
      const normalized = normalizeTrip(trip);
      if (!normalized) {
        continue;
      }

      const exists = await Activity.findOne({
        userId: req.user.username,
        source: RWGPS_SOURCE,
        sourceId: normalized.sourceId
      }).select("_id");

      if (exists) {
        skipped.push({
          sourceId: normalized.sourceId,
          title: normalized.activity.actTitle,
          reason: "duplicate"
        });
        continue;
      }

      const created = await Activity.create({
        ...normalized.activity,
        userId: req.user.username,
        sourceId: normalized.sourceId
      });

      imported.push({
        id: created._id,
        sourceId: normalized.sourceId,
        actTitle: created.actTitle,
        actDate: created.actDate,
        distance: created.distance
      });
    }

    return res.json({
      source: "Ride with GPS",
      fetched: trips.length,
      importedCount: imported.length,
      skippedCount: skipped.length,
      imported,
      skipped
    });
  } catch (error) {
    const status = error.status === 401 || error.status === 403 ? 401 : 502;
    return res.status(status).json({
      error: "Unable to import rides from Ride with GPS.",
      details: status === 401 ? "Invalid RWGPS credentials." : undefined
    });
  }
};

module.exports = {
  importTrips
};
