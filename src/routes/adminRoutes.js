const express = require("express");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { getAllUsers, updateUser, deleteUser, getAllTransactions, getReport, addCategory, updateCategory, deleteCategory } = require("../controllers/adminController");

const router = express.Router();

router.get("/getall", protect, adminOnly, getAllUsers);
router.put("/update/:id", protect, adminOnly, updateUser);
router.delete("/delete/:id", protect, adminOnly, deleteUser);
router.get("/transactions", protect, adminOnly, getAllTransactions);
router.get("/report", protect, adminOnly, getReport);
router.post("/addcategory", protect, adminOnly, addCategory);
router.put("/updatecategory/:id", protect, adminOnly, updateCategory);
router.delete("/deletecategory/:id", protect, adminOnly, deleteCategory);

module.exports = router;