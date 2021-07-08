const ROUTE = '/user';

module.exports = (app) => {
	app.route(ROUTE).
		all(app.config.passport.authenticate()).
		get(app.routes.user.findAll).
		post(app.routes.user.create);
};
