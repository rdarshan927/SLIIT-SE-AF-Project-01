const request = require('supertest');
const app = require('../server');

let token;
let transactionId;

beforeAll(async () => {
    // Login to get token
    const loginRes = await request(app).post('/api/auth/login').send({
        email: 'testuser@example.com',
        password: 'password123',
    });
    token = loginRes.body.token;
});

describe('Transaction API Tests', () => {
    test('Create Transaction', async () => {
        const res = await request(app)
            .post('/api/transactions')
            .set('Authorization', `Bearer ${token}`)
            .send({
                type: 'expense',
                amount: 50,
                category: 'Food',
                description: 'Lunch',
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('_id');
        transactionId = res.body._id;
    });

    test('Get Transactions', async () => {
        const res = await request(app)
            .get('/api/transactions')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('Update Transaction', async () => {
        const res = await request(app)
            .put(`/api/transactions/${transactionId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ amount: 60 });

        expect(res.statusCode).toBe(200);
    });

    test('Delete Transaction', async () => {
        const res = await request(app)
            .delete(`/api/transactions/${transactionId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
    });
});
