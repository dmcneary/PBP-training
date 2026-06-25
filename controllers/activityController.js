const activity = require("../models/activities");

const ACTIVITY_FIELDS = [
  "actTitle",
  "actDesc",
  "actDate",
  "distance",
  "durationMins",
  "durationSecs",
  "sportType",
  "waypoints",
  "source",
  "sourceId",
  "externalUrl",
  "movingTimeSecs",
  "avgHeartRate",
  "avgPower",
  "elevationGainFeet"
];

const pickActivityFields = (payload) =>
  ACTIVITY_FIELDS.reduce((next, field) => {
    if (payload[field] !== undefined) {
      next[field] = payload[field];
    }
    return next;
  }, {});

const PUBLIC_ACTIVITY_FIELDS = "userId actTitle actDesc actDate distance durationMins durationSecs sportType";

module.exports =  {
 findAll: function(req, res) {
   activity
     .find({ })
     .select(PUBLIC_ACTIVITY_FIELDS)
     .sort({ actDate: -1 })
     .then(dbModel => res.json(dbModel))
     .catch(err => res.status(422).json(err));
 },
 findAllByUser: function(req, res) {
  activity
    .find({ userId: req.user.username })
    .sort({ actDate: -1 })
    .then(dbModel => res.json(dbModel))
    .catch(err => res.status(422).json(err));
},
 findById: function(req, res) {
   activity
     .findOne({ _id: req.params.id, userId: req.user.username })
     .then(dbModel => {
       if (!dbModel) return res.status(404).json({ error: "Activity not found" });
       return res.json(dbModel);
     })
     .catch(err => res.status(422).json(err));
 },
 create: function(req, res) {
   if (!req.user) {
     return res.status(401).json({ error: 'Unauthorized' });
   }
   const activityData = {
     ...pickActivityFields(req.body),
     userId: req.user.username
   };
   activity
     .create(activityData)
     .then(dbModel => res.json(dbModel))
     .catch(err => res.status(422).json(err));
 },
 update: function(req, res) {
   activity
     .findOneAndUpdate(
       { _id: req.params.id, userId: req.user.username },
       pickActivityFields(req.body),
       { new: true, runValidators: true }
     )
     .then(dbModel => {
       if (!dbModel) return res.status(404).json({ error: "Activity not found" });
       return res.json(dbModel);
     })
     .catch(err => res.status(422).json(err));
 },
 remove: function(req, res) {
   activity
     .findOneAndDelete({ _id: req.params.id, userId: req.user.username })
     .then(dbModel => {
       if (!dbModel) return res.status(404).json({ error: "Activity not found" });
       return res.json(dbModel);
     })
     .catch(err => res.status(422).json(err));
 }
};
