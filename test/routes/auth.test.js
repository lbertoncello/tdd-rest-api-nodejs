const request = require('supertest');

const app = require('../../src/app');

const SIGNUP_ROUTE = '/auth/signup';

afterAll(async () => {
	await app.db.destroy();
});

test('Deve criar usuário via signup', async () => {
	const name = 'Walter';
	const mail = `${Date.now()}@mail.com`;
	const passwd = '123456';

	const res = await request(app).post(SIGNUP_ROUTE).
		send({
			name,
			mail,
			passwd,
		});

	expect(res.status).toBe(201);
	expect(res.body.name).toBe('Walter');
	expect(res.body).not.toHaveProperty('passwd');
});

test('Deve receber token ao logar', async () => {
	const name = 'Walter';
	const mail = `${Date.now()}@mail.com`;
	const passwd = '123456';

	const user = await app.services.user.save({
		name: name,
		mail: mail,
		passwd: passwd,
	});

	const res = await request(app).post('/auth/signin').
		send({
			mail: mail,
			passwd: passwd,
		});

	expect(res.status).toBe(200);
	expect(res.body).toHaveProperty('token');
});

test('Não deve autenticar usuário com senha errada', async () => {
	const name = 'Walter';
	const mail = `${Date.now()}@mail.com`;
	const passwd = '123456';

	const user = await app.services.user.save({
		name: name,
		mail: mail,
		passwd: passwd,
	});

	const res = await request(app).post('/auth/signin').
		send({
			mail: mail,
			passwd: '654321',
		});

	expect(res.status).toBe(400);
	expect(res.body.error).toBe('Usuário ou senha inválido');
});

test('Não deve autenticar usuário com senha errada', async () => {
	const res = await request(app).post('/auth/signin').
		send({
			mail: 'naoExiste@mail.com',
			passwd: '654321',
		});

	expect(res.status).toBe(400);
	expect(res.body.error).toBe('Usuário ou senha inválido');
});

test('Não deve acessar uma rota protegida sem token', async () => {
	const res = await request(app).get('/user');

	expect(res.status).toBe(401);
});
