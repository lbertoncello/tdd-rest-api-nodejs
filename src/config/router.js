const express = require('express');

module.exports = (app) => {
	app.use('/', app.routes.base);
	app.use('/auth', app.routes.auth);

	const protectedRouter = express.Router();

	protectedRouter.use('/user', app.routes.user);
	protectedRouter.use('/account', app.routes.account);
	protectedRouter.use('/transaction', app.routes.transaction);
	protectedRouter.use('/transfer', app.routes.transfer);

	app.use(
		'/v1',
		app.config.passport.authenticate(),
		protectedRouter,
	);
};
