const ROUTE = '/account';

module.exports = (app) => {
	app.route(ROUTE).
		post(app.routes.account.create);
};
