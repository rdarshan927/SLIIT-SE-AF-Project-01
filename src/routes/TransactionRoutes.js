const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { addTransaction, getUserTransactions, deleteTransaction, updateTransaction, getTransactionsByTag } = require("../controllers/transactionController");

const router = express.Router();

router.post("/add/", protect, addTransaction); // Add transaction
router.get("/get/", protect, getUserTransactions); // View all transactions
router.get("/getByTag/", protect, getTransactionsByTag);
router.put("/update/:id", protect, updateTransaction); // Edit transaction 
router.delete("/delete/:id", protect, deleteTransaction); // Delete transaction

module.exports = router;
