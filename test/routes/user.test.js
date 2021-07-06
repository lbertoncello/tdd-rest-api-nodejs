const request = require('supertest');
const app = require('../../src/app');

const mail = `${Date.now()}@mail.com`;
const name = 'Walter Mitty';
const passwd = 'abc123';

afterAll(async () => {
	await app.db.destroy();
});

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
			passwd: passwd,
		}).
		then((res) => {
			expect(res.status).toBe(201);
			expect(res.body.name).toBe(name);
			expect(res.body).not.toHaveProperty('passwd');
		});
});

test('Deve armazenar senha criptografada', async () => {
	const res = await request(app).
		post('/user').
		send({
			name: name,
			mail: `${Date.now()}@mail.com`,
			passwd: passwd,
		});

	expect(res.status).toBe(201);

	const { id } = res.body;
	const userDb = await app.services.user.findOne({ id });

	expect(userDb.passwd).not.toBeUndefined();
	expect(userDb.passwd).not.toBe(passwd);
});

test('Não deve inserir usuário sem nome', () => {
	return request(app).
		post('/user').
		send({
			mail: mail,
			passwd: passwd,
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
			passwd: passwd,
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
			passwd: passwd,
		}).
		then((res) => {
			expect(res.status).toBe(400);
			expect(res.body.error).toBe('Já existe um usuário com esse email.');
		});
});
