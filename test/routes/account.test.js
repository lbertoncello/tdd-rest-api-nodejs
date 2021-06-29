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

afterAll(async () => {
	await app.db.destroy();
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


test('Deve retornar uma conta por id', async () => {
	const account = await app.db('accounts').
		insert({
			name: 'Acc By Id',
			user_id: user.id,
		}, [ 'id' ]);

	const res = await request(app).
		get(`${MAIN_ROUTE}/${account[0].id}`);

	expect(res.status).toBe(200);
	expect(res.body.name).toBe('Acc By Id');
	expect(res.body.user_id).toBe(user.id);
});

test('Deve alterar uma conta', async () => {
	const account = await app.db('accounts').
		insert({
			name: 'Acc To Update',
			user_id: user.id,
		}, [ 'id' ]);

	const res = await request(app).
		put(`${MAIN_ROUTE}/${account[0].id}`).
		send({ name: 'Acc Updated' });

	expect(res.status).toBe(200);
	expect(res.body.name).toBe('Acc Updated');
});

test('Devo remover uma conta', async () => {
	const account = await app.db('accounts').
		insert({
			name: 'Acc To Remove',
			user_id: user.id,
		}, [ 'id' ]);

	const res = await request(app).
		delete(`${MAIN_ROUTE}/${account[0].id}`);

	expect(res.status).toBe(204);
});
