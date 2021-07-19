module.exports = (app) => {
	const find = (userId, filter = {}) => {
		return app.db('transactions').
			join('accounts', 'accounts.id', 'acc_id').
			where(filter).
			andWhere('accounts.user_id', '=', userId).
			select();
	};

	const findOne = (filter = {}) => {
		return app.db('transactions').
			where(filter).
			first();
	};

	const save = (transaction) => {
		return app.db('transactions').
			insert(transaction, '*');
	};

	return {
		find,
		findOne,
		save,
	};
};
