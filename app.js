const puppeteer = require('puppeteer');

(async () => {
    let browser = await puppeteer.launch(
        {args: ['--no-sandbox', '--disable-setuid-sandbox']});
    let page = await browser.newPage();
    await page.goto('http://www.ratemyprofessors.com/ShowRatings.jsp?tid=231519');

    let result = { isNone: false };
    while (!result.isNone) {
        result = await page.evaluate(() => {
            let loadMore = document.getElementById('loadMore');
            // If comments <= 20, the loadMore tag will not exist.
            if (!loadMore) loadMore = { style: { display: 'none;' } };
            else loadMore.click();
            for (let i = 0; i < 1e8; i++);
            let isNone = (loadMore.style.display.length != 0);
            if (isNone) {
                let block = document.querySelector('div.top-info-block');

                let teacherName =
                    block.querySelector('div.result-name')
                let firstName = teacherName.querySelector('span.pfname').innerHTML.trim();
                let lastName = teacherName.querySelector('span.plname').innerHTML.trim();

                let teacherTitle = block.querySelector('div.result-title').innerHTML;
                let titleMatch = teacherTitle.match(
                    /\s+(.+)\s+<br>\s*<h2[^>]*>([\s|\S]*)<\/h2>/);
                let department = 
                    titleMatch[1].match(/Professor in the ([\w|\s]+) department/)[1];
                titleMatch = titleMatch[2].match(/<a[^>]*>([\s|\S]*)<\/a>,\s*(.*)/);
                let schoolName = titleMatch[1];
                let location = titleMatch[2];

                let teacherRating = document.querySelector('div.rating-breakdown');
                let quality = teacherRating.querySelector(
                    'div.quality div.grade').innerHTML.trim();
                let takeAgain = teacherRating.querySelector(
                    'div.takeAgain div.grade').innerHTML.trim();
                let difficulty = teacherRating.querySelector(
                    'div.difficulty div.grade').innerHTML.trim();

                let ratings = [].map.call(
                    document.querySelectorAll('tr > td.rating'),
                    tag => {
                        let parent = tag.parentNode;
                        let haveId = !!parent.id;
                        let id;
                        if (haveId) id = parent.id;
                        else
                            id = parent.querySelector('a.report')
                                .href.match(/rid=(\d+)/)[1];

                        let rating = parent.querySelector('td.rating');
                        let date = rating.querySelector('div.date').innerHTML.trim();
                        let ratingBlock = rating.querySelector('div.rating-block');
                        let ratingTyle = ratingBlock.querySelector(
                            'div.rating-wrapper div.rating-type');
                        let score = [].map.call(
                            ratingBlock.querySelectorAll('span.score'),
                            tag => tag.innerHTML);

                        let klass = parent.querySelector('td.class');
                        let name = klass.querySelector('span.name');
                        let response = name.querySelector('span.response');
                        if (response) name = response.innerHTML;
                        else name = name.innerHTML;

                        let comments = parent.querySelector('td.comments');
                        let commentsParagraph =
                            comments.querySelector('p').innerHTML.trim();

                        let result = {
                            rid: id,
                            date: date,
                            overallQuality: score[0],
                            levelOfDifficulty: score[1],
                            name: name,
                            commentsParagraph: commentsParagraph,
                        };
                        return result;
                    }
                );
                return {
                    isNone: isNone,
                    teacher: {
                        name: [firstName, lastName],
                        title: {
                            department: department,
                            schoolName: schoolName,
                            location: location,
                            overallQuality: quality,
                        },
                        rating: {
                            overallQuality: quality,
                            wouldTakeAgain: takeAgain,
                            levelOfDefficulty: difficulty,
                        },
                    },
                    ratings: ratings 
                };
            } else
                return { isNone: isNone };
        });
    }
    console.log(result.teacher);
    let ratings = result.ratings;
    console.log(ratings.length);
    console.log(ratings[0]);
    console.log(ratings[20]);
    console.log(ratings[90]);

    await browser.close();
})();
