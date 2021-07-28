
exports.seed = (knex) => {
	// Deletes ALL existing entries
	return knex('users').insert([
		{
			id: 10100,
			name: 'User #3',
			mail: 'user3@mail.com',
			// eslint-disable-next-line max-len
			passwd: '$2a$10$vTdLjqC9Op/qqsGq94YGqecljMYPm.xSWK.6J7LHNifN/WZUMOgbq',
		},
		{
			id: 10101,
			name: 'User #4',
			mail: 'user4@mail.com',
			// eslint-disable-next-line max-len
			passwd: '$2a$10$vTdLjqC9Op/qqsGq94YGqecljMYPm.xSWK.6J7LHNifN/WZUMOgbq',
		},
	]).
		then(() => knex('accounts').insert([
			{
				id: 10100,
				name: 'Acc Saldo Principal',
				user_id: 10100,
			},
			{
				id: 10101,
				name: 'Acc Saldo Secundário',
				user_id: 10100,
			},
			{
				id: 10102,
				name: 'Acc Alternativa 1',
				user_id: 10101,
			},
			{
				id: 10103,
				name: 'Acc Alternativa 2',
				user_id: 10101,
			},
		]));
};
