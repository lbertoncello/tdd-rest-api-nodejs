const request = require('supertest');
const app = require('../../src/app');

test('Deve listar todos os usuários', () => {
	return request(app).get('/user').
		then((res) => {
			expect(res.statusCode).toBe(200);
			expect(res.body.length).toBeGreaterThanOrEqual(0);
		});
});

test('Deve inserir usuário com sucesso', () => {
	const mail = `${Date.now()}@mail.com`;

	return request(app).post('/user').
		send({
			name: 'Walter Mitty',
			mail: mail,
			passwd: 'abc123',
		}).
		then((res) => {
			expect(res.status).toBe(201);
			expect(res.body.name).toBe('Walter Mitty');
		});
});

test('Não deve inserir usuário sem nome', () => {
	const mail = `${Date.now()}@mail.com`;

	return request(app).post('/user').
		send({
			mail: mail,
			passwd: 'abc123',
		}).
		then((res) => {
			expect(res.status).toBe(400);
			expect(res.body.error).toBe('Nome é um atributo obrigatório.');
		});
});
