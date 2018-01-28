/* vim: set ts=4 sw=4 sts=4 ai si nu sc: */

// Retrieve arguments or exit(1) if missing necessary arguments
if (process.argv.length < 3) {
    console.error('Please giving an argument for "tid"');
    process.exit(1);
}
let tid = process.argv[2];
console.log(`===== ${process.argv} =====`);

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
// connection: database connection object
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
const connection = mysql.createConnection(mysql_connection_options);

// URL trunk for target website
const URL_trunk = 'http://www.ratemyprofessors.com/ShowRatings.jsp';

/* Launch Chrominum */
puppeteer.launch(
    puppeteer_launch_options
).then(async browser => {
    /* Create Page */ console.log('Page creating...');
    const page = await browser.newPage();

    /* Event Emitter */
    page.on('load', load => console.log('Page Loaded!'));
    page.on('console', msg => console.log('PAGE LOG: ', msg.text()));

    /* Goto the target page */ console.log('Goto The Target Page...');
    let response;
    try {
        let queryString = `?tid=${tid}`;
        response = await page.goto(URL_trunk + queryString);
    } catch (err) {
        console.error(`----- Response Error: ${tid} -----`);
        console.error(err);
        process.exit(2);
    }
    if (response.status == 200) console.log('200 PK!');

    /* Check valid professor id */ console.log('Checking Valid TID...');
    let block;
    try {
        block = await page.$('div.top-info-block');
    } catch (err) {
        console.error(`----- Unknown Error: ${tid} -----`);
        console.error(err);
        process.exit(99);
    }
    if (!block) {
        console.log('This professor has no comment or page not found');
        process.exit(3);
    }

    /* Insert jQuery ajaxStop event for checking load more finished! */
    console.log('Inserting ajaxStop Event...');
    let ajaxFinish = false;
    page.on('console', msg => {
        if (msg.text() == 'ajaxStop') ajaxFinish = true;
    });
    try {
        await page.evaluate(
            () => $(document).ajaxStop(
                () => console.log('ajaxStop')
            )
        );
    } catch (err) {
        console.error(`----- Unknown Error: ${tid} -----`);
        console.error(err);
        process.exit(99);
    }

    /* Looking for load more button */
    console.log('Looking for loadMore button...');
    let loadMore;
    try {
        loadMore = await page.$('#loadMore');
        if (loadMore) {
            console.log('Having Load More Button!');
            let isDisplayNone = false;
            while (!isDisplayNone) {
                await page.evaluate(loadMore => loadMore.click(), loadMore);
                while (!await page.evaluate(ajaxFinish => ajaxFinish, ajaxFinish));
                ajaxFinish = false;
                isDisplayNone = await page.evaluate(
                    loadMore => loadMore.style.display.length != 0, loadMore);
            }
        } else console.log('No Load More Button!')
    } catch (err) {
        console.error(`----- Unknown Error: ${tid} -----`);
        console.error(err);
        process.exit(99);
    }

    /* Dump Professor's Data */ console.log('Dumping Professor\'s Data...');
    let professor = { TID: tid };
    try {
        // Dump Professor's Name
        let name = await block.$('div.result-name');
        let firstName = await name.$('span.pfname');
        let lastName = await name.$('span.plname');
        professor.Name = await page.evaluate((firstName, lastName) => {
            return [
                firstName.innerHTML.trim(),
                lastName.innerHTML.trim()
            ];
        }, firstName, lastName);
        lastName.dispose();
        firstName.dispose();
        name.dispose();

        // Dump Title of Professor
        let titleHandle = await block.$('div.result-title');
        let title = await page.evaluate(title => title.innerHTML, titleHandle);
        titleHandle.dispose();
        let match = title.match(/\s(.+)\s+<br>\s*<h2[^>]*>([\s|\S]*)<\/h2>/);
        professor.Title = {};
        professor.Title.Department = match[1].match(
            /Professor in the ([^\n]+) department/)[1];
        match = match[2].match(/<a[^>]*>([\s|\S]*)<\/a>,\s*(.*)/);
        professor.Title.SchoolName = match[1];
        professor.Title.Location = match[2];

        block.dispose();

        // Dump Rating of Professor
        let rating = await page.$('div.rating-breakdown');
        let quality = await rating.$('div.quality div.grade');
        let takeAgain = await rating.$('div.takeAgain div.grade');
        let difficulty = await rating.$('div.difficulty div.grade');
        professor.Rating = await page.evaluate(
            (quality, takeAgain, difficulty) => {
                return {
                    Quality: quality.innerHTML.trim(),
                    TakeAgain: takeAgain.innerHTML.trim(),
                    Difficulty: difficulty.innerHTML.trim()
                };
            }, quality, takeAgain, difficulty);
        difficulty.dispose();
        takeAgain.dispose();
        quality.dispose();
        rating.dispose();

    } catch (err) {
        console.error(`----- Dump Professor's Data Error: ${tid}`);
        console.error(err);
        process.exit(6);
    }
    console.log('Professor: ', professor);

    /* Dump Student Ratings */ console.log('Dumping Student Ratings...');
    let ratings;
    try {
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
                    tag => tag.innerHTML
                );

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
    } catch (err) {
        console.error(`----- Dump Student Ratings Error: ${tid}(tid) -----`);
        console.error(err);
        process.exit(7);
    }
    console.log('Found ' + ratings.length + ' Comments!');

    /* Write Back Data to the Database */
    console.log('Writing Back Data to the Database...');
    try {
        connection.connect();

        // Write back professor's data to the database
        let sql = 'INSERT INTO professor SET ? ON DUPLICATE KEY UPDATE id = ?';
        let post = [
            {
                id: professor.TID,
                firstname: professor.Name[0],
                lastname: professor.Name[1],
                department: professor.Title.Department,
                school: professor.Title.SchoolName,
                location: professor.Title.Location,
                quality: professor.Rating.Quality,
                takeagain: professor.Rating.TakeAgain,
                difficulty: professor.Rating.Difficulty,
            },
            professor.TID
        ];
        let query = connection.query(sql, post, (err, result, fields) => {
            if (err) throw err;
        });
        //console.log('SQL: ', query.sql);

        // Write back rating data to the database
        ratings.forEach(rating => {
            sql = 'INSERT INTO response SET ? ON DUPLICATE KEY UPDATE id = ?'
            post = [
                {
                    id: rating.RID,
                    tid: tid,
                    date: rating.Date,
                    content: rating.Comment,
                    quality: rating.OverallQuality,
                    difficulty: rating.LevelOfDifficulty,
                },
                rating.RID
            ];
            query = connection.query(sql, post, (err, result, fields) => {
                if (err) throw err;
            });
        });
        //console.log('SQL: ', query.sql);

    } catch (err) {
        console.error(
            `----- Write Back Data to the Database Error: ${tid} -----`);
        console.error(err);
        process.exit(8);
    } finally {
        connection.end();
    }

    /* Dump Data to <tid>.txt */ console.log(`Dumping Data to ${tid}.txt...`);
    try {
        let output = JSON.stringify(
            {
                Teacher: professor,
                Ratings: ratings,
            }
        );
        fs.writeFileSync(tid + '.txt', output);
    } catch (err) {
        console.error(`----- Dump Data to ${tid}.txt Error -----`);
        console.error(err);
        process.exit(9);
    }

    /* Close Chromium */ console.log('Closing Browser...');
    try {
        await browser.close();
    } catch (err) {
        console.error(`----- Browser Close Error: ${tid} -----`);
        console.error(err);
        process.exit(5);
    }
    console.log('Browser Closed!');

    /* For Debug: Show Timer Result */
    let timer_end = Date.now() - timer_start;
    console.log(`Running for ${timer_end / 1000} second!`);

    //process.exit(0);
}).catch(err => {
    console.log(`----- Launch Error: ${tid} -----`);
    console.error(err);
    process.exit(4);
});



/* Error Code List */
// 1: Missing tid argument
// 2: Reponse Error
// 3: Professor has no comments or page not found
// 4: Launch browser error
// 5: Browser Close Error
// 6: Dump Professor's Data Error
// 7: Dump Student Ratings Error
// 8: Write Back Data to the Database Error
// 9: Dump Data to <tid>.txt Error
//
// 99: Unknown Error
