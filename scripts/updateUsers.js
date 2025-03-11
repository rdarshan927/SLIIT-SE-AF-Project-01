require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../src/models/User");

const updateUsers = async () => {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    console.log("Updating users...");
    await User.updateMany({}, { $set: { lowBalanceAlertSent: false } });

    console.log("Users updated successfully!");
    process.exit();
};

updateUsers().catch((err) => {
    console.error(err);
    process.exit(1);
});
