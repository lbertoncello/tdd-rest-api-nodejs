const passport = require('passport');
const passportJwt = require('passport-jwt');

const {
	Strategy, ExtractJwt,
} = passportJwt;

const secret = 'lHPj07alu7dpP4vofTB5YAwwJ1iCtnq0';

module.exports = (app) => {
	const params = {
		secretOrKey: secret,
		jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	};

	const strategy = new Strategy(params, async (payload, done) => {
		try {
			const user = await app.services.user.findOne({ id: payload.id });

			if (user) {
				done(null, { ...payload });
			} else {
				done(null, false);
			}
		} catch (error) {
			done(error, false);
		}
	});

	passport.use(strategy);

	return {
		authenticate: () => passport.authenticate('jwt', { session: false }),
	};
};
