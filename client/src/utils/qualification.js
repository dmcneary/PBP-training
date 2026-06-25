export const BRM_SLOTS = [
  { id: "brm-200", distanceKm: 200 },
  { id: "brm-300", distanceKm: 300 },
  { id: "brm-400", distanceKm: 400 },
  { id: "brm-600", distanceKm: 600 }
];

export const DEFAULT_SEASON_START = "2027-01-01";
export const DEFAULT_SEASON_END = "2027-12-31";

const dateOnly = (dateValue) => {
  const match = String(dateValue || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : null;
};

const isWithinSeason = (dateValue, seasonStart, seasonEnd) => {
  const value = dateOnly(dateValue);
  if (!value) return false;
  return value >= seasonStart && value <= seasonEnd;
};

const slotByDistance = (distanceKm) => {
  const distance = Number(distanceKm);
  if (!Number.isFinite(distance)) return null;
  if (distance >= 600) return "brm-600";
  if (distance >= 400 && distance < 600) return "brm-400";
  if (distance >= 300 && distance < 400) return "brm-300";
  if (distance >= 200 && distance < 300) return "brm-200";
  return null;
};

const slotFromQualification = (qualificationSlot) => {
  const match = String(qualificationSlot || "").match(/^brm(\d+)$/);
  return match ? `brm-${match[1]}` : null;
};

const activityDistanceKm = (activity) => {
  const miles = Number(activity?.distance);
  if (!Number.isFinite(miles)) return null;
  return miles * 1.609344;
};

const activityLooksLikeBrevet = (activity) => {
  const title = String(activity?.actTitle || "").toLowerCase();
  const description = String(activity?.actDesc || "").toLowerCase();
  return /brm|brevet|\b[2346]00k\b/.test(`${title} ${description}`);
};

const applyCandidate = (summary, slotId, candidate) => {
  if (!slotId || !summary[slotId]) return;
  const current = summary[slotId];
  if (current.status === "completed" && candidate.status !== "completed") return;
  if (current.status === "planned" && candidate.status === "missing") return;
  summary[slotId] = candidate;
};

export const buildQualificationSummary = ({
  plannedRides = [],
  activities = [],
  seasonStart = DEFAULT_SEASON_START,
  seasonEnd = DEFAULT_SEASON_END
} = {}) => {
  const summary = BRM_SLOTS.reduce((next, slot) => {
    next[slot.id] = {
      ...slot,
      status: "missing",
      sourceLabel: "No ride selected yet",
      date: null
    };
    return next;
  }, {});

  plannedRides.forEach((ride) => {
    if (ride.status === "skipped") return;
    if (!isWithinSeason(ride.rideDate, seasonStart, seasonEnd)) return;
    const slotId = slotFromQualification(ride.qualificationSlot) || slotByDistance(ride.distanceKm);
    const completed = ride.status === "completed";
    applyCandidate(summary, slotId, {
      ...summary[slotId],
      status: completed ? "completed" : "planned",
      sourceLabel: `${ride.rideName || "Planned brevet"} (${ride.clubName || ride.regionName || "club calendar"})`,
      date: ride.rideDate || null
    });
  });

  activities.forEach((activity) => {
    if (!isWithinSeason(activity.actDate, seasonStart, seasonEnd)) return;
    const sport = String(activity?.sportType || "").toLowerCase();
    if (sport && sport !== "cycling") return;
    if (!activityLooksLikeBrevet(activity)) return;
    const slotId = slotByDistance(activityDistanceKm(activity));
    applyCandidate(summary, slotId, {
      ...summary[slotId],
      status: "completed",
      sourceLabel: `${activity.actTitle || "Logged activity"} (${activity.source === "rwgps" ? "Ride with GPS" : "activity log"})`,
      date: activity.actDate || null
    });
  });

  return summary;
};
