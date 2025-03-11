const cron = require("node-cron");
const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");

const handleRecurringTransactions = async () => {
    try {
        const today = new Date();
        const transactions = await Transaction.find({
            recurrence: { $ne: null },
            "recurrence.endDate": { $gte: today }
        });

        transactions.forEach(async (transaction) => {
            const { type, category, tags, amount, description, recurrence, endDate } = transaction;

            // If the transaction should recur, check its type
            const nextTransactionDate = getNextRecurrenceDate(transaction.recurrence.type, today);

            if (nextTransactionDate <= endDate) {
                const newTransaction = new Transaction({
                    userId: transaction.userId,
                    type,
                    category,
                    tags,
                    amount,
                    description,
                    date: nextTransactionDate,
                    recurrence
                });

                await newTransaction.save();

                console.log(`Recurring transaction created for ${category} on ${nextTransactionDate}`);

                // **Update Budget for Expenses**
                if (type === "expense") {
                    const budget = await Budget.findOne({ userId, category });

                    if (budget) {
                        budget.spent += amount; // Deduct from budget
                        budget.exceededAlertSent = false; // Reset notification flag
                        await budget.save();
                        console.log(`Updated budget for ${category}: New spent amount = ${budget.spent}`);
                    } else {
                        console.log(`No budget found for category ${category}`);
                    }
                }
            }
        });
    } catch (error) {
        console.log("Error handling recurring transactions:", error);
    }
};

// Helper function to calculate the next recurrence date
const getNextRecurrenceDate = (recurrenceType, currentDate) => {
    const nextDate = new Date(currentDate);
    switch (recurrenceType) {
        case "daily":
            nextDate.setDate(currentDate.getDate() + 1);
            break;
        case "weekly":
            nextDate.setDate(currentDate.getDate() + 7);
            break;
        case "monthly":
            nextDate.setMonth(currentDate.getMonth() + 1);
            break;
        default:
            break;
    }
    return nextDate;
};


cron.schedule("* * * * *", handleRecurringTransactions);  // Every day at midnight

module.exports = { handleRecurringTransactions };