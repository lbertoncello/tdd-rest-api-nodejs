const request = require('supertest');
const moment = require('moment');

const app = require('../../src/app');

const MAIN_ROUTE = '/v1/balance';
const TRANSACTION_ROUTE = '/v1/transaction';
const TRANSFER_ROUTE = '/v1/transfer';
// eslint-disable-next-line max-len
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAxMDAsIm5hbWUiOiJVc2VyICMzIiwibWFpbCI6InVzZXIzQG1haWwuY29tIn0.7p_faGt0b_LQ9Sf-Tyl2b3-sGEaK8nB_8lFsmzeaGIY';
// eslint-disable-next-line max-len
const COMMON_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAxMDIsIm5hbWUiOiJVc2VyICM1IiwibWFpbCI6InVzZXI1QG1haWwuY29tIn0.h0RaxCmJPo6QkMT2a4DTg1LM7dn4bAh41VKjEQ9uQrY';

beforeAll(async () => {
	await app.db.seed.run();
});

afterAll(async () => {
	await app.db.destroy();
});

describe('Ao calcular o saldo do usuário...', () => {
	test('Deve retornar apenas as contas com alguma transação', async () => {
		const res = await request(app).
			get(MAIN_ROUTE).
			set('Authorization', `Bearer ${TOKEN}`);

		expect(res.status).toBe(200);
		expect(res.body).toHaveLength(0);
	});

	test('Deve somar valores de entrada', async () => {
		const a = await request(app).
			post(TRANSACTION_ROUTE).
			set('Authorization', `Bearer ${TOKEN}`).
			send({
				description: '1',
				date: new Date(),
				ammount: 100,
				type: 'I',
				acc_id: 10100,
				status: true,
			});

		const res = await request(app).
			get(MAIN_ROUTE).
			set('Authorization', `Bearer ${TOKEN}`);

		expect(res.status).toBe(200);
		expect(res.body).toHaveLength(1);
		expect(res.body[0].id).toBe(10100);
		expect(res.body[0].sum).toBe('100.00');
	});

	test('Deve substrair valores de saída', async () => {
		await request(app).
			post(TRANSACTION_ROUTE).
			set('Authorization', `Bearer ${TOKEN}`).
			send({
				description: '1',
				date: new Date(),
				ammount: 200,
				type: 'O',
				acc_id: 10100,
				status: true,
			});

		const res = await request(app).
			get(MAIN_ROUTE).
			set('Authorization', `Bearer ${TOKEN}`);

		expect(res.status).toBe(200);
		expect(res.body).toHaveLength(1);
		expect(res.body[0].id).toBe(10100);
		expect(res.body[0].sum).toBe('-100.00');
	});

	test('Não deve considerar transações pendentes', async () => {
		await request(app).
			post(TRANSACTION_ROUTE).
			set('Authorization', `Bearer ${TOKEN}`).
			send({
				description: '1',
				date: new Date(),
				ammount: 200,
				type: 'O',
				acc_id: 10100,
				status: false,
			});

		const res = await request(app).
			get(MAIN_ROUTE).
			set('Authorization', `Bearer ${TOKEN}`);

		expect(res.status).toBe(200);
		expect(res.body).toHaveLength(1);
		expect(res.body[0].id).toBe(10100);
		expect(res.body[0].sum).toBe('-100.00');
	});

	test('Não deve considerar saldo de contas distintas', async () => {
		await request(app).
			post(TRANSACTION_ROUTE).
			set('Authorization', `Bearer ${TOKEN}`).
			send({
				description: '1',
				date: new Date(),
				ammount: 50,
				type: 'I',
				acc_id: 10101,
				status: true,
			});

		const res = await request(app).
			get(MAIN_ROUTE).
			set('Authorization', `Bearer ${TOKEN}`);

		expect(res.status).toBe(200);
		expect(res.body).toHaveLength(2);
		expect(res.body[0].id).toBe(10100);
		expect(res.body[0].sum).toBe('-100.00');
		expect(res.body[1].id).toBe(10101);
		expect(res.body[1].sum).toBe('50.00');
	});

	test('Não deve considerar contas de outros usuários', async () => {
		await request(app).
			post(TRANSACTION_ROUTE).
			set('Authorization', `Bearer ${TOKEN}`).
			send({
				description: '1',
				date: new Date(),
				ammount: 200,
				type: 'O',
				acc_id: 10102,
				status: true,
			});

		const res = await request(app).
			get(MAIN_ROUTE).
			set('Authorization', `Bearer ${TOKEN}`);

		expect(res.status).toBe(200);
		expect(res.body).toHaveLength(2);
		expect(res.body[0].id).toBe(10100);
		expect(res.body[0].sum).toBe('-100.00');
		expect(res.body[1].id).toBe(10101);
		expect(res.body[1].sum).toBe('50.00');
	});

	test('Deve considerar uma transação passada', async () => {
		await request(app).
			post(TRANSACTION_ROUTE).
			set('Authorization', `Bearer ${TOKEN}`).
			send({
				description: '1',
				date: moment().subtract({ days: 5 }),
				ammount: 250,
				type: 'I',
				acc_id: 10100,
				status: true,
			});

		const res = await request(app).
			get(MAIN_ROUTE).
			set('Authorization', `Bearer ${TOKEN}`);

		expect(res.status).toBe(200);
		expect(res.body).toHaveLength(2);
		expect(res.body[0].id).toBe(10100);
		expect(res.body[0].sum).toBe('150.00');
		expect(res.body[1].id).toBe(10101);
		expect(res.body[1].sum).toBe('50.00');
	});

	test('Não deve considerar uma transação futura', async () => {
		await request(app).
			post(TRANSACTION_ROUTE).
			set('Authorization', `Bearer ${TOKEN}`).
			send({
				description: '1',
				date: moment().add({ days: 5 }),
				ammount: 250,
				type: 'I',
				acc_id: 10100,
				status: true,
			});

		const res = await request(app).
			get(MAIN_ROUTE).
			set('Authorization', `Bearer ${TOKEN}`);

		expect(res.status).toBe(200);
		expect(res.body).toHaveLength(2);
		expect(res.body[0].id).toBe(10100);
		expect(res.body[0].sum).toBe('150.00');
		expect(res.body[1].id).toBe(10101);
		expect(res.body[1].sum).toBe('50.00');
	});

	test('Deve considerar transferências', async () => {
		await request(app).
			post(TRANSFER_ROUTE).
			set('Authorization', `Bearer ${TOKEN}`).
			send({
				description: '1',
				date: new Date(),
				ammount: 250,
				acc_ori_id: 10100,
				acc_dest_id: 10101,
			});

		const res = await request(app).
			get(MAIN_ROUTE).
			set('Authorization', `Bearer ${TOKEN}`);

		expect(res.status).toBe(200);
		expect(res.body).toHaveLength(2);
		expect(res.body[0].id).toBe(10100);
		expect(res.body[0].sum).toBe('-100.00');
		expect(res.body[1].id).toBe(10101);
		expect(res.body[1].sum).toBe('300.00');
	});
});

test('Deve calcular saldo das contas do usuário', async () => {
	const res = await request(app).
		get(MAIN_ROUTE).
		set('Authorization', `Bearer ${COMMON_TOKEN}`);

	expect(res.status).toBe(200);
	expect(res.body).toHaveLength(2);
	expect(res.body[0].id).toBe(10104);
	expect(res.body[0].sum).toBe('162.00');
	expect(res.body[1].id).toBe(10105);
	expect(res.body[1].sum).toBe('-248.00');
});
