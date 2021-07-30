const { v4: uuid } = require('uuid');

module.exports = (app) => {
	app.use((req, res) => {
		res.status(404).json({
			error: 'NOT FOUND',
		});
	});

	app.use((error, req, res, next) => {
		const {
			name, message, stack,
		} = error;

		if (name === 'ValidationError') {
			res.status(400).json({ error: message });
		} else if (name === 'ForbiddenResourceError') {
			res.status(403).json({ error: message });
		} else {
			const id = uuid();

			app.log.error({
				id,
				name,
				message,
				stack,
			});

			res.status(500).json({
				id: id,
				error: 'Internal error',
			});
		}

		next(error);
	});
};
