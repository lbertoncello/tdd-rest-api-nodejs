const ROUTE = '/user';

module.exports = (app) => {
	app.route(ROUTE).
		get(app.routes.user.findAll).
		post(app.routes.user.create);
};
