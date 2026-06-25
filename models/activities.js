const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.promise = Promise;


const activitySchema = new Schema({
    userId: { type: String, unique: false, required: true },
    actTitle: { type: String, unique: false, required: true },
    actDesc: { type: String, unique: false, required: true },
    actDate: { type: Date, unique: false, default: Date.now, required: true },
	distance: { type: Number, unique: false, required: true },
    durationMins: { type: Number, unique: false, required: true },
    durationSecs: { type: Number, unique: false, required: true },
    sportType: { type: String, unique: false, required: true },
    waypoints: { type: Array }
});

activitySchema.index({ userId: 1 });

const Activity = mongoose.model('activity', activitySchema);
module.exports = Activity;
