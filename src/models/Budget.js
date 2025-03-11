const mongoose = require("mongoose");

const BudgetSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, required: true },
    limit: { type: Number, required: true },
    spent: { type: Number, default: 0 },  // Keeps track of the amount spent
    resetFrequency: { type: String, enum: ['daily', 'weekly', 'monthly'] }, // 'daily', 'weekly', 'monthly'
    lastReset: { type: Date, default: Date.now }, // Store the last reset date
    exceededAlertSent: { type: Boolean, default: false }, // Flag to prevent multiple exceeded alerts
}, { timestamps: true });

module.exports = mongoose.model("Budget", BudgetSchema);
