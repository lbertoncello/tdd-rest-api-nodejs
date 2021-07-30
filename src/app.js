const express = require('express');
const consign = require('consign');
const knex = require('knex');
const winston = require('winston');

const app = express();
const knexfile = require('../knexfile');

app.db = knex(knexfile[process.env.NODE_ENV.trim()]);

app.log = winston.createLogger({
	level: 'debug',
	transports: [
		new winston.transports.Console({
			format: winston.format.json({ space: 1 }),
		}),
		new winston.transports.File({
			filename: 'logs/erro.log',
			level: 'warn',
			format: winston.format.combine(
				winston.format.timestamp(),
				winston.format.json({ space: 1 }),
			),
		}),
	],
});

consign({
	cwd: 'src',
	verbose: false,
}).
	include('./config/passport.js').
	then('./config/middlewares.js').
	then('./services').
	then('./routes').
	then('./config/router.js').
	then('./config/error.js').
	into(app);


// TODO trocar o logger padrão para alguma lib mais eficiente
/*
 * Log de dados do DB
 */
// app.db.
// 	on('query', (query) => {
// 		console.log({
// 			sql: query.sql,
// 			bindings: query.bindings ? query.bindings.join(', ') : '',
// 		});
// 	}).
// 	on('query-response', (response) => console.log(response)).
// 	on('error', (error) => console.error(error));

module.exports = app;
