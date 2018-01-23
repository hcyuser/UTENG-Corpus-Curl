http = require('http');

options = {
    hostname: 'www.ratemyprofessors.com',
    path: '/ShowRatings.jsp?tid=1',
};

request = http.request(options, response => {
    console.log(`----- Status Code: ${response.statusCode} -----`);
    //console.log(`Headers: ${JSON.stringify(response.headers)}`);
    //response.setEncoding('utf8');
    response.on('data', chunk => {
        //console.log(`Body: ${chunk}`);
    });
    response.on('end', () => console.log('\n----- END -----') );
    response.on('error', e => console.error(`Problem with request: ${e.message}`) );
});

request.end();
