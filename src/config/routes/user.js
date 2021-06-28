module.exports = (app) => {
	app.route('/user').
		get(app.routes.user.findAll).
		post(app.routes.user.create);
};
