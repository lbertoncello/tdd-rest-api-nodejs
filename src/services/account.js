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
		return app.db(TABLE_NAME).
			insert(account, '*');
	};

	const update = (id, account) => {
		return app.db(TABLE_NAME).
			where({ id }).
			update(account, '*');
	};

	return {
		findAll,
		find,
		save,
		update,
	};
};
