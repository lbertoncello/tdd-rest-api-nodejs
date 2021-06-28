const TABLE_NAME = 'accounts';

module.exports = (app) => {
	const save = (account) => {
		return app.db(TABLE_NAME).insert(account, '*');
	};

	return {
		save,
	};
};
