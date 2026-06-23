const router = require("express").Router();
const activityController = require("../controllers/activityController");
const rusaController = require("../controllers/rusaController");
const plannedRideController = require("../controllers/plannedRideController");
const rwgpsController = require("../controllers/rwgpsController");

const requireAuth = (req, res, next) => {
  if (req.user) {
    return next();
  }
  return res.status(401).json({ error: "Unauthorized" });
};

router.route("/all-activities")
  .get(requireAuth, activityController.findAll)
  
router.route("/activities")
  .get(requireAuth, activityController.findAllByUser)
  .post(requireAuth, activityController.create);

router
  .route("/activities/:id")
  .get(requireAuth, activityController.findById)
  .put(requireAuth, activityController.update)
  .delete(requireAuth, activityController.remove);

router.get("/rusa/regions", rusaController.listRegions);
router.get("/rusa/events", rusaController.listEvents);
router.get("/rusa/results", rusaController.listResults);
router.post("/rwgps/import", requireAuth, rwgpsController.importTrips);

router
  .route("/planned-rides")
  .get(requireAuth, plannedRideController.listByUser)
  .post(requireAuth, plannedRideController.create);

router
  .route("/planned-rides/:id")
  .put(requireAuth, plannedRideController.update)
  .delete(requireAuth, plannedRideController.remove);

module.exports = router;
