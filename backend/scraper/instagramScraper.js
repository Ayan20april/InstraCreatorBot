const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const readline = require('readline');

puppeteer.use(StealthPlugin());

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function askQuestion(query) {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
}

async function loginInstagram(page, username, password) {
  await page.goto('https://www.instagram.com/accounts/login/', {
    waitUntil: 'networkidle2',
    timeout: 60000,
  });

  await page.waitForSelector('input[name="username"]');
  await page.type('input[name="username"]', username, { delay: 100 });
  await page.type('input[name="password"]', password, { delay: 100 });

  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 90000 }),
  ]);

  console.log('✅ Logged into Instagram');
}

async function scrapeInstagramProfile(targetUsername) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
  );

  const igUsername = await askQuestion('Enter your Instagram username: ');
  const igPassword = await askQuestion('Enter your Instagram password: ');

  await loginInstagram(page, igUsername, igPassword);

  const url = `https://www.instagram.com/${targetUsername}/`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

  await page.waitForTimeout(5000);

  const profileData = await page.evaluate(() => {
    const stats = document.querySelectorAll('header li span');
    return {
      posts: stats[0]?.innerText || '0',
      followers: stats[1]?.innerText || '0',
      following: stats[2]?.innerText || '0',
    };
  });

  console.log(`Profile: ${targetUsername}`, profileData);

  await browser.close();
  rl.close();
}

scrapeInstagramProfile('therock').catch(console.error);
