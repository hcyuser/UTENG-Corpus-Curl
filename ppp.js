// require puppeteer node module for connecting with Chromium
const P = require('puppeteer');

if (process.argv.length < 3) {
    console.err('Please giving a argument for "tid"');
    return -1
}


// Error Code List
/// -1: Missing tid argument
