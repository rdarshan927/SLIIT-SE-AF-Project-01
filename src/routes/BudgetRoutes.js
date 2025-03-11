const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
    addBudget,
    getUserBudgets,
    updateBudget,
    deleteBudget
} = require("../controllers/budgetController");

// Route to add a budget
router.post("/add/", protect, addBudget);

// Route to get all budgets of a user
router.get("/get/", protect, getUserBudgets);

// Route to update a specific budget
router.put("/update/:id", protect, updateBudget);

// Route to delete a specific budget
router.delete("/delete/:id", protect, deleteBudget);

module.exports = router;
