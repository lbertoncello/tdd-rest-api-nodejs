module.exports = (app) => {
	app.use((error, req, res, next) => {
		const {
			name, message, stack,
		} = error;

		if (name === 'ValidationError') {
			res.status(400).json({ error: message });
		} else {
			res.status(500).json({
				name,
				message,
			});
		}

		next(error);
	});
};
