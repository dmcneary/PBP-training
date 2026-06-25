const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const plannedRideSchema = new Schema({
  userId: { type: String, required: true, index: true },
  regionId: { type: String, required: true },
  regionName: { type: String },
  clubName: { type: String },
  rideName: { type: String, required: true },
  rideDate: { type: Date, required: true },
  distanceKm: { type: Number },
  climbingFeet: { type: Number },
  eventUrl: { type: String },
  routeUrl: { type: String },
  sourceEventId: { type: String },
  eventFingerprint: { type: String, required: true },
  qualificationSlot: {
    type: String,
    enum: ["brm200", "brm300", "brm400", "brm600", null],
    default: null
  },
  notes: { type: String, default: "" },
  status: {
    type: String,
    enum: ["planned", "completed", "skipped"],
    default: "planned"
  },
  createdAt: { type: Date, default: Date.now, required: true }
});

plannedRideSchema.index({ userId: 1, eventFingerprint: 1 }, { unique: true });

const PlannedRide = mongoose.model("plannedRide", plannedRideSchema);
module.exports = PlannedRide;
