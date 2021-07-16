const express = require('express');
const consign = require('consign');
const app = express();
const knex = require('knex');
const knexfile = require('../knexfile');

// TODO criar chaveamento dinâmico
app.db = knex(knexfile.test);

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
