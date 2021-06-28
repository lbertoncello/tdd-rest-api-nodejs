const request = require('supertest');
const app = require('../../src/app');

const mail = `${Date.now()}@mail.com`;
const name = 'Walter Mitty';

test('Deve listar todos os usuários', () => {
	return request(app).
		get('/user').
		then((res) => {
			expect(res.statusCode).toBe(200);
			expect(res.body.length).toBeGreaterThanOrEqual(0);
		});
});

test('Deve inserir usuário com sucesso', () => {
	return request(app).
		post('/user').
		send({
			name: name,
			mail: mail,
			passwd: 'abc123',
		}).
		then((res) => {
			expect(res.status).toBe(201);
			expect(res.body.name).toBe(name);
		});
});

test('Não deve inserir usuário sem nome', () => {
	return request(app).
		post('/user').
		send({
			mail: mail,
			passwd: 'abc123',
		}).
		then((res) => {
			expect(res.status).toBe(400);
			expect(res.body.error).toBe('"name" é um atributo obrigatório.');
		});
});

test('Não deve inserir usuário sem email', async () => {
	const res = await request(app).
		post('/user').
		send({
			name: name,
			passwd: 'abc123',
		});

	expect(res.status).toBe(400);
	expect(res.body.error).toBe('"mail" é um atributo obrigatório.');
});

test('Não deve inserir um usuário sem senha', (done) => {
	request(app).
		post('/user').
		send({
			name: name,
			mail: mail,
		}).
		then((res) => {
			expect(res.status).toBe(400);
			expect(res.body.error).toBe('"passwd" é um atributo obrigatório.');
			done();
		}).
		catch((error) => done.fail(error));
});

test('Não deve inserir usuário com email já existente', () => {
	return request(app).
		post('/user').
		send({
			name: name,
			mail: mail,
			passwd: 'abc123',
		}).
		then((res) => {
			expect(res.status).toBe(400);
			expect(res.body.error).toBe('Já existe um usuário com esse email.');
		});
});
