module.exports = (app) => {
	const findAll = () => {
		return app.db('users').select();
	};

	const save = (user) => {
		if (!user.name) {
			return {
				error: '"name" é um atributo obrigatório.',
			};
		}

		if (!user.mail) {
			return {
				error: '"mail" é um atributo obrigatório.',
			};
		}

		return app.db('users').insert(user, '*');
	};

	return {
		findAll,
		save,
	};
};
