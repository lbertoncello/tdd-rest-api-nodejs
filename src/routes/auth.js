const jwt = require('jwt-simple');
const bcrypt = require('bcrypt-nodejs');

const ValidationError = require('../errors/ValidationError');

const secret = 'lHPj07alu7dpP4vofTB5YAwwJ1iCtnq0';

module.exports = (app) => {
	const signin = async (req, res, next) => {
		try {
			const user = await app.services.user.findOne({
				mail: req.body.mail,
			});

			if (!user) {
				throw new ValidationError('Usuário ou senha inválido');
			}

			if (bcrypt.compareSync(req.body.passwd, user.passwd)) {
				const payload = {
					id: user.id,
					name: user.name,
					mail: user.mail,
				};

				const token = jwt.encode(payload, secret);

				res.status(200).json({ token });
			} else {
				throw new ValidationError('Usuário ou senha inválido');
			}
		} catch (error) {
			console.error(error);
			next(error);
		}
	};

	return {
		signin,
	};
};
