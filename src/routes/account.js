module.exports = (app) => {
	const findAll = async (req, res) => {
		const result = await app.services.account.findAll();

		return res.status(200).json(result);
	};

	const find = async (req, res) => {
		const result = await app.services.account.find({ id: req.params.id });

		return res.status(200).json(result);
	};

	const create = async (req, res) => {
		const result = await app.services.account.save(req.body);

		if (result.error) {
			return res.status(400).json(result);
		}

		return res.status(201).json(result[0]);
	};

	const update = async (req, res) => {
		const result = await app.services.account.update(
			req.params.id,
			req.body,
		);

		return res.status(200).json(result[0]);
	};

	return {
		findAll,
		find,
		create,
		update,
	};
};
