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
	include('./config/middlewares').
	then('./routes').
	then('./config/routes').
	into(app);

app.get('/', (req, res) => {
	res.status(200).send();
});

module.exports = app;
