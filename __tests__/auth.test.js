const request = require('supertest');
const app = require('../server');

let token;

describe('Auth API Tests', () => {
    test('Register User', async () => {
        const res = await request(app).post('/api/auth/register').send({
            name: 'Test User',
            email: 'testuser@example.com',
            password: 'password123',
        });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('token');
    });

    test('Login User', async () => {
        const res = await request(app).post('/api/auth/login').send({
            email: 'testuser@example.com',
            password: 'password123',
        });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
        token = res.body.token;
    });

    test('Access Protected Route with JWT', async () => {
        const res = await request(app)
            .get('/api/protected-route')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
    });
});
