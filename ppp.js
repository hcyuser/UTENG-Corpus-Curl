// Require puppeteer node module for connecting with Chromium
const puppeteer = require('puppeteer');
// Require util module for display object in console
const util = require('util');
const log = arg => console.log(
    util.inspect(arg, {
        showHidden: true,
        colors: true,
        showProxy: true,
    }));

const URL = 'http://www.ratemyprofessors.com/ShowRatings.jsp?tid='; 

// If missing tid argument, exit with error code -1
if (process.argv.length < 3) {
    console.error('Please giving a argument for "tid"');
    return -1
}
// Get teacher id from arguments
let tid = process.argv[2];

// Launch Chromium with no sandbox or
//  it will throw an error for unknown reason. :(
puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
}).then(async browser => {
    // Create and goto the ShowRatings.jsp?tid=<tid> of www.ratemyprofessors.com
    const page = await browser.newPage();
    page.on('load', load => console.log("Finish Loading!"));
    const response_code = (await page.goto(URL + tid)).status();
    if (response_code == 200) console.log('200 OK!');
    await browser.close();
}).catch(err => {
    console.error(err.message);
});

//let main = async () => {
//    await page.goto(URL + tid);
//    
//    // Check response status
//    page.on('response', response => {
//        log(response);
//    });
//
//    // Close Chromium
//    await browser.close();
//};
//
//main();

// Error Code List
/// -1: Missing tid argument
