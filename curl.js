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
const sleep = require('sleep');
const fs = require('fs');

const URL = 'http://www.ratemyprofessors.com/ShowRatings.jsp?tid='; 

// If missing tid argument, exit with error code 1
if (process.argv.length < 3) {
    console.error('Please giving a argument for "tid"');
    process.exit(1);
}
// Get teacher id from arguments
let tid = process.argv[2];

// Launch Chromium with no sandbox or it will throw an error for unknown reason.
puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
}).then(async browser => {
    // Create new Page object and change default navigation timeout to 10 second
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(10000);

    // For nonsense notification
    page.on('load', load => console.log("Finish Loading!"));
    let response;
    try {
        // Goto the http://www.ratemyprofessoers.com/ShowRatings.jsp with query
        // string, "tid=<tid>"
        response = await page.goto(URL + tid);
    } catch (err) {
        console.error('----- Response Error -----');
        console.error(err);
    }

    // May have to handle other situation for other response code.
    // Don't know other situation, so i may handle them later...
    if (response && response.status == 200) console.log('200 OK!');

    // Check for invalid teacher id
    let isNotFound = await page.$('div.header.error');
    try {
        if (isNotFound) console.error('Invalid Teacher ID!');
        else log('Found!');
    } catch (err) {
        console.error(err);
    }

    // Looking for load more button
    let loadMore = await page.$('#loadMore');
    try {
        if (loadMore) {
            console.log('Having Load More Button!');
            // Click load more button until display value of button is none
            let isDisplayNone = false;
            while (!isDisplayNone) {
                await page.evaluate(loadMore => loadMore.click(), loadMore);
                // sleep 0.1 second for AJAX execution
                sleep.msleep(300);
                isDisplayNone = await page.evaluate(
                    loadMore => loadMore.style.display.length != 0, loadMore);
            }
        }
        else console.log('No Load More Button...');
    } catch (err) {
        console.error(err);
    }

    // Dump teacher's Data
    let teacher = { TID: tid };
    if (!isNotFound) {
        // Dump teacher's name
        let block = await page.$('div.top-info-block');
        let name = await block.$('div.result-name');
        let firstName = await name.$('span.pfname');
        let lastName = await name.$('span.plname');
        teacher.Name = await page.evaluate((firstName, lastName) => {
            return [
                firstName.innerHTML.trim(),
                lastName.innerHTML.trim()
            ];
        }, firstName, lastName);
        firstName.dispose();
        lastName.dispose();
        name.dispose();

        // Dump title of teacher
        let titleHandle = await block.$('div.result-title')
        let title = await page.evaluate(title => title.innerHTML, titleHandle);
        titleHandle.dispose();
        let match = title.match(/\s(.+)\s+<br>\s*<h2[^>]*>([\s|\S]*)<\/h2>/);
        teacher.Title = {};
        teacher.Title.Department = match[1].match(
            /Professor in the ([\w\s]+) department/)[1];
        match = match[2].match(/<a[^>]*>([\s|\S]*)<\/a>,\s*(.*)/);
        teacher.Title.SchoolName = match[1];
        teacher.Title.Location = match[2];

        block.dispose();

        // Dump rating of teacher
        let ratingHandle = await page.$('div.rating-breakdown');
        teacher.Rating = await page.evaluate(rating => {
            let quality = rating.querySelector(
                'div.quality div.grade').innerHTML.trim();
            let takeAgain = rating.querySelector(
                'div.takeAgain div.grade').innerHTML.trim();
            let difficulty = rating.querySelector(
                'div.difficulty div.grade').innerHTML.trim();
            return {
                Quality: quality,
                TakeAgain: takeAgain,
                Difficulty: difficulty
            };
        }, ratingHandle);
        ratingHandle.dispose();
    }
    //console.log({ Teacher: teacher});

    // Dump rating comments
    let ratings;
    if (!isNotFound) {
        ratings = await page.$$eval('tr > td.rating', (ratings, tid) => {
            return [].map.call(ratings, rating => {
                let parent = rating.parentNode;
                let haveId = !!parent.id;
                let id = haveId ? parent.id :
                    parent.querySelector('a.report').href.match(/rid=(\d+)/)[1];

                let date = rating.querySelector('div.date').innerHTML.trim();
                let block = rating.querySelector('div.rating-block');
                let score = [].map.call(
                    block.querySelectorAll('span.score'),
                    tag => tag.innerHTML);

                let comment = parent.querySelector('td.comments');
                let paragraph = comment.querySelector('p').innerHTML.trim();
                return {
                    TID: tid,
                    RID: id,
                    Date: date,
                    OverallQuality: score[0],
                    LevelOfDifficulty: score[1],
                    Comment: paragraph,
                };
            });
        }, tid);
        //log(ratings);
    }

    //log({ Teacher: teacher, Ratings: ratings});
    if (!isNotFound) {
        // Remove duplicated rating
        console.log(ratings.length);
        let filter = [];
        let filterRatings = [];
        let l = ratings.length;
        for (let i = 0; i < l; i++) {
            if (filter[ratings[i].RID]) continue;
            filter[ratings[i].RID] = true;
            filterRatings.push(ratings[i]);
        }
        console.log('Before: ' + ratings.length);
        console.log('After: ' + filterRatings.length);
        let output = JSON.stringify({ Teacher: teacher, Ratings: ratings });
        fs.writeFileSync(tid + '.txt', output);
        let input = fs.readFileSync(tid + '.txt');
        log(JSON.parse(input).Ratings.length);
    }


    // Dispose all referencing element handles
    if (isNotFound) isNotFound.dispose();
    if (loadMore) loadMore.dispose();

    // Close Page
    await page.close();
    // Close Chromium
    await browser.close();
}).catch(err => {
    console.error(err.message);
});

// Error Code List
/// 1: Missing tid argument
