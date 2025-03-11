const request = require("supertest");
const app = require("../server"); // Adjust the path as necessary
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const Goal = require("../src/models/Goal");

jest.mock("../src/models/Goal");

let validToken;

beforeAll(async () => {
    // if (mongoose.connection.readyState === 0) {
    //     await mongoose.connect(process.env.MONGO_TEST_URI);
    // }
    beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_TEST_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
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

describe("Goal Management API", () => {
    test("should create a new financial goal", async () => {
        const mockGoal = {
            userId: "12345",
            name: "Save for Laptop",
            targetAmount: 1500,
            savedAmount: 0,
            deadline: "2025-12-31",
            allocationPercentage: 20,
        };

        jest.spyOn(Goal.prototype, "save").mockResolvedValue(mockGoal);

        const res = await request(app)
            .post("/api/goals/add")
            .send(mockGoal)
            .set("Authorization", `Bearer ${validToken}`);

        expect(res.statusCode).toBe(201);
        expect(res.body.name).toBe(mockGoal.name);
        expect(res.body.targetAmount).toBe(mockGoal.targetAmount);
    });

    test("should fetch all goals for the user", async () => {
        const mockGoals = [
            { id: "1", userId: "12345", name: "Save for Laptop", targetAmount: 1500, savedAmount: 500 },
        ];

        jest.spyOn(Goal, "find").mockResolvedValue(mockGoals);

        const res = await request(app)
            .get("/api/goals/get")
            .set("Authorization", `Bearer ${validToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].name).toBe("Save for Laptop");
    });

    test("should update goal progress", async () => {
        const goalId = "1";
        const mockGoal = { _id: goalId, userId: "12345", savedAmount: 500, save: jest.fn().mockResolvedValue() };

        jest.spyOn(Goal, "findOne").mockResolvedValue(mockGoal);

        const res = await request(app)
            .patch(`/api/goals/edit/${goalId}`)
            .send({ amount: 200 })
            .set("Authorization", `Bearer ${validToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Goal progress updated");
    });

    test("should delete a goal", async () => {
        const goalId = "1";
        jest.spyOn(Goal, "deleteOne").mockResolvedValue({ deletedCount: 1 });

        const res = await request(app)
            .delete(`/api/goals/delete/${goalId}`)
            .set("Authorization", `Bearer ${validToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Goal deleted successfully");
    });
});
