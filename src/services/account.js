const TABLE_NAME = 'accounts';

module.exports = (app) => {
	const findAll = (filter = {}) => {
		return app.db(TABLE_NAME).where(filter).
			select();
	};

	const save = (account) => {
		return app.db(TABLE_NAME).insert(account, '*');
	};

	return {
		findAll,
		save,
	};
};
