const request = require('supertest');
const jwt = require('jwt-simple');

const app = require('../../src/app');

const secret = 'lHPj07alu7dpP4vofTB5YAwwJ1iCtnq0';
const MAIN_ROUTE = '/v1/user';
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

test('Deve listar todos os usuários', () => {
	return request(app).
		get(MAIN_ROUTE).
		set('Authorization', `Bearer ${user.token}`).
		then((res) => {
			expect(res.statusCode).toBe(200);
			expect(res.body.length).toBeGreaterThanOrEqual(0);
		});
});

test('Deve inserir usuário com sucesso', () => {
	const name = 'User Account';
	const mail = `${Date.now()}@mail.com`;
	const passwd = 'abc123';

	return request(app).
		post(MAIN_ROUTE).
		set('Authorization', `Bearer ${user.token}`).
		send({
			name,
			mail,
			passwd,
		}).
		then((res) => {
			expect(res.status).toBe(201);
			expect(res.body.name).toBe(name);
			expect(res.body).not.toHaveProperty('passwd');
		});
});

test('Deve armazenar senha criptografada', async () => {
	const name = 'User Account';
	const mail = `${Date.now()}@mail.com`;
	const passwd = 'abc123';

	const res = await request(app).
		post(MAIN_ROUTE).
		set('Authorization', `Bearer ${user.token}`).
		send({
			name: name,
			mail: mail,
			passwd: passwd,
		});

	expect(res.status).toBe(201);

	const { id } = res.body;
	const userDb = await app.services.user.findOne({ id });

	expect(userDb.passwd).not.toBeUndefined();
	expect(userDb.passwd).not.toBe(passwd);
});

test('Não deve inserir usuário sem nome', () => {
	const mail = `${Date.now()}@mail.com`;
	const passwd = 'abc123';

	return request(app).
		post(MAIN_ROUTE).
		set('Authorization', `Bearer ${user.token}`).
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
	const name = 'User Account';
	const passwd = 'abc123';

	const res = await request(app).
		post(MAIN_ROUTE).
		set('Authorization', `Bearer ${user.token}`).
		send({
			name: name,
			passwd: passwd,
		});

	expect(res.status).toBe(400);
	expect(res.body.error).toBe('"mail" é um atributo obrigatório.');
});

test('Não deve inserir um usuário sem senha', (done) => {
	const name = 'User Account';
	const mail = `${Date.now()}@mail.com`;

	request(app).
		post(MAIN_ROUTE).
		set('Authorization', `Bearer ${user.token}`).
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
		post(MAIN_ROUTE).
		set('Authorization', `Bearer ${user.token}`).
		send({
			name: user.name,
			mail: user.mail,
			passwd: '123456',
		}).
		then((res) => {
			expect(res.status).toBe(400);
			expect(res.body.error).toBe('Já existe um usuário com esse email.');
		});
});
