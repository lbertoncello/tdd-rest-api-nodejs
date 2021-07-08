const ROUTE = '/account';

module.exports = (app) => {
	app.route(ROUTE).
		all(app.config.passport.authenticate()).
		get(app.routes.account.findAll).
		post(app.routes.account.create);

	app.route(`${ROUTE}/:id`).
		all(app.config.passport.authenticate()).
		get(app.routes.account.find).
		put(app.routes.account.update).
		delete(app.routes.account.remove);
};
