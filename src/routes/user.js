module.exports = (app) => {
	const findAll = async (req, res, next) => {
		try {
			const result = await app.services.user.findAll();

			res.status(200).json(result);
		} catch (error) {
			next(error);
		}
	};

	const create = async (req, res, next) => {
		try {
			const result = await app.services.user.save(req.body);

			res.status(201).json(result[0]);
		} catch (error) {
			next(error);
		}
	};

	return {
		findAll,
		create,
	};
};
