const cron = require("node-cron");
const Goal = require("../models/Goal");
const Transaction = require("../models/Transaction");

const handleAutoSavings = async () => {
    console.log("Running auto-savings allocation...");

    try {
        const goals = await Goal.find({ autoAllocate: true });

        for (const goal of goals) {
            const userIncome = await Transaction.aggregate([
                { $match: { userId: goal.userId, type: "income" } },
                { $group: { _id: null, totalIncome: { $sum: "$amount" } } }
            ]);

            if (userIncome.length === 0) continue; // Skip if no income found

            const income = userIncome[0].totalIncome;
            const amountToSave = (goal.allocationPercentage / 100) * income;

            if (goal.savedAmount + amountToSave > goal.targetAmount) {
                goal.savedAmount = goal.targetAmount; // Ensure we don't exceed goal
            } else {
                goal.savedAmount += amountToSave;
            }

            await goal.save();
        }
    } catch (error) {
        console.log("Error in auto-saving:", error);
    }
};

// Run daily at midnight
cron.schedule("* * * * *", handleAutoSavings);

module.exports = { handleAutoSavings };
