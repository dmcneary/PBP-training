const router = require("express").Router();
const activityController = require("../controllers/activityController");

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

module.exports = router;
