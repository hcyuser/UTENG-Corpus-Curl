const mysql = require('mysql');

let connection = mysql.createConnection({
	host: '104.199.250.176',
	user: 'root',
	password: 'root',
	database: 'professor'
});

connection.connect();

let query = query => {
	connection.query(query, (err, results, fields) => {
		if (err) console.error(err);
		else {
			console.log(results);
			//console.log(fields);
		}
	});
};

query('SELECT VERSION(), CURRENT_DATE;');


connection.end();
