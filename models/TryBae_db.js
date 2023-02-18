const mysql = require("mysql2");

const connection = mysql.createConnection(process.env.SQL_DATABASE_URL_TEST);

connection.connect((err) => {
	if (err) console.log("Error connecting to sql DB");
	else console.log("Connection to sql DB Successful!");
});

module.exports = {connection};
