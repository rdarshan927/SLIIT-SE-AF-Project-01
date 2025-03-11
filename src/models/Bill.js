const mongoose = require("mongoose");

const BillSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true }, // e.g., "Electricity Bill"
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    reminderDaysBefore: { type: Number, default: 3 }, // Send reminder 3 days before by default
    status: { type: String, enum: ["pending", "paid"], default: "pending" },
}, { timestamps: true });

module.exports = mongoose.model("Bill", BillSchema);
