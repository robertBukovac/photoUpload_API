const mysql = require("mysql");

// kad koristim process.env.user i database error mi izbacuje

const connection   = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: 'root',
    password: process.env.DB_PASSWORD,
    database: 'db_projekt_robertbukovac',
    connectionLimit: 10
  });
  
  module.exports = connection;

