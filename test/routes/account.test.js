const request = require('supertest');
const jwt = require('jwt-simple');

const app = require('../../src/app');

const secret = 'lHPj07alu7dpP4vofTB5YAwwJ1iCtnq0';
const MAIN_ROUTE = '/v1/account';
let user;

beforeAll(async () => {
	const res = await app.services.user.save({
		name: 'User Account',
		mail: `${Date.now()}@mail.com`,
		passwd: 'abc123',
	});

	user = { ...res[0] };
	user.token = jwt.encode(user, secret);
});

afterAll(async () => {
	await app.db.destroy();
});

test('Deve inserir uma conta com sucesso', () => {
	return request(app).
		post(MAIN_ROUTE).
		set('Authorization', `Bearer ${user.token}`).
		send({
			name: 'Acc #1',
			user_id: user.id,
		}).
		then((res) => {
			expect(res.status).toBe(201);
			expect(res.body.name).toBe('Acc #1');
		});
});

test('Não deve inserir uma conta sem nome', () => {
	return request(app).
		post(MAIN_ROUTE).
		set('Authorization', `Bearer ${user.token}`).
		send({
			user_id: user.id,
		}).
		then((res) => {
			expect(res.status).toBe(400);
			expect(res.body.error).toBe('"name" é um atributo obrigatório.');
		});
});

test.skip(
	'Não deve inserir uma conta de nome duplicado para o mesmo usuário',
	() => {
		return null;
	},
);

test('Deve listar todas as contas', async () => {
	await app.db('accounts').insert({
		name: 'Acc list',
		user_id: user.id,
	});

	const res = await request(app).
		get(MAIN_ROUTE).
		set('Authorization', `Bearer ${user.token}`);

	expect(res.status).toBe(200);
	expect(res.body.length).toBeGreaterThan(0);
});

test.skip('Deve listar apenas as contas do usuário', () => {
	return null;
});

test('Deve retornar uma conta por id', async () => {
	const account = await app.db('accounts').
		insert({
			name: 'Acc By Id',
			user_id: user.id,
		}, [ 'id' ]);

	const res = await request(app).
		get(`${MAIN_ROUTE}/${account[0].id}`).
		set('Authorization', `Bearer ${user.token}`);

	expect(res.status).toBe(200);
	expect(res.body.name).toBe('Acc By Id');
	expect(res.body.user_id).toBe(user.id);
});

test.skip('Não deve retornar uma conta de outro usuário', () => {
	return null;
});

test('Deve alterar uma conta', async () => {
	const account = await app.db('accounts').
		insert({
			name: 'Acc To Update',
			user_id: user.id,
		}, [ 'id' ]);

	const res = await request(app).
		put(`${MAIN_ROUTE}/${account[0].id}`).
		set('Authorization', `Bearer ${user.token}`).
		send({ name: 'Acc Updated' });

	expect(res.status).toBe(200);
	expect(res.body.name).toBe('Acc Updated');
});

test.skip('Não deve alterar uma conta de outro usuário', () => {
	return null;
});

test('Devo remover uma conta', async () => {
	const account = await app.db('accounts').
		insert({
			name: 'Acc To Remove',
			user_id: user.id,
		}, [ 'id' ]);

	const res = await request(app).
		delete(`${MAIN_ROUTE}/${account[0].id}`).
		set('Authorization', `Bearer ${user.token}`);

	expect(res.status).toBe(204);
});

test.skip('Não deve deletar uma conta de outro usuário', () => {
	return null;
});
