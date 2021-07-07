const request = require('supertest');

const app = require('../../src/app');

afterAll(async () => {
	await app.db.destroy();
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
