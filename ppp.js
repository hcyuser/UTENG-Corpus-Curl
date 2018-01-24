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

// If missing tid argument, exit with error code 1
if (process.argv.length < 3) {
    console.error('Please giving a argument for "tid"');
    process.exit(1);
}
// Get teacher id from arguments
let tid = process.argv[2];

// Launch Chromium with no sandbox or
//  it will throw an error for unknown reason. :(
puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
}).then(async browser => {
    // Create new Page object and
    //  change default navigation timeout to 10 second
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(10000);

    // Create and goto the ShowRatings.jsp?tid=<tid> of www.ratemyprofessors.com
    page.on('load', load => console.log("Finish Loading!"));
    // 
    let response;
    try {
        response = await page.goto(URL + tid);
    } catch (err) {
        console.error('----- Response Error -----');
        console.error(err);
    }

    // May have to handle other situation for other response code.
    if (response && response.status == 200) console.log('200 OK!');

    // Check for invalid tid
    let isNotFound
    try {
        isNotFound = await page.evaluate(
            () => document.querySelector('div.header.error'));
        if (isNotFound) console.error('Invalid Teacher ID!');
        else log('Found!');
    } catch (err) {
        console.error(err);
    }

    // Looking for .loadMore button
    let loadMore;
    try {
        loadMore = await page.evaluate(() => document.getElementById('loadMore'));
        if (loadMore) console.log('Having load more....');
        else console.log('no load more...');
    } catch (err) {
        console.error(err);
    }

    // Close Chromium
    await browser.close();
}).catch(err => {
    console.error(err.message);
});

// Error Code List
/// 1: Missing tid argument
