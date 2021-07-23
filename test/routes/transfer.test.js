const request = require('supertest');

const app = require('../../src/app');

const secret = 'lHPj07alu7dpP4vofTB5YAwwJ1iCtnq0';
const MAIN_ROUTE = '/v1/transfer';
// eslint-disable-next-line max-len
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAsIm5hbWUiOiJVc2VyICMxIiwibWFpbCI6InVzZXIxQG1haWwuY29tIn0.JxmB9rAF1oIKC3UetgVxyNeNjflOEDdA5jE_TCM_0dQ';

beforeAll(async () => {
	await app.db.seed.run();
});

afterAll(async () => {
	await app.db.destroy();
});

test('Devo listar apenas as transferências do usuário', async () => {
	const res = await request(app).
		get(MAIN_ROUTE).
		set('Authorization', `Bearer ${TOKEN}`);

	expect(res.status).toBe(200);
	expect(res.body).toHaveLength(1);
	expect(res.body[0].description).toBe('Transfer #1');
});
