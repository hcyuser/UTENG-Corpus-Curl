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
const fs = require('fs');
const mysql = require('mysql');

/* Settings for Required Module */
// puppeteer launch options: launch Chromium with no sandbox
//  or it will throw an error for unknown reason.
// log: extend result of util.inspect to console.log
const puppeteer_launch_options = {
    args: ['--no-sandbox', '--disable-setuid-sandbox']
};
const log = arg => console.log(
    util.inspect(arg, {
        showHidden: true,
        colors: true,
        showProxy: true,
    })
);

// URL trunk for target website
const URL_trunk = 'http://www.ratemyprofessors.com/ShowRatings.jsp';


/* For Debug: Show Timer */
let timer_end = Date.now() - timer_start;
console.log(`Running for ${timer_end / 1000} second!`);


/* Error Code List */
// 1: Missing tid argument
