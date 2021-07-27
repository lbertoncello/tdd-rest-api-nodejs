const express = require('express');

const ForbiddenResourceError = require('../errors/ForbiddenResource');

module.exports = (app) => {
	const router = express.Router();

	router.param('id', async (req, res, next) => {
		try {
			const result = await app.services.transfer.
				findOne({ id: req.params.id });

			if (result.user_id !== req.user.id) {
				throw new ForbiddenResourceError();
			}

			next();
		} catch (error) {
			console.error(error);
			next(error);
		}
	});

	const validate = async (req, res, next) => {
		try {
			await app.services.transfer.
				validate({
					...req.body,
					user_id: req.user.id,
				});

			next();
		} catch (error) {
			console.error(error);
			next(error);
		}
	};

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

	router.get('/:id', async (req, res, next) => {
		try {
			const result = await app.services.transfer.
				findOne({ id: req.params.id });

			res.status(200).json(result);
		} catch (error) {
			console.error(error);
			next(error);
		}
	});

	router.post('/', validate, async (req, res, next) => {
		try {
			const transfer = {
				...req.body,
				user_id: req.user.id,
			};

			const result = await app.services.transfer.save(transfer);

			res.status(201).json(result[0]);
		} catch (error) {
			console.error(error);
			next(error);
		}
	});

	router.put('/:id', validate, async (req, res, next) => {
		try {
			const result = await app.services.transfer.
				update(req.params.id, {
					...req.body,
					user_id: req.user.id,
				});

			res.status(200).json(result[0]);
		} catch (error) {
			console.error(error);
			next(error);
		}
	});

	router.delete('/:id', async (req, res, next) => {
		try {
			await app.services.transfer.remove(req.params.id);

			res.status(204).send();
		} catch (error) {
			console.error(error);
			next(error);
		}
	});

	return router;
};
