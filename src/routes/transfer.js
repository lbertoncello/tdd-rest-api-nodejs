const express = require('express');

module.exports = (app) => {
	const router = express.Router();

	router.get('/', async (req, res, next) => {
		try {
			const result = await app.services.transfer.
				find({ user_id: req.user.id });

			res.status(200).json(result);
		} catch (error) {
			console.error(error);
			next(error);
		}
	});

	return router;
};
