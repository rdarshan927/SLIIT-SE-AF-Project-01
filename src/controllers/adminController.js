const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Category = require("../models/Category");
const Limit = require("../models/Limit");

const createUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        if (!username || !email || !password || !role) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword, role });

        await newUser.save();
        res.status(201).json({ message: "User created successfully", user: newUser });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// ✅ Update User Details
const updateUser = async (req, res) => {
    try {
        const { username, email, role } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) return res.status(404).json({ message: "User not found" });

        user.username = username || user.username;
        user.email = email || user.email;
        user.role = role || user.role;

        await user.save();
        res.json({ message: "User updated successfully", user });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// const updateUser = async (req, res) => {
//     try {
//         const { email, role } = req.body;
//         const user = await User.findById(req.params.id);
//         if (!user) return res.status(404).json({ message: "User not found" });

//         if (email) user.email = email;
//         if (role) user.role = role;

//         await user.save();
//         res.json({ message: "User updated successfully", user });
//     } catch (error) {
//         res.status(500).json({ message: "Server error", error });
//     }
// };

const getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find().populate("userId", "username email");
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

const getReport = async (req, res) => {
    try {
        const userId = req.user.id;

        // Aggregate transactions
        const transactions = await Transaction.aggregate([
            { $match: { userId: mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: null,
                    totalIncome: {
                        $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] }
                    },
                    totalExpense: {
                        $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] }
                    },
                }
            }
        ]);

        const balance = transactions[0].totalIncome - transactions[0].totalExpense;

        res.json({ totalIncome: transactions[0].totalIncome, totalExpense: transactions[0].totalExpense, balance });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// ➕ Add a new category
const addCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) return res.status(400).json({ message: "Category already exists" });

        const category = new Category({ name });
        await category.save();
        res.json({ message: "Category added successfully", category });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// ✏️ Update a category
const updateCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: "Category not found" });

        category.name = name;
        await category.save();
        res.json({ message: "Category updated successfully", category });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// ❌ Delete a category
const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: "Category not found" });

        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: "Category deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

const setLimit = async (req, res) => {
    try {
        const { category, maxAmount } = req.body;
        const userId = req.user.id;

        if (!category || !maxAmount) {
            return res.status(400).json({ message: "Category and max amount are required" });
        }

        let limit = await Limit.findOne({ userId, category });

        if (limit) {
            limit.maxAmount = maxAmount;
        } else {
            limit = new Limit({ userId, category, maxAmount });
        }

        await limit.save();
        res.json({ message: "Limit updated", limit });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// ✅ Get All Limits
const getLimits = async (req, res) => {
    try {
        const limits = await Limit.find({ userId: req.user.id });
        res.json(limits);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};


module.exports = { createUser, getAllUsers, getAllTransactions, getReport, deleteUser, updateUser, addCategory, updateCategory, deleteCategory, setLimit, getLimits };
