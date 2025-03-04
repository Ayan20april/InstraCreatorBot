const puppeteer = require('puppeteer');

async function scrapeInstagramProfile(username) {
  const url = `https://www.instagram.com/${username}/`;
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle2' });
    await page.waitForSelector('meta[property="og:description"]');

    const data = await page.evaluate(() => {
      const meta = document.querySelector('meta[property="og:description"]');
      const content = meta ? meta.getAttribute('content') : '';
      const regex = /([0-9,]+) Followers/;
      const followers = content.match(regex) ? content.match(regex)[1].replace(/,/g, '') : '0';

      const posts = [...document.querySelectorAll('article div[role="button"]')].slice(0, 10).map(post => {
        const views = post.querySelector('span') ? post.querySelector('span').innerText : '0';
        return { views };
      });

      return { followers, posts };
    });

    console.log(`Profile: ${username}`, data);
    return data;
  } catch (err) {
    console.error(`Failed to scrape ${username}`, err);
    return null;
  } finally {
    await browser.close();
  }
}

// Example Usage
scrapeInstagramProfile('therock');

