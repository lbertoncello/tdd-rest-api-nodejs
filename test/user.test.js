const request = require('supertest');
const app = require('../src/app');

test('Deve listar todos os usuários', () => {
	return request(app).get('/user').
		then((res) => {
			expect(res.statusCode).toBe(200);
			expect(res.body).toHaveLength(1);
			expect(res.body[0]).toHaveProperty('name', 'John Doe');
		});
});

test('Deve inserir usuário com sucesso', () => {
	return request(app).post('/user').
		send({
			name: 'Walter Mitty',
			mail: 'walter@mail.com',
		}).
		then((res) => {
			expect(res.status).toBe(201);
			expect(res.body.name).toBe('Walter Mitty');
		});
});
