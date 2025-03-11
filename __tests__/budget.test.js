const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const app = require("../server"); // Adjust the path if needed
const Budget = require("../src/models/Budget");

jest.mock("../src/models/Budget");

let validToken;

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_TEST_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    validToken = jwt.sign(
        { id: "12345", role: "user" },
        process.env.JWT_SECRET || "testsecret",
        { expiresIn: "1h" }
    );
});

afterAll(async () => {
    await mongoose.connection.close();
    jest.clearAllMocks();
});

describe("Budget Management API", () => {
    test("should create a new budget", async () => {
        const mockBudget = {
            _id: "budget123",
            userId: "12345",
            category: "Food",
            limit: 500,
            spent: 0,
        };

        Budget.prototype.save = jest.fn().mockResolvedValue(mockBudget);

        const res = await request(app)
            .post("/api/budgets/add")
            .send({ category: "Food", limit: 500 })
            .set("Authorization", `Bearer ${validToken}`);

        expect(res.status).toBe(201);
        expect(res.body.budget.category).toBe(mockBudget.category);
        expect(res.body.budget.limit).toBe(mockBudget.limit);
    });

    test("should fetch all budgets for the user", async () => {
        const mockBudgets = [
            { _id: "budget123", userId: "12345", category: "Food", limit: 500, spent: 50 },
        ];

        Budget.find.mockResolvedValue(mockBudgets);

        const res = await request(app)
            .get("/api/budgets/get")
            .set("Authorization", `Bearer ${validToken}`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].category).toBe("Food");
    });

    test("should update a budget", async () => {
        const budgetId = "budget123";
        const mockBudget = { _id: budgetId, userId: "12345", category: "Food", limit: 500, save: jest.fn().mockResolvedValue() };

        Budget.findOne.mockResolvedValue(mockBudget);

        const res = await request(app)
            .put(`/api/budgets/update/${budgetId}`)
            .send({ category: "Groceries", limit: 600 })
            .set("Authorization", `Bearer ${validToken}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Budget updated successfully");
    });

    test("should delete a budget", async () => {
        const budgetId = "budget123";
        Budget.deleteOne.mockResolvedValue({ deletedCount: 1 });

        const res = await request(app)
            .delete(`/api/budgets/delete/${budgetId}`)
            .set("Authorization", `Bearer ${validToken}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Budget deleted successfully");
    });
});
