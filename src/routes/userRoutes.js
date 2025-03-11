const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Regular User Routes
router.get("/transactions", protect, (req, res) => {
    res.json({ message: "Fetching user transactions..." });
});

router.post("/transactions", protect, (req, res) => {
    res.json({ message: "Adding new transaction..." });
});

router.get("/reports", protect, (req, res) => {
    res.json({ message: "Fetching user reports..." });
});

module.exports = router;
