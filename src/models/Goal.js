const mongoose = require("mongoose");

const GoalSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true }, // e.g., "Car Savings"
    targetAmount: { type: Number, required: true }, // Goal amount
    savedAmount: { type: Number, default: 0 }, // How much is saved
    deadline: { type: Date, required: true }, // Deadline for achieving the goal
    allocationPercentage: { type: Number, default: 0 }, // % of income allocated
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Goal", GoalSchema);
