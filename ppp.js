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

puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
}).then(async browser => {
    const page = await browser.newPage();
    page.on('load', load => log('Finish Loading!'));
    const response_code = (await page.goto(URL + tid)).status();
    await browser.close();
});

//let main = async () => {
//    // Launch Chromium
//    let args = { args: ['--no-sandbox', '--disable-setuid-sandbox'] };
//    let browser;
//    try {
//        browser = await pp.launch(args);
//    } catch (err) {
//        console.error(err);
//        console.error('Launch Chromium failed!');
//    }
//
//    // Create and goto the ShowRatings.jsp?tid=<tid> of www.ratemyprofessors.com
//    let page = await browser.newPage();
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
