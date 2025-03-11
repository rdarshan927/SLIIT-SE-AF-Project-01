const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    category: { type: String, required: true },
    tags: { type: [String], default: [] },
    amount: { type: Number, required: true },  // Original amount
    currency: { type: String, required: true },  // Original currency (e.g., "USD", "EUR")
    convertedAmount: { type: Number, required: true },  // Amount in LKR
    exchangeRate: { type: Number, required: true },  // Exchange rate at the time of transaction
    date: { type: Date, default: Date.now },
    description: { type: String },
    recurrence: {
        type: {
            frequency: { type: String, enum: ["daily", "weekly", "monthly"], required: true },
            startDate: { type: Date, required: true },
            endDate: { type: Date }
        },
        required: false
    }
}, { timestamps: true });

module.exports = mongoose.model("Transaction", TransactionSchema);
