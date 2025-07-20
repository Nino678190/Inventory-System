const { Pool } = require('pg');

const pool = new Pool({
    user: 'dbUser',
    host: 'db',
    database: 'dbName',
    password: 'dbPassword',
    port: 5432,
});

module.exports = pool;