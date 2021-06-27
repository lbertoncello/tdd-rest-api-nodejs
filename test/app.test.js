const supertest = require('supertest');

const app = require('../src/app');

test('Deve responder na raiz', () => {
	supertest(app).get('/').
		then((res) => {
			expect(res.status).toBe(200);
		});
});
