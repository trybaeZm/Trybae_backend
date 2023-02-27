const mysql = require("mysql2");

const uri =
	process.env.MODE == "TEST"
		? process.env.SQL_DATABASE_URL_TEST
		: process.env.SQL_DATABASE_URL_PROD;

const connection = mysql.createConnection(uri);

connection.connect((err) => {
	if (err) console.log("Error connecting to sql DB ❌");
	else console.log("Connection to sql DB Successful! ✅");
});

module.exports = { connection };
