module.exports = (app) => {
	app.route('/auth/signin').
		post(app.routes.auth.signin);
};
