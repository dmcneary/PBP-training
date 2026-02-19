const router = require("express").Router();
const activityController = require("../controllers/activityController");
const rusaController = require("../controllers/rusaController");
const plannedRideController = require("../controllers/plannedRideController");

const requireAuth = (req, res, next) => {
  if (req.user) {
    return next();
  }
  return res.status(401).json({ error: "Unauthorized" });
};

router.route("/all-activities")
  .get(activityController.findAll)
  
router.route("/activities")
  .get(requireAuth, activityController.findAllByUser)
  .post(requireAuth, activityController.create);

router
  .route("/activities/:id")
  .get(activityController.findById)
  .put(activityController.update)
  .delete(activityController.remove);

router.get("/rusa/regions", rusaController.listRegions);
router.get("/rusa/events", rusaController.listEvents);
router.get("/rusa/results", rusaController.listResults);

router
  .route("/planned-rides")
  .get(requireAuth, plannedRideController.listByUser)
  .post(requireAuth, plannedRideController.create);

router
  .route("/planned-rides/:id")
  .put(requireAuth, plannedRideController.update)
  .delete(requireAuth, plannedRideController.remove);

module.exports = router;
