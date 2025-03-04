const puppeteer = require('puppeteer');

async function scrapeInstagramProfile(username) {
  const url = `https://www.instagram.com/${username}/`;
  const browser = await puppeteer.launch({
    headless: true, 
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--window-size=1920x1080'],
  });
  
  const page = await browser.newPage();

  try {
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36');
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector('body', { timeout: 60000 });
    await page.waitForTimeout(Math.random() * 5000 + 2000); // Random delay to avoid detection

    const data = await page.evaluate(() => {
      const stats = document.querySelectorAll('header li span');
      const posts = stats[0]?.innerText.replace(/,/g, '') || '0';
      const followers = stats[1]?.innerText.replace(/,/g, '') || '0';
      const following = stats[2]?.innerText.replace(/,/g, '') || '0';
      
      const recentPosts = [...document.querySelectorAll('article div[role="button"]')]
        .slice(0, 5)
        .map(post => {
          const views = post.querySelector('span') ? post.querySelector('span').innerText.replace(/,/g, '') : '0';
          return { views };
        });

      return { posts, followers, following, recentPosts };
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
