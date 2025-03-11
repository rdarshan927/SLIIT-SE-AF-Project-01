const Budget = require("../models/Budget");

// Add a new budget
const addBudget = async (req, res) => {
    try {
        const { category, limit } = req.body;
        const userId = req.user.id;

        const budget = new Budget({
            userId,
            category,
            limit,
            spent: 0,  // Initially, no amount is spent
        });

        await budget.save();
        res.status(201).json({ message: "Budget added successfully", budget });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Get all budgets for the current user
const getUserBudgets = async (req, res) => {
    try {
        const budgets = await Budget.find({ userId: req.user.id });
        res.json(budgets);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Update a specific budget
const updateBudget = async (req, res) => {
    try {
        const { id } = req.params;
        const { category, limit } = req.body;

        const budget = await Budget.findOne({ _id: id, userId: req.user.id });
        if (!budget) return res.status(404).json({ message: "Budget not found" });

        // Update fields
        budget.category = category || budget.category;
        budget.limit = limit || budget.limit;

        await budget.save();
        res.json({ message: "Budget updated successfully", budget });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Delete a specific budget
const deleteBudget = async (req, res) => {
    try {
        const { id } = req.params;
        const budget = await Budget.findOne({ _id: id, userId: req.user.id });

        if (!budget) return res.status(404).json({ message: "Budget not found" });

        // await budget.remove();
        await budget.deleteOne({ _id: req.params.id });
        res.json({ message: "Budget deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

module.exports = { addBudget, getUserBudgets, updateBudget, deleteBudget };
