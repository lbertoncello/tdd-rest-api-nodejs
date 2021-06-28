const request = require('supertest');
const app = require('../../src/app');

const MAIN_ROUTE = '/account';
let user;

beforeAll(async () => {
	const res = await app.services.user.save({
		name: 'User Account',
		mail: `${Date.now()}@mail.com`,
		passwd: 'abc123',
	});

	user = { ...res[0] };
});

test('Deve inserir uma conta com sucesso', () => {
	return request(app).
		post(MAIN_ROUTE).
		send({
			name: 'Acc #1',
			user_id: user.id,
		}).
		then((res) => {
			expect(res.status).toBe(201);
			expect(res.body.name).toBe('Acc #1');
		});
});
