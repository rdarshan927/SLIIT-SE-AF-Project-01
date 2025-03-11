const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { createGoal, getUserGoals, updateGoalProgress, deleteGoal } = require("../controllers/goalController");

const router = express.Router();

router.post("/add/", protect, createGoal);
router.get("/get/", protect, getUserGoals);
router.put("/edit/:goalId", protect, updateGoalProgress);
router.delete("/delete/:goalId", protect, deleteGoal);

module.exports = router;
