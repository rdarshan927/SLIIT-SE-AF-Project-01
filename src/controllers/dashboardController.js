const Transaction = require("../models/Transaction");
const Goal = require("../models/Goal");
const Budget = require("../models/Budget");
const User = require("../models/User");
const mongoose = require("mongoose");

const getDashboardSummary = async (req, res) => {
    try {
        console.log("Fetching dashboard summary...");

        // Fetch user role
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.role === "ADMIN") {
            // 🔹 Admin Dashboard: Overview of all users and total system financials
            const totalUsers = await User.countDocuments();
            const totalTransactions = await Transaction.countDocuments();
            const totalIncome = await Transaction.aggregate([
                { $match: { type: "income" } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]);
            const totalExpense = await Transaction.aggregate([
                { $match: { type: "expense" } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]);

            return res.json({
                role: "admin",
                totalUsers,
                totalTransactions,
                totalIncome: totalIncome[0]?.total || 0,
                totalExpense: totalExpense[0]?.total || 0
            });

        } else {
            // 🔹 Regular User Dashboard: Personal finances
            const userId = mongoose.Types.ObjectId.createFromHexString(req.user.id);

            const totalIncome = await Transaction.aggregate([
                { $match: { userId, type: "income" } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]);

            console.log("total income: " + totalIncome);
            const totalExpense = await Transaction.aggregate([
                { $match: { userId, type: "expense" } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]);

            console.log("total expense: " + totalExpense);

            const budgets = await Budget.find({ userId });
            const goals = await Goal.find({ userId });

            return res.json({
                role: "user",
                totalIncome: totalIncome[0]?.total || 0,
                totalExpense: totalExpense[0]?.total || 0,
                budgets,
                goals
            });
        }
    } catch (error) {
        console.error("Dashboard Summary Error:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

module.exports = { getDashboardSummary };