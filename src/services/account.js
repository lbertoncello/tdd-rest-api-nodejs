const TABLE_NAME = 'accounts';

module.exports = (app) => {
	const findAll = (filter = {}) => {
		return app.db(TABLE_NAME).
			where(filter).
			select();
	};

	const find = (filter = {}) => {
		return app.db(TABLE_NAME).
			where(filter).
			select().
			first();
	};

	const save = (account) => {
		if (!account.name) {
			return { error: '"name" é um atributo obrigatório.' };
		}

		return app.db(TABLE_NAME).
			insert(account, '*');
	};

	const update = (id, account) => {
		return app.db(TABLE_NAME).
			where({ id }).
			update(account, '*');
	};

	const remove = (id) => {
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
