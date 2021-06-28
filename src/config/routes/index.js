const userRoutes = require('./user');
const accountRoutes = require('./account');

module.exports = (app) => {
	userRoutes(app);
	accountRoutes(app);
};
