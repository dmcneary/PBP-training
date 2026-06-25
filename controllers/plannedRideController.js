const PlannedRide = require("../models/plannedRide");

const sanitizeStatus = (status) => {
  if (["planned", "completed", "skipped"].includes(status)) {
    return status;
  }
  return "planned";
};

const inferQualificationSlot = (distanceKm) => {
  const distance = Number(distanceKm);
  if (!Number.isFinite(distance)) return null;
  if (distance >= 600) return "brm600";
  if (distance >= 400) return "brm400";
  if (distance >= 300) return "brm300";
  if (distance >= 200) return "brm200";
  return null;
};

const toNullableNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const buildFingerprint = ({ regionId, rideDate, rideName, distanceKm }) => {
  const parts = [
    regionId || "",
    rideDate ? new Date(rideDate).toISOString().slice(0, 10) : "",
    (rideName || "").trim().toLowerCase(),
    distanceKm === null || distanceKm === undefined ? "" : String(distanceKm)
  ];
  return parts.join("|");
};

module.exports = {
  listByUser: async (req, res) => {
    try {
      const rides = await PlannedRide.find({ userId: req.user.username }).sort({
        rideDate: 1,
        createdAt: -1
      });
      return res.json(rides);
    } catch (error) {
      return res.status(500).json({ error: "Unable to fetch planned rides" });
    }
  },

  create: async (req, res) => {
    const {
      regionId,
      regionName,
      clubName,
      rideName,
      rideDate,
      distanceKm,
      climbingFeet,
      eventUrl,
      routeUrl,
      sourceEventId,
      notes,
    } = req.body;

    if (!regionId || !rideName || !rideDate) {
      return res.status(400).json({ error: "regionId, rideName, and rideDate are required" });
    }

    const parsedDate = new Date(rideDate);
    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: "rideDate must be a valid date" });
    }

    const parsedDistanceKm = toNullableNumber(distanceKm);
    const eventFingerprint = buildFingerprint({
      regionId,
      rideDate: parsedDate,
      rideName,
      distanceKm: parsedDistanceKm
    });

    try {
      const existing = await PlannedRide.findOne({
        userId: req.user.username,
        eventFingerprint
      });

      if (existing) {
        return res.status(409).json({ error: "Ride already planned" });
      }

      const plannedRide = await PlannedRide.create({
        userId: req.user.username,
        regionId,
        regionName,
        clubName,
        rideName: rideName.trim(),
        rideDate: parsedDate,
        distanceKm: parsedDistanceKm,
        climbingFeet: toNullableNumber(climbingFeet),
        eventUrl,
        routeUrl,
        sourceEventId,
        eventFingerprint,
        qualificationSlot: inferQualificationSlot(parsedDistanceKm),
        notes: typeof notes === "string" ? notes : "",
        status: "planned"
      });

      return res.json(plannedRide);
    } catch (error) {
      if (error?.code === 11000) {
        return res.status(409).json({ error: "Ride already planned" });
      }
      return res.status(500).json({ error: "Unable to save planned ride" });
    }
  },

  update: async (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body;

    const updateFields = {};
    if (status) {
      updateFields.status = sanitizeStatus(status);
    }
    if (typeof notes === "string") {
      updateFields.notes = notes;
    }

    try {
      const ride = await PlannedRide.findOneAndUpdate(
        { _id: id, userId: req.user.username },
        updateFields,
        { new: true }
      );

      if (!ride) {
        return res.status(404).json({ error: "Planned ride not found" });
      }

      return res.json(ride);
    } catch (error) {
      return res.status(500).json({ error: "Unable to update planned ride" });
    }
  },

  remove: async (req, res) => {
    const { id } = req.params;

    try {
      const ride = await PlannedRide.findOneAndDelete({
        _id: id,
        userId: req.user.username
      });

      if (!ride) {
        return res.status(404).json({ error: "Planned ride not found" });
      }

      return res.json({ ok: true, id });
    } catch (error) {
      return res.status(500).json({ error: "Unable to delete planned ride" });
    }
  }
};
