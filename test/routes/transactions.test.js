const request = require('supertest');
const jwt = require('jwt-simple');

const app = require('../../src/app');

const secret = 'lHPj07alu7dpP4vofTB5YAwwJ1iCtnq0';
const MAIN_ROUTE = '/v1/transactions';

let user1;
let user2;
let accountUser1;
let accountUser2;

beforeAll(async () => {
	await app.db('transactions').del();
	await app.db('accounts').del();
	await app.db('users').del();

	const users = await app.db('users').insert([
		{
			name: 'User #1',
			mail: 'user1@mail.com',
			passwd:
                '$2a$10$vTdLjqC9Op/qqsGq94YGqecljMYPm.xSWK.6J7LHNifN/WZUMOgbq',
		},
		{
			name: 'User #2',
			mail: 'user2@mail.com',
			passwd:
                '$2a$10$vTdLjqC9Op/qqsGq94YGqecljMYPm.xSWK.6J7LHNifN/WZUMOgbq',
		},
	], '*');

	[ user1, user2 ] = users;
	delete user1.passwd;
	user1.token = jwt.encode(user1, secret);

	const accounts = await app.db('accounts').insert([
		{
			name: 'Acc #1',
			user_id: user1.id,
		},
		{
			name: 'Acc #2',
			user_id: user2.id,
		},
	], '*');

	[ accountUser1, accountUser2 ] = accounts;
});

afterAll(async () => {
	await app.db.destroy();
});

test('Deve listar apenas as transações do usuário', async () => {
	await app.db('transactions').insert([
		{
			description: 'T1',
			date: new Date(),
			ammount: 100,
			type: 'I',
			acc_id: accountUser1.id,
		},
		{
			description: 'T2',
			date: new Date(),
			ammount: 300,
			type: 'O',
			acc_id: accountUser2.id,
		},
	]);

	const res = await request(app).
		get(MAIN_ROUTE).
		set('Authorization', `Bearer ${user1.token}`);

	expect(res.status).toBe(200);
	expect(res.body).toHaveLength(1);
	expect(res.body[0].description).toBe('T1');
});

test('Deve inserir uma transação com sucesso', async () => {
	const res = await request(app).
		post(MAIN_ROUTE).
		set('Authorization', `Bearer ${user1.token}`).
		send({
			description: 'New T',
			date: new Date(),
			ammount: 100,
			type: 'I',
			acc_id: accountUser1.id,
		});

	expect(res.status).toBe(201);
	expect(res.body.acc_id).toBe(accountUser1.id);
	expect(res.body.ammount).toBe('100.00');
});

test('Transações de entrada devem ser positivas', async () => {
	const res = await request(app).
		post(MAIN_ROUTE).
		set('Authorization', `Bearer ${user1.token}`).
		send({
			description: 'New T',
			date: new Date(),
			ammount: -100,
			type: 'I',
			acc_id: accountUser1.id,
		});

	expect(res.status).toBe(201);
	expect(res.body.acc_id).toBe(accountUser1.id);
	expect(res.body.ammount).toBe('100.00');
});

test('Transações de saída devem ser negativas', async () => {
	const res = await request(app).
		post(MAIN_ROUTE).
		set('Authorization', `Bearer ${user1.token}`).
		send({
			description: 'New T',
			date: new Date(),
			ammount: 100,
			type: 'O',
			acc_id: accountUser1.id,
		});

	expect(res.status).toBe(201);
	expect(res.body.acc_id).toBe(accountUser1.id);
	expect(res.body.ammount).toBe('-100.00');
});

describe('Ao tentar inserir uma transação válida', () => {
	let validTransaction;

	beforeAll(() => {
		validTransaction = {
			description: 'New T',
			date: new Date(),
			ammount: 100,
			type: 'I',
			acc_id: accountUser1.id,
		};
	});

	const testTemplate = async (newData, errorMessage) => {
		const res = await request(app).
			post(MAIN_ROUTE).
			set('Authorization', `Bearer ${user1.token}`).
			send({
				...validTransaction,
				...newData,
			});

		expect(res.status).toBe(400);
		expect(res.body.error).toBe(errorMessage);
	};

	test(
		'Não deve inserir uma transação sem descrição',
		() => testTemplate(
			{ description: null },
			'Descrição é um atributo obrigatório.',
		),
	);

	test(
		'Não deve inserir uma transação sem valor',
		() => testTemplate(
			{ ammount: null },
			'Valor é um atributo obrigatório.',
		),
	);

	test(
		'Não deve inserir uma transação sem data',
		() => testTemplate(
			{ date: null },
			'Data é um atributo obrigatório.',
		),
	);

	test(
		'Não deve inserir uma transação sem conta',
		() => testTemplate(
			{ acc_id: null },
			'Conta é um atributo obrigatório.',
		),
	);

	test(
		'Não deve inserir uma transação sem tipo',
		() => testTemplate(
			{ type: null },
			'Tipo é um atributo obrigatório.',
		),
	);

	test(
		'Não deve inserir uma transação com tipo inválido',
		() => testTemplate(
			{ type: 'A' },
			'Tipo inválido.',
		),
	);
});

