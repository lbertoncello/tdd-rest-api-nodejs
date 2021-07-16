const bcrypt = require('bcrypt-nodejs');

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

	const findOne = (filter = {}) => {
		return app.db('users').
			where(filter).
			first();
	};

	const getPasswdHash = (passwd) => {
		const salt = bcrypt.genSaltSync(10);

		return bcrypt.hashSync(passwd, salt);
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

		const userDb = await findOne({ mail: user.mail });

		if (userDb) {
			throw new ValidationError('Já existe um usuário com esse email.');
		}

		const newUser = { ...user };

		newUser.passwd = getPasswdHash(user.passwd);

		return app.db('users').
			insert(newUser, [
				'id',
				'name',
				'mail',
			]);
	};

	return {
		findAll,
		findOne,
		save,
	};
};
