const axios = require("axios");
const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");
const Goal = require("../models/Goal");
const Category = require("../models/Category");
const Limit = require("../models/Limit");
const Bill = require("../models/Bill");


const getExchangeRate = async (fromCurrency, toCurrency) => {
    if (fromCurrency === toCurrency) return 1; // No conversion needed

    try {
        const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
        return response.data.rates[toCurrency] || 1;
    } catch (error) {
        console.error(`Exchange rate fetch failed: ${fromCurrency} → ${toCurrency}`, error);
        return null;
    }
};

const addTransaction = async (req, res) => {
    try {
        console.log("Incoming transaction:", req.body);
        console.log("User ID:", req.user ? req.user.id : "No user found");

        const { type, category, amount, description, tags, recurrence, currency, isBill, date } = req.body;

        if (!type || !category || !amount || !currency) {
            return res.status(400).json({ message: "Type, category, amount, and currency are required" });
        }

        // ✅ Check if category exists
        const existingCategory = await Category.findOne({ name: category });
        if (!existingCategory) {
            return res.status(400).json({ message: "Invalid category: This category does not exist" });
        }

        // ✅ Check spending limit
        const budgetLimit = await Limit.findOne({ userId: req.user.id, category });
        if (budgetLimit && amount > budgetLimit.maxAmount) {
            return res.status(400).json({ message: "Transaction exceeds the set limit!" });
        }

        // ✅ Fetch exchange rate
        console.log("Fetching exchange rate...");
        const exchangeRate = await getExchangeRate(currency, "LKR");

        if (!exchangeRate) {
            return res.status(400).json({ message: "Currency conversion failed" });
        }

        const convertedAmount = amount * exchangeRate;
        console.log(`Converted ${amount} ${currency} → ${convertedAmount} LKR`);

        let recurrenceData = null;
        if (recurrence?.frequency && recurrence?.startDate) {
            recurrenceData = {
                frequency: recurrence.frequency,
                startDate: new Date(recurrence.startDate),
                endDate: recurrence.endDate ? new Date(recurrence.endDate) : null
            };
        }

        // ✅ Handle income transactions (allocate savings)
        if (type === "income") {
            console.log("Processing income allocation...");

            const goals = await Goal.find({ userId: req.user.id });

            for (const goal of goals) {
                if (goal.allocationPercentage > 0) {
                    let allocatedAmount = (goal.allocationPercentage / 100) * amount;

                    if (goal.currency !== currency) {
                        const goalExchangeRate = await getExchangeRate(currency, goal.currency);
                        if (!goalExchangeRate) {
                            return res.status(400).json({ message: "Currency conversion for goal failed" });
                        }
                        allocatedAmount *= goalExchangeRate;
                    }

                    goal.savedAmount += allocatedAmount;
                    await goal.save();
                    console.log(`Allocated ${allocatedAmount} ${goal.currency} to goal: ${goal.name}`);
                }
            }
        }

        // ✅ Handle expense transactions (deduct from budget)
        if (type === "expense") {
            console.log("Checking budget for expenses...");

            const budget = await Budget.findOne({ userId: req.user.id, category });

            if (budget) {
                let adjustedAmount = amount;

                if (budget.currency !== currency) {
                    const budgetExchangeRate = await getExchangeRate(currency, budget.currency);
                    if (!budgetExchangeRate) {
                        return res.status(400).json({ message: "Currency conversion for budget failed" });
                    }
                    adjustedAmount *= budgetExchangeRate;
                }

                budget.spent += adjustedAmount;
                budget.exceededAlertSent = false;
                await budget.save();

                console.log(`Updated budget: ${budget.spent} ${budget.currency} spent`);
            } else {
                console.log("No budget found for category");
            }
        }

        // ✅ Store transaction in DB
        const transaction = await Transaction.create({
            userId: req.user.id,
            type,
            category,
            tags,
            amount,
            currency,
            convertedAmount,
            exchangeRate,
            description,
            recurrence: recurrenceData
        });

        console.log("Transaction created:", transaction);

        // ✅ Handle Bill Creation (if applicable)
        if (isBill) {
            const bill = new Bill({
                userId: req.user.id,  // FIXED missing userId
                name: category, 
                amount,
                dueDate: date, // FIXED missing date
                reminderDaysBefore: 3, 
                status: "pending",
            });
            await bill.save();
            console.log(`Bill "${bill.name}" added.`);
        }

        res.status(201).json(transaction);

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ message: "Server error", error });
    }
};


const getUserTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user.id });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

const getTransactionsByTag = async (req, res) => {
    try {
        const { tag } = req.params; // Get the tag from the URL
        const transactions = await Transaction.find({
            userId: req.user.id,
            tags: { $in: [tag] }  // Find transactions that have the specified tag
        });

        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};


const deleteTransaction = async (req, res) => {
    try {
        console.log("Delete 1");
        const transaction = await Transaction.findById(req.params.id);
        console.log("Delete 2");
        if (!transaction) return res.status(404).json({ message: "Transaction not found" });
        console.log("Delete 3");
        if (transaction.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized action" });
        }

        console.log("Delete 4");

        // await transaction.remove();
        await Transaction.deleteOne({ _id: req.params.id });
        res.json({ message: "Transaction deleted" });
    } catch (error) {
        // res.status(500).json({ message: "Server error", error });
        console.error("Error deleting transaction:", error);  // More detailed error logging
        res.status(500).json({ message: "Server error", error: error.message || error });

    }
};


const updateTransaction = async (req, res) => {
    try {
        console.log("Update Request Body:", req.body);
        console.log("Transaction ID:", req.params.id);

        const { type, category, amount, description, tags, recurrence, currency } = req.body;

        let transaction = await Transaction.findById(req.params.id);
        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        // Ensure the user owns the transaction
        if (transaction.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized action" });
        }

        // ✅ Check if category exists
        const existingCategory = await Category.findOne({ name: category });
        if (!existingCategory) {
            return res.status(400).json({ message: "Invalid category: This category does not exist" });
        }

        console.log("Updating transaction...");

        // Convert the new amount to LKR if the currency is different
        let convertedAmount = amount;
        if (currency && currency !== "LKR") {
            const exchangeRate = await getExchangeRate(currency, "LKR");
            if (!exchangeRate) {
                return res.status(400).json({ message: "Currency conversion failed" });
            }
            convertedAmount *= exchangeRate;
            console.log(`Converted amount: ${convertedAmount} LKR`);
        }

        // Prepare update data
        let updateData = {
            type,
            category,
            amount,  // Store original amount
            convertedAmount, // Store converted amount (LKR)
            currency, // Store original currency
            description,
            tags
        };

        // Handle recurrence update (ensure it can be removed)
        if (recurrence) {
            updateData.recurrence = {
                frequency: recurrence.frequency,
                startDate: new Date(recurrence.startDate),
                endDate: recurrence.endDate ? new Date(recurrence.endDate) : null
            };
        } else {
            updateData.recurrence = null;
        }

        // **Recalculate savings allocation for income**
        if (type === "income") {
            const goals = await Goal.find({ userId: req.user.id });

            for (const goal of goals) {
                if (goal.allocationPercentage > 0) {
                    let allocatedAmount = (goal.allocationPercentage / 100) * convertedAmount;
                    goal.savedAmount += allocatedAmount;
                    await goal.save();
                    console.log(`Reallocated ${allocatedAmount} LKR to goal: ${goal.name}`);
                }
            }
        }

        // **Update budget for expenses**
        if (type === "expense") {
            console.log("Checking budget...");

            const budget = await Budget.findOne({ userId: req.user.id, category });

            if (budget) {
                console.log("Budget found:", budget);

                budget.spent -= transaction.convertedAmount;  // Remove old amount
                budget.spent += convertedAmount;  // Add new amount
                budget.exceededAlertSent = false;

                await budget.save();
                console.log("Budget updated:", budget.spent);
            } else {
                console.log("No budget found for category");
            }
        }

        // Update transaction
        transaction = await Transaction.findByIdAndUpdate(req.params.id, updateData, { new: true });

        // If this is a bill payment, mark the bill as "paid"
        const bill = await Bill.findOne({ transactionId: transaction._id, status: "pending" });
        if (bill) {
            bill.status = "paid";
            await bill.save();
            console.log(`Bill for transaction "${transaction._id}" marked as paid.`);
        }

        console.log("Updated Transaction:", transaction);
        res.json(transaction);
    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ message: "Server error", error });
    }
};





module.exports = { addTransaction, getUserTransactions, deleteTransaction, updateTransaction, getTransactionsByTag };