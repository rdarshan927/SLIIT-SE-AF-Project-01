// budgetNotification.js - Handles budget notifications
const cron = require("node-cron");
const nodemailer = require("nodemailer");
const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");
const io = require("../utils/socket"); // Socket.io instance
const User = require("../models/User");

// Email transporter setup
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_TEST,
        pass: process.env.EMAIL_PASS,
    },
});


const checkBudgets = async () => {
    const budgets = await Budget.find();
    
    for (let budget of budgets) {
        const { userId, category, limit, spent, lastReset, resetFrequency, exceededAlertSent } = budget;
        const percentageSpent = (spent / limit) * 100;

        // Check if reset is required based on frequency (daily, weekly, monthly)
        let resetRequired = false;
        let resetMessage = "";

        const now = new Date();
        const lastResetDate = new Date(lastReset);

        switch (resetFrequency) {
            case 'daily':
                if (now.getDate() !== lastResetDate.getDate()) {
                    resetRequired = true;
                    resetMessage = `Your daily budget for ${category} has been reset.`;
                }
                break;
            case 'weekly':
                const lastResetWeek = Math.floor(lastResetDate / (7 * 24 * 60 * 60 * 1000));
                const currentWeek = Math.floor(now / (7 * 24 * 60 * 60 * 1000));
                if (lastResetWeek !== currentWeek) {
                    resetRequired = true;
                    resetMessage = `Your weekly budget for ${category} has been reset.`;
                }
                break;
            case 'monthly':
                if (now.getMonth() !== lastResetDate.getMonth()) {
                    resetRequired = true;
                    resetMessage = `Your monthly budget for ${category} has been reset.`;
                }
                break;
        }

        // Send reset notification if reset is required
        if (resetRequired) {
            // Send reset email or notification here
            console.log(resetMessage);
            
            // Reset spent to 0 and set the new last reset date
            budget.spent = 0;
            budget.lastReset = now;

            await budget.save();
        }

        // Check if budget exceeded and send notification
        if (percentageSpent >= 80 && !exceededAlertSent) {
            // Send alert once when exceeded
            console.log(`Warning: You've used ${Math.round(percentageSpent)}% of your budget for ${category}.`);

            // Update exceededAlertSent to prevent multiple alerts for the same period
            budget.exceededAlertSent = true;

            await budget.save();
        }
        
        // Send email notification if exceeded 100% and not notified yet
        if (percentageSpent >= 100 && !exceededAlertSent) {
            console.log(`You have exceeded your budget for ${category}.`);

            // Send the email to the user or perform any other actions
            const mailOptions = {
                from: process.env.EMAIL_TEST,
                to: "rdarshan927@duck.com", // Replace with user's email
                subject: `Budget Limit Exceeded for ${category}`,
                text: `You have exceeded your budget for ${category}. Consider adjusting your spending.`,
            };

            console.log("Email sent!")
            await transporter.sendMail(mailOptions);

            // Mark as exceeded
            budget.exceededAlertSent = true;
            await budget.save();
        }
    }
};


const LOW_BALANCE_THRESHOLD = 1000; // Set the threshold amount (LKR)

const checkLowBalances = async () => {
    try {
        console.log("Checking low balances...");

        const users = await User.find();

        for (let user of users) {
            const transactions = await Transaction.find({ userId: user._id });

            // Calculate total balance (sum of all incomes - sum of all expenses)
            let totalIncome = 0, totalExpense = 0;

            transactions.forEach(txn => {
                if (txn.type === "income") {
                    totalIncome += txn.amount;
                } else if (txn.type === "expense") {
                    totalExpense += txn.amount;
                }
            });

            const balance = totalIncome - totalExpense;
            console.log(`User: ${user.email}, Balance: ${balance} LKR`);

            // Send alert if balance is below threshold
            if (balance < LOW_BALANCE_THRESHOLD && !user.lowBalanceAlertSent) {
                console.log(`Sending low balance alert to ${user.email}...`);

                const mailOptions = {
                    from: process.env.EMAIL_TEST,
                    to: user.email,
                    subject: "Low Balance Alert",
                    text: `Warning! Your account balance is below ${LOW_BALANCE_THRESHOLD} LKR. Consider reviewing your expenses.`,
                };

                await transporter.sendMail(mailOptions);

                // Update flag to avoid duplicate alerts
                user.lowBalanceAlertSent = true;
                await user.save();
            }

            // Reset flag if balance is restored
            if (balance >= LOW_BALANCE_THRESHOLD && user.lowBalanceAlertSent) {
                user.lowBalanceAlertSent = false;
                await user.save();
                console.log(`User ${user.email} balance restored. Alert reset.`);
            }
        }
    } catch (error) {
        console.error("Error checking low balances:", error);
    }
};

const sendBillReminders = async () => {
    const today = new Date();

    console.log("came inside send bills reminders!");
    
    // Find bills that need reminders
    const bills = await Bill.find({ status: "pending" });

    bills.forEach(async (bill) => {
        const reminderDate = new Date(bill.dueDate);
        reminderDate.setDate(reminderDate.getDate() - bill.reminderDaysBefore);

        if (today >= reminderDate && today <= bill.dueDate) {
            // Send email reminder
            const mailOptions = {
                from: process.env.EMAIL_TEST,
                to: "rdarshan927@duck.com", // Replace with the user's email
                subject: `Upcoming Bill Payment Reminder: ${bill.name}`,
                text: `Your bill for ${bill.name} of amount ${bill.amount} is due on ${bill.dueDate.toDateString()}. Please ensure timely payment.`,
            };

            console.log(`Reminder sent for bill: ${bill.name}`);
            await transporter.sendMail(mailOptions);
        }
    });
};

cron.schedule("* * * * *", sendBillReminders);

// Schedule the task to run every day at 6 AM
cron.schedule("* * * * *", checkLowBalances);

// Run the budget check daily at midnight
cron.schedule("* * * * *", checkBudgets);

module.exports = { checkBudgets, checkLowBalances, sendBillReminders };
