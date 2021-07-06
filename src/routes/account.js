module.exports = (app) => {
	const findAll = async (req, res, next) => {
		try {
			const result = await app.services.account.findAll();

			res.status(200).json(result);
		} catch (error) {
			next(error);
		}
	};

	const find = async (req, res, next) => {
		try {
			const result =
				await app.services.account.find({ id: req.params.id });

			res.status(200).json(result);
		} catch (error) {
			next(error);
		}
	};

	const create = async (req, res, next) => {
		try {
			const result = await app.services.account.save(req.body);

			res.status(201).json(result[0]);
		} catch (error) {
			next(error);
		}
	};

	const update = async (req, res, next) => {
		try {
			const result = await app.services.account.update(
				req.params.id,
				req.body,
			);

			res.status(200).json(result[0]);
		} catch (error) {
			next(error);
		}
	};

	const remove = async (req, res, next) => {
		try {
			await app.services.account.remove(req.params.id);

			res.status(204).send();
		} catch (error) {
			next(error);
		}
	};

	return {
		findAll,
		find,
		create,
		update,
		remove,
	};
};
