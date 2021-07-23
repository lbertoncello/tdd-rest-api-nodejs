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
