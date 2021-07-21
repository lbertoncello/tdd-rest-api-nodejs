const ValidationError = require('../errors/ValidationError');

const TABLE_NAME = 'accounts';

module.exports = (app) => {
	const findAll = (userId) => {
		return app.db(TABLE_NAME).
			where({ user_id: userId }).
			select();
	};

	const find = (filter = {}) => {
		return app.db(TABLE_NAME).
			where(filter).
			select().
			first();
	};

	const save = async (account) => {
		if (!account.name) {
			throw new ValidationError('"name" é um atributo obrigatório.');
		}

		const accDb = await find({
			name: account.name,
			user_id: account.user_id,
		});

		if (accDb) {
			throw new ValidationError('Já existe uma conta com este nome.');
		}

		return app.db(TABLE_NAME).
			insert(account, '*');
	};

	const update = (id, account) => {
		return app.db(TABLE_NAME).
			where({ id }).
			update(account, '*');
	};

	const remove = async (id) => {
		const transactions = await app.services.transaction.findOne({
			acc_id: id,
		});

		if (transactions) {
			throw new ValidationError('Essa conta possui ' +
				'transações associadas.');
		}

		return app.db(TABLE_NAME).
			where({ id }).
			del();
	};

	return {
		findAll,
		find,
		save,
		update,
		remove,
	};
};
