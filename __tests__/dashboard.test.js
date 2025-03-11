const dotenv = require("dotenv");
dotenv.config({ path: ".env.test" });

const request = require("supertest");
const app = require("../server"); // Adjust path if needed
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../src/models/User");
const Transaction = require("../src/models/Transaction");
const Category = require("../src/models/Category");
const Limit = require("../src/models/Limit");

let validToken;

// Establish a single MongoDB connection before all tests
beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGO_TEST_URI);
    }

    validToken = jwt.sign(
        { id: "12345", role: "admin" },
        process.env.JWT_SECRET || "testsecret",
        { expiresIn: "1h" }
    );
});

// Close the connection properly after all tests
afterAll(async () => {
    await mongoose.connection.close();
    jest.clearAllMocks();
});

describe("User Management", () => {
    test("should create a user", async () => {
        const hashedPassword = await bcrypt.hash("password123", 10);
        jest.spyOn(User.prototype, "save").mockResolvedValue({
            username: "testuser",
            email: "test@example.com",
            role: "user",
        });

        const res = await request(app)
            .post("/api/auth/register")
            .send({ username: "testuser", email: "test@example.com", password: "password123", role: "user" });

        expect(res.statusCode).toBe(201);
        expect(res.body.message).toBe("User created successfully");
    });

    test("should fetch all users", async () => {
        jest.spyOn(User, "find").mockResolvedValue([{ id: "1", username: "testuser", email: "test@example.com" }]);

        const res = await request(app)
            .get("/api/auth/login")
            .set("Authorization", `Bearer ${validToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
    });

    // test("should delete a user", async () => {
    //     jest.spyOn(User, "findById").mockResolvedValue({ id: "1", username: "testuser" });
    //     jest.spyOn(User, "findByIdAndDelete").mockResolvedValue({});

    //     const res = await request(app)
    //         .delete("/api/auth/delete")
    //         .set("Authorization", `Bearer ${validToken}`);

    //     expect(res.statusCode).toBe(200);
    //     expect(res.body.message).toBe("User deleted successfully");
    // });
});

describe("Transaction Management", () => {
    test("should fetch all transactions", async () => {
        jest.spyOn(Transaction, "find").mockResolvedValue([
            { id: "1", userId: "123", amount: 500, type: "income" },
        ]);

        const res = await request(app)
            .get("/api/transactions")
            .set("Authorization", `Bearer ${validToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
    });
});

describe("Category Management", () => {
    test("should add a new category", async () => {
        jest.spyOn(Category, "findOne").mockResolvedValue(null);
        jest.spyOn(Category.prototype, "save").mockResolvedValue({
            id: "1",
            name: "Food",
        });

        const res = await request(app)
            .post("/api/categories")
            .send({ name: "Food" })
            .set("Authorization", `Bearer ${validToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Category added successfully");
    });

    test("should delete a category", async () => {
        jest.spyOn(Category, "findById").mockResolvedValue({ id: "1", name: "Food" });
        jest.spyOn(Category, "findByIdAndDelete").mockResolvedValue({});

        const res = await request(app)
            .delete("/api/categories/1")
            .set("Authorization", `Bearer ${validToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Category deleted successfully");
    });
});

describe("Budget Limit Management", () => {
    test("should set a limit", async () => {
        jest.spyOn(Limit, "findOne").mockResolvedValue(null);
        jest.spyOn(Limit.prototype, "save").mockResolvedValue({
            userId: "123",
            category: "Food",
            maxAmount: 1000,
        });

        const res = await request(app)
            .post("/api/limits")
            .send({ category: "Food", maxAmount: 1000 })
            .set("Authorization", `Bearer ${validToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Limit updated");
    });

    test("should get all limits", async () => {
        jest.spyOn(Limit, "find").mockResolvedValue([{ id: "1", category: "Food", maxAmount: 1000 }]);

        const res = await request(app)
            .get("/api/limits")
            .set("Authorization", `Bearer ${validToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
    });
});
