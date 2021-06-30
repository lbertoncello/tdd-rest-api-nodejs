module.exports = (app) => {
	app.use((req, res) => {
		res.status(404).json({
			error: 'NOT FOUND',
		});
	});
};
