const request = require('supertest');

const app = require('../../src/app');

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

test('Deve inserir uma transferência com sucesso', async () => {
	const res = await request(app).
		post(MAIN_ROUTE).
		set('Authorization', `Bearer ${TOKEN}`).
		send({
			description: 'Regular Transfer',
			user_id: 10000,
			acc_ori_id: 10000,
			acc_dest_id: 10001,
			ammount: 100,
			date: new Date(),
		});

	expect(res.status).toBe(201);
	expect(res.body.description).toBe('Regular Transfer');

	const transactions = await app.db('transactions').
		where({ transfer_id: res.body.id });

	expect(transactions).toHaveLength(2);
	expect(transactions[0].description).toBe('Transfer to acc #10001');
	expect(transactions[0].ammount).toBe('-100.00');
	expect(transactions[0].acc_id).toBe(10000);
	expect(transactions[1].description).toBe('Transfer from acc #10000');
	expect(transactions[1].ammount).toBe('100.00');
	expect(transactions[1].acc_id).toBe(10001);
});


describe('Ao salvar uma transferência válida...', () => {
	let transferId;
	let income;
	let outcome;

	test('Deve retornar o status 201 e os dados da transferência', async () => {
		const res = await request(app).
			post(MAIN_ROUTE).
			set('Authorization', `Bearer ${TOKEN}`).
			send({
				description: 'Regular Transfer',
				user_id: 10000,
				acc_ori_id: 10000,
				acc_dest_id: 10001,
				ammount: 100,
				date: new Date(),
			});

		transferId = res.body.id;

		expect(res.status).toBe(201);
		expect(res.body.description).toBe('Regular Transfer');
	});

	test('As transações equivalentes devem ter sido geradas', async () => {
		const transactions = await app.db('transactions').
			where({ transfer_id: transferId }).
			orderBy('ammount');

		expect(transactions).toHaveLength(2);

		[ outcome, income ] = transactions;
	});

	test('A transação de saída deve ser negativa', () => {
		expect(outcome.description).toBe('Transfer to acc #10001');
		expect(outcome.ammount).toBe('-100.00');
		expect(outcome.acc_id).toBe(10000);
		expect(outcome.type).toBe('O');
	});

	test('A transação de entrada deve ser positiva', () => {
		expect(income.description).toBe('Transfer from acc #10000');
		expect(income.ammount).toBe('100.00');
		expect(income.acc_id).toBe(10001);
		expect(income.type).toBe('I');
	});

	test('Ambas devem referenciar a transferência que as originou', () => {
		expect(income.transfer_id).toBe(transferId);
		expect(outcome.transfer_id).toBe(transferId);
	});
});

describe('Ao tentar salvar uma transferência inválida...', () => {
	let validTransfer;

	beforeAll(() => {
		validTransfer = {
			description: 'Valid Transfer',
			user_id: 10000,
			acc_ori_id: 10000,
			acc_dest_id: 10001,
			ammount: 100,
			date: new Date(),
		};
	});

	const testTemplate = async (newData, errorMessage) => {
		const res = await request(app).
			post(MAIN_ROUTE).
			set('Authorization', `Bearer ${TOKEN}`).
			send({
				...validTransfer,
				...newData,
			});

		expect(res.status).toBe(400);
		expect(res.body.error).toBe(errorMessage);
	};

	test(
		'Não deve inserir sem descrição',
		() => testTemplate(
			{ description: null },
			'Descrição é um atributo obrigatório.',
		),
	);

	test(
		'Não deve inserir sem valor',
		() => testTemplate(
			{ ammount: null },
			'Valor é um atributo obrigatório.',
		),
	);

	test(
		'Não deve inserir sem data',
		() => testTemplate(
			{ date: null },
			'Data é um atributo obrigatório.',
		),
	);

	test(
		'Não deve inserir sem conta de origem',
		() => testTemplate(
			{ acc_ori_id: null },
			'ID da conta de origem é um atributo obrigatório.',
		),
	);

	test(
		'Não deve inserir sem conta de destino',
		() => testTemplate(
			{ acc_dest_id: null },
			'ID da conta de destino é um atributo obrigatório.',
		),
	);

	test(
		'Não deve inserir se as contas de origem e destino forem as mesmas',
		() => testTemplate(
			{
				acc_dest_id: 10000,
			},
			'Não é possível transferir de uma conta' +
				'para ela mesma.',
		),
	);

	test(
		'Não deve inserir se as contas pertencerem a outros usuários',
		() => testTemplate(
			{ acc_ori_id: 10002 },
			'Conta #10002 não pertence ao usuário.',
		),
	);
});

test('Deve retornar uma transferência por Id', async () => {
	const res = await request(app).
		get(`${MAIN_ROUTE}/10000`).
		set('Authorization', `Bearer ${TOKEN}`);

	expect(res.status).toBe(200);
	expect(res.body.description).toBe('Transfer #1');
});

describe('Ao alterar uma transferência válida...', () => {
	let transferId;
	let income;
	let outcome;

	test('Deve retornar o status 200 e os dados da transferência', async () => {
		const res = await request(app).
			put(`${MAIN_ROUTE}/10000`).
			set('Authorization', `Bearer ${TOKEN}`).
			send({
				description: 'Transfer Updated',
				user_id: 10000,
				acc_ori_id: 10000,
				acc_dest_id: 10001,
				ammount: 500,
				date: new Date(),
			});

		transferId = res.body.id;

		expect(res.status).toBe(200);
		expect(res.body.description).toBe('Transfer Updated');
		expect(res.body.ammount).toBe('500.00');
	});

	test('As transações equivalentes devem ter sido geradas', async () => {
		const transactions = await app.db('transactions').
			where({ transfer_id: transferId }).
			orderBy('ammount');

		expect(transactions).toHaveLength(2);

		[ outcome, income ] = transactions;
	});

	test('A transação de saída deve ser negativa', () => {
		expect(outcome.description).toBe('Transfer to acc #10001');
		expect(outcome.ammount).toBe('-500.00');
		expect(outcome.acc_id).toBe(10000);
		expect(outcome.type).toBe('O');
	});

	test('A transação de entrada deve ser positiva', () => {
		expect(income.description).toBe('Transfer from acc #10000');
		expect(income.ammount).toBe('500.00');
		expect(income.acc_id).toBe(10001);
		expect(income.type).toBe('I');
	});

	test('Ambas devem referenciar a transferência que as originou', () => {
		expect(income.transfer_id).toBe(transferId);
		expect(outcome.transfer_id).toBe(transferId);
	});
});
