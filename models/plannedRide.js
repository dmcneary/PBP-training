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
  eventUrl: { type: String },
  eventFingerprint: { type: String, required: true },
  notes: { type: String, default: "" },
  status: {
    type: String,
    enum: ["planned", "completed", "skipped"],
    default: "planned"
  },
  createdAt: { type: Date, default: Date.now, required: true }
});

const PlannedRide = mongoose.model("plannedRide", plannedRideSchema);
module.exports = PlannedRide;
