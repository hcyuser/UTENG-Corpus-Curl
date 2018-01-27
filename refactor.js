/* vim: set ts=4 sw=4 sts=4 ai si nu sc: */

// Retrieve arguments or exit(1) if missing necessary arguments
if (process.argv.length < 3) {
    console.error('Please giving an argument for "tid"');
    process.exit(1);
}
let tid = process.argv[2];

/* For Debug: Set Timer */
let timer_start = Date.now();

/*  Requiring Node Modules */
// puppeteer: connecting to Chrome
// util: display object content in console
// sleep: suspending
// fs: access file
// mysql: connect and query 
const puppeteer = require('puppeteer');
const util = require('util');
const sleep = require('sleep');
const mysql = require('mysql');
const fs = require('fs');

/* Settings for Required Module */
// puppeteer launch options: launch Chromium with no sandbox
//  or it will throw an error for unknown reason.
// dump: dump object detail
// mysql connection options: database connection settings
const puppeteer_launch_options = {
    args: ['--no-sandbox', '--disable-setuid-sandbox']
};
const dump = object =>
    util.inspect(arg, {
        showHidden: true,
        colors: true,
        showProxy: true,
    });
const mysql_connection_options = {
    host: '104.199.250.176',
    user: 'hcyidvtw',
    password: 'hcyidvtw',
    database: 'rating'
};

// URL trunk for target website
const URL_trunk = 'http://www.ratemyprofessors.com/ShowRatings.jsp';

/* Launch Chrominum */
puppeteer.launch(
    puppeteer_launch_options
).then(async browser => {
    /* Create Page */
    const page = await browser.newPage();

    /* Event Emitter */
    page.on('load', load => console.log('Page Loaded!');


    /* Close Chromium */
    await browser.close();
    console.log('Browser Closed!');

    /* For Debug: Show Timer */
    let timer_end = Date.now() - timer_start;
    console.log(`Running for ${timer_end / 1000} second!`);

}).catch(err => {
    console.error(err);
});



/* Error Code List */
// 1: Missing tid argument
