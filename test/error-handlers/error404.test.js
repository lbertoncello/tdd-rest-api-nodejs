const request = require('supertest');
const app = require('../../src/app');

const MAIN_ROUTE = '/naoexiste';

test('Não devo permitir rotas inexistentes', () => {
	return request(app).
		get(MAIN_ROUTE).
		then((res) => {
			expect(res.status).toBe(404);
			expect(res.body.error).toBe('NOT FOUND');
		});
});
