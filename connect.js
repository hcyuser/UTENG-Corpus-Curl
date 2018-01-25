/* vim: set ts=4 sw=4 sts=4 nu: */
const mysql = require('mysql');

let connection = mysql.createConnection({
	host: '104.199.250.176',
	user: 'root',
	password: 'root',
	database: 'rating'
});

connection.connect();

let query = query => {
	let result = connection.query(query, (err, result, fields) => {
		if (err) console.error(err);
		else {
			console.log(result);
			return result;
			//console.log(fields);
		}
	});
	return result;
};

let aaa = "alsdfkj'alsdkj'alskdfj'alskdfj";
console.log(aaa);
console.log(connection.escape(aaa));
//let result = query('SELECT TID FROM professor WHERE TID = \'231419\';');
//console.log(result);

connection.end();
