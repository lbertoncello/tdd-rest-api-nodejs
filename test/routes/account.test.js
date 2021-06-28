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


test('Deve listar todas as contas', async () => {
	await app.db('accounts').insert({
		name: 'Acc list',
		user_id: user.id,
	});

	const res = await request(app).
		get(MAIN_ROUTE);

	expect(res.status).toBe(200);
	expect(res.body.length).toBeGreaterThan(0);
});

afterAll(async () => {
	await app.db.destroy();
});
