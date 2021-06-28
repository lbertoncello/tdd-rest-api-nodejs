module.exports = {
	test: {
		client: 'pg',
		version: '13.3',
		connection: {
			host: 'localhost',
			user: 'admin',
			password: 'admin',
			database: 'barriga',
		},
		migrations: {
			directory: 'src/migrations',
		},
	},
};
