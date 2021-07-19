const express = require('express');

module.exports = (app) => {
	const router = express.Router();

	router.get('/', async (req, res, next) => {
		try {
			const result = await app.services.transaction.find(req.user.id);

			res.status(200).json(result);
		} catch (error) {
			console.error(error);
			next(error);
		}
	});


	router.get('/:id', async (req, res, next) => {
		try {
			const result =
				await app.services.transaction.findOne({ id: req.params.id });

			res.status(200).json(result);
		} catch (error) {
			console.error(error);
			next(error);
		}
	});

	router.post('/', async (req, res, next) => {
		try {
			const result = await app.services.transaction.save(req.body);

			res.status(201).json(result[0]);
		} catch (error) {
			console.error(error);
			next(error);
		}
	});

	router.put('/:id', async (req, res, next) => {
		try {
			const result = await app.services.transaction.update(
				req.params.id,
				req.body,
			);

			res.status(200).json(result[0]);
		} catch (error) {
			console.error(error);
			next(error);
		}
	});

	router.delete('/:id', async (req, res, next) => {
		try {
			const result = await app.services.transaction.remove(req.params.id);

			res.status(204).json(result);
		} catch (error) {
			console.error(error);
			next(error);
		}
	});

	return router;
};
