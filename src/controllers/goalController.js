const Goal = require("../models/Goal");

// **1. Create a new financial goal**
const createGoal = async (req, res) => {
    try {
        const { name, targetAmount, savedAmount, deadline, allocationPercentage } = req.body;
        
        if (!name || !targetAmount || !deadline) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const goal = new Goal({
            userId: req.user.id,
            name,
            targetAmount,
            savedAmount,
            deadline,
            allocationPercentage: allocationPercentage || 0,
        });
        await goal.save();
        res.status(201).json(goal);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// **2. Get all goals for the user**
const getUserGoals = async (req, res) => {
    try {
        const goals = await Goal.find({ userId: req.user.id });
        res.json(goals);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// **3. Update goal progress (e.g., when savings increase)**
const updateGoalProgress = async (req, res) => {
    try {
        const { goalId } = req.params;
        const { amount } = req.body;
        const goal = await Goal.findOne({ _id: goalId, userId: req.user.id });

        if (!goal) {
            return res.status(404).json({ message: "Goal not found" });
        }

        goal.savedAmount += amount; // Add savings to the goal
        await goal.save();
        
        res.json({ message: "Goal progress updated", goal });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// **4. Delete a goal**
const deleteGoal = async (req, res) => {
    try {
        const { goalId } = req.params;
        await Goal.deleteOne({ _id: goalId, userId: req.user.id });
        res.json({ message: "Goal deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

module.exports = { createGoal, getUserGoals, updateGoalProgress, deleteGoal };