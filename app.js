const http = require('http');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

let content = null

let options = {
    hostname: 'www.ratemyprofessors.com',
    path: '/ShowRatings.jsp?tid=1',
};
let request = http.request(options, response => {
    console.log(`----- Status Code: ${response.statusCode} -----`);
    //console.log(`Headers: ${JSON.stringify(response.headers)}`);
    response.setEncoding('utf8');
    response.on('data', chunk => content = chunk );
    response.on('end', () => {
        console.log('----- END -----');
        console.log('----- Parsing -----');
        let dom = new JSDOM(content);
        let document = dom.window.document;
        let body = document.body;
        console.log(body.innerHTML);
    });
    response.on('error', e => console.error(`Problem with request: ${e.message}`) );
});
request.end();

