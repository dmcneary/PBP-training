const activity = require("../models/activities");

module.exports =  {
 findAll: function(req, res) {
   activity
     .find({ })
     .sort({ actDate: -1 })
     .then(dbModel => res.json(dbModel))
     .catch(err => res.status(422).json(err));
 },
 findAllByUser: function(req, res) {
   console.log(req.user.username)
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
   console.log(req.body);
   activity
     .create(req.body)
     .then(dbModel => res.json(dbModel))
     .catch(err => res.status(422).json(err));
 },
 update: function(req, res) {
   activity
     .findOneAndUpdate({ _id: req.params.id }, req.body)
     .then(dbModel => res.json(dbModel))
     .catch(err => res.status(422).json(err));
 },
 remove: function(req, res) {
   activity
     .findById({ _id: req.params.id })
     .then(dbModel => dbModel.remove())
     .then(dbModel => res.json(dbModel))
     .catch(err => res.status(422).json(err));
 }
};
