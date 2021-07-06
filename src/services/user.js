const ValidationError = require('../errors/ValidationError');

module.exports = (app) => {
	const findAll = (filter = {}) => {
		return app.db('users').
			where(filter).
			select([
				'id',
				'name',
				'mail',
			]);
	};

	const save = async (user) => {
		if (!user.name) {
			throw new ValidationError('"name" é um atributo obrigatório.');
		}

		if (!user.mail) {
			throw new ValidationError('"mail" é um atributo obrigatório.');
		}

		if (!user.passwd) {
			throw new ValidationError('"passwd" é um atributo obrigatório.');
		}

		const userDb = await findAll({ mail: user.mail });

		if (userDb && userDb.length > 0) {
			throw new ValidationError('Já existe um usuário com esse email.');
		}

		return app.db('users').
			insert(user, [
				'id',
				'name',
				'mail',
			]);
	};

	return {
		findAll,
		save,
	};
};
