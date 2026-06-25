const activity = require("../models/activities");

const writableFields = [
  "actTitle",
  "actDesc",
  "actDate",
  "distance",
  "durationMins",
  "durationSecs",
  "sportType",
  "waypoints"
];

const pickWritableFields = (body) => (
  writableFields.reduce((activityData, field) => {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      activityData[field] = body[field];
    }
    return activityData;
  }, {})
);

const isCastError = (err) => err && err.name === "CastError";

module.exports =  {
 findAll: function(req, res) {
   activity
     .find({ })
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
     .findById(req.params.id)
     .then(dbModel => res.json(dbModel))
     .catch(err => res.status(422).json(err));
 },
 create: function(req, res) {
   if (!req.user) {
     return res.status(401).json({ error: 'Unauthorized' });
   }
   const activityData = {
     ...pickWritableFields(req.body),
     userId: req.user.username
   };
   activity
     .create(activityData)
     .then(dbModel => res.json(dbModel))
     .catch(err => res.status(422).json(err));
  },
  update: function(req, res) {
   const activityData = pickWritableFields(req.body);
   const query = { _id: req.params.id, userId: req.user.username };

   if (Object.keys(activityData).length === 0) {
     return activity
       .findOne(query)
       .then(dbModel => {
         if (!dbModel) {
           return res.status(404).json({ error: "Activity not found" });
         }
         return res.json(dbModel);
       })
       .catch(err => {
         if (isCastError(err)) {
           return res.status(404).json({ error: "Activity not found" });
         }
         return res.status(422).json(err);
       });
   }

   activity
     .findOneAndUpdate(
       query,
       { $set: activityData },
       { new: true, runValidators: true }
     )
     .then(dbModel => {
       if (!dbModel) {
         return res.status(404).json({ error: "Activity not found" });
       }
       return res.json(dbModel);
     })
     .catch(err => {
       if (isCastError(err)) {
         return res.status(404).json({ error: "Activity not found" });
       }
       return res.status(422).json(err);
     });
 },
 remove: function(req, res) {
   activity
     .findOneAndDelete({ _id: req.params.id, userId: req.user.username })
     .then(dbModel => {
       if (!dbModel) {
         return res.status(404).json({ error: "Activity not found" });
       }
       return res.json(dbModel);
     })
     .catch(err => {
       if (isCastError(err)) {
         return res.status(404).json({ error: "Activity not found" });
       }
       return res.status(422).json(err);
     });
 }
};