test('Deve retornar uma transação por ID', async () => {
	const data = await app.db('transactions').insert({
		description: 'T ID',
		date: new Date(),
		ammount: 100,
		type: 'I',
		acc_id: accountUser1.id,
	}, [ 'id' ]);

	const res = await request(app).
		get(`${MAIN_ROUTE}/${data[0].id}`).
		set('Authorization', `Bearer ${user1.token}`);

	expect(res.status).toBe(200);
	expect(res.body.id).toBe(data[0].id);
	expect(res.body.description).toBe('T ID');
});

test('Não devo retornar uma transação de outro usuário', async () => {
	const data = await app.db('transactions').insert({
		description: 'T ID',
		date: new Date(),
		ammount: 100,
		type: 'I',
		acc_id: accountUser2.id,
	}, [ 'id' ]);

	const res = await request(app).
		get(`${MAIN_ROUTE}/${data[0].id}`).
		set('Authorization', `Bearer ${user1.token}`);

	expect(res.status).toBe(403);
	expect(res.body.error).toBe('Este recurso não pertecene ao usuário.');
});

test('Devo alterar uma transação', async () => {
	const data = await app.db('transactions').insert({
		description: 'T old',
		date: new Date(),
		ammount: 100,
		type: 'I',
		acc_id: accountUser1.id,
	}, [ 'id' ]);

	const res = await request(app).
		put(`${MAIN_ROUTE}/${data[0].id}`).
		set('Authorization', `Bearer ${user1.token}`).
		send({
			description: 'T updated',
		});

	expect(res.status).toBe(200);
	expect(res.body.description).toBe('T updated');
});

test('Não Devo alterar uma transação de outro usuário', async () => {
	const data = await app.db('transactions').insert({
		description: 'T old',
		date: new Date(),
		ammount: 100,
		type: 'I',
		acc_id: accountUser2.id,
	}, [ 'id' ]);

	const res = await request(app).
		put(`${MAIN_ROUTE}/${data[0].id}`).
		set('Authorization', `Bearer ${user1.token}`).
		send({
			description: 'T updated',
		});

	expect(res.status).toBe(403);
	expect(res.body.error).toBe('Este recurso não pertecene ao usuário.');
});

test('Devo remover uma transação', async () => {
	const data = await app.db('transactions').insert({
		description: 'T delete',
		date: new Date(),
		ammount: 100,
		type: 'I',
		acc_id: accountUser1.id,
	}, [ 'id' ]);

	const res = await request(app).
		delete(`${MAIN_ROUTE}/${data[0].id}`).
		set('Authorization', `Bearer ${user1.token}`);

	expect(res.status).toBe(204);
});

test('Não deve remover uma transação de outro usuário', async () => {
	const data = await app.db('transactions').insert({
		description: 'T delete',
		date: new Date(),
		ammount: 100,
		type: 'I',
		acc_id: accountUser2.id,
	}, [ 'id' ]);

	const res = await request(app).
		delete(`${MAIN_ROUTE}/${data[0].id}`).
		set('Authorization', `Bearer ${user1.token}`);

	expect(res.status).toBe(403);
	expect(res.body.error).toBe('Este recurso não pertecene ao usuário.');
});

test('Não deve remover conta com transação', async () => {
	await app.db('transactions').insert({
		description: 'T delete',
		date: new Date(),
		ammount: 100,
		type: 'I',
		acc_id: accountUser1.id,
	}, [ 'id' ]);

	const res = await request(app).
		delete(`/v1/account/${accountUser1.id}`).
		set('Authorization', `Bearer ${user1.token}`);

	expect(res.status).toBe(400);
	expect(res.body.error).toBe('Essa conta possui transações associadas.');
});
