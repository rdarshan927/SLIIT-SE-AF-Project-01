const request = require('supertest');
const app = require('../server');

let token;
let budgetId;

beforeAll(async () => {
    const loginRes = await request(app).post('/api/auth/login').send({
        email: 'testuser@example.com',
        password: 'password123',
    });
    token = loginRes.body.token;
});

describe('Budget API Tests', () => {
    test('Create Budget', async () => {
        const res = await request(app)
            .post('/api/budgets')
            .set('Authorization', `Bearer ${token}`)
            .send({
                category: 'Food',
                limit: 200,
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('_id');
        budgetId = res.body._id;
    });

    test('Get Budgets', async () => {
        const res = await request(app)
            .get('/api/budgets')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('Delete Budget', async () => {
        const res = await request(app)
            .delete(`/api/budgets/${budgetId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
    });
});
