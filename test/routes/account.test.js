const request = require('supertest');
const jwt = require('jwt-simple');

const app = require('../../src/app');

const secret = 'lHPj07alu7dpP4vofTB5YAwwJ1iCtnq0';
const MAIN_ROUTE = '/v1/account';
let user;
let user2;

beforeAll(async () => {
	const res = await app.services.user.save({
		name: 'User Account',
		mail: `${Date.now()}@mail.com`,
		passwd: 'abc123',
	});

	user = { ...res[0] };
	user.token = jwt.encode(user, secret);

	const res2 = await app.services.user.save({
		name: 'User Account 2',
		mail: `${Date.now()}@mail.com`,
		passwd: 'abc123',
	});

	user2 = { ...res2[0] };
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
		send({}).
		then((res) => {
			expect(res.status).toBe(400);
			expect(res.body.error).toBe('"name" é um atributo obrigatório.');
		});
});

test(
	'Não deve inserir uma conta de nome duplicado para o mesmo usuário',
	async () => {
		await app.db('accounts').insert([
			{
				name: 'Acc Duplicada',
				user_id: user.id,
			},
		]);

		const res = await request(app).
			post(MAIN_ROUTE).
			set('Authorization', `Bearer ${user.token}`).
			send({ name: 'Acc Duplicada' });


		expect(res.status).toBe(400);
		expect(res.body.error).toBe('Já existe uma conta com este nome.');
	},
);

test('Deve listar apenas as contas do usuário', async () => {
	await app.db('transactions').del();
	await app.db('accounts').del();

	await app.db('accounts').insert([
		{
			name: 'Acc User #1',
			user_id: user.id,
		},
		{
			name: 'Acc User #2',
			user_id: user2.id,
		},
	]);

	const res = await request(app).
		get(MAIN_ROUTE).
		set('Authorization', `Bearer ${user.token}`);

	expect(res.status).toBe(200);
	expect(res.body.length).toBe(1);
	expect(res.body[0].name).toBe('Acc User #1');
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

test('Não deve retornar uma conta de outro usuário', async () => {
	const acc = await app.db('accounts').
		insert({
			name: 'Acc User #2',
			user_id: user2.id,
		}, [ 'id' ]);

	const res = await request(app).
		get(`${MAIN_ROUTE}/${acc[0].id}`).
		set('Authorization', `Bearer ${user.token}`);

	expect(res.status).toBe(403);
	expect(res.body.error).toBe('Este recurso não pertecene ao usuário.');
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

test('Não deve alterar uma conta de outro usuário', async () => {
	const acc = await app.db('accounts').
		insert({
			name: 'Acc User #2',
			user_id: user2.id,
		}, [ 'id' ]);

	const res = await request(app).
		put(`${MAIN_ROUTE}/${acc[0].id}`).
		set('Authorization', `Bearer ${user.token}`).
		send({ name: 'Acc Updated' });

	expect(res.status).toBe(403);
	expect(res.body.error).toBe('Este recurso não pertecene ao usuário.');
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

test('Não deve deletar uma conta de outro usuário', async () => {
	const acc = await app.db('accounts').
		insert({
			name: 'Acc User #2',
			user_id: user2.id,
		}, [ 'id' ]);

	const res = await request(app).
		delete(`${MAIN_ROUTE}/${acc[0].id}`).
		set('Authorization', `Bearer ${user.token}`);

	expect(res.status).toBe(403);
	expect(res.body.error).toBe('Este recurso não pertecene ao usuário.');
});
