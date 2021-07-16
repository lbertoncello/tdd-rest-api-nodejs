const express = require('express');

module.exports = (app) => {
	const router = express.Router();

	app.get('/', (req, res, next) => {
		res.status(200).send();
	});

	return router;
};
