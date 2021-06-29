const ROUTE = '/account';

module.exports = (app) => {
	app.route(ROUTE).
		get(app.routes.account.findAll).
		post(app.routes.account.create);

	app.route(`${ROUTE}/:id`).
		get(app.routes.account.find).
		put(app.routes.account.update);
};
