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
                let result;
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
                        let score = [].map.call(
                            parent.querySelectorAll(
                                'div.rating-block div.breakdown div.break span.score'),
                            tag => tag.innerHTML);
                        let rating = {
                            id: id,
                            date: parent.querySelector('div.date').innerHTML.trim(),
                            ratingType: parent.querySelector(
                                'div.rating-block div.rating-wrapper span.rating-type')
                                .innerHTML,
                            overallQuality: score[0],
                            levelOfDifficulty: score[1],
                        };
                        return rating;
                    }
                );
                return {
                    isNone: isNone,
                    ratings: ratings 
                };
            } else
                return { isNone: isNone };
        });
    }
    let ratings = result.ratings;
    console.log(ratings.length);
    console.log(ratings[0]);
    console.log(ratings[20]);

    await browser.close();
})();
