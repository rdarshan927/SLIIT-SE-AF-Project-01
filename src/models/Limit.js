const mongoose = require("mongoose");

const limitSchema = new mongoose.Schema({
    category: { type: String, required: true },
    maxAmount: { type: Number, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
});

module.exports = mongoose.model("Limit", limitSchema);
