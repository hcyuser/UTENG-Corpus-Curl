const puppeteer = require('puppeteer');

(async () => {
    let browser = await puppeteer.launch(
        {args: ['--no-sandbox', '--disable-setuid-sandbox']});
    let page = await browser.newPage();
    await page.goto('http://www.ratemyprofessors.com/ShowRatings.jsp?tid=231419');

    let result = { isNone: false };
    while (!result.isNone) {
        result = await page.evaluate(() => {
            let loadMore = document.getElementById('loadMore');
            loadMore.click();
            for (let i = 0; i < 1e8; i++);
            let isNone = (loadMore.style.display.length != 0);
            if (isNone) {
                let block = document.querySelector('div.top-info-block');

                let teacherName =
                    block.querySelector('div.result-name')
                let firstName = teacherName.querySelector('span.pfname').innerHTML.trim();
                let lastName = teacherName.querySelector('span.plname').innerHTML.trim();

                let teacherTitle = block.querySelector('div.result-title');
                let title = teacherTitle.textContent;

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
                    teacherName: [firstName, lastName],
                    teacherTitle: title,
                    ratings: ratings 
                };
            } else
                return { isNone: isNone };
        });
    }
    console.log('Teacher: ', result.teacherName);
    console.log('Teacher Title: ', result.teacherTitle);
    let ratings = result.ratings;
    console.log(ratings.length);
    console.log(ratings[0]);
    console.log(ratings[20]);
    console.log(ratings[90]);

    await browser.close();
})();
