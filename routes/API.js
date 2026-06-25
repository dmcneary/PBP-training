const router = require("express").Router();
const activityController = require("../controllers/activityController");
const rusaController = require("../controllers/rusaController");

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

module.exports = router;
