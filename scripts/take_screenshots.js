const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const outDir = '/Users/hoangvu96z/.gemini/antigravity-ide/brain/6c8605af-e558-449a-bf4c-d3eb870671c4/screenshots2';
fs.mkdirSync(outDir, { recursive: true });

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  const ss = async (name) => {
    await page.screenshot({ path: path.join(outDir, name + '.png'), fullPage: false });
    console.log('Screenshot:', name);
  };

  const clickText = async (text) => {
    const clicked = await page.evaluate((t) => {
      const all = Array.from(document.querySelectorAll('div, span, button, a, p'));
      all.sort((a, b) => a.children.length - b.children.length);
      const el = all.find(el => {
        const inner = (el.innerText || '').trim();
        return inner === t || (inner.includes(t) && el.children.length <= 2);
      });
      if (el) { el.click(); return true; }
      return false;
    }, text);
    if (!clicked) {
      console.log(`Warning: Could not find or click text "${text}"`);
    }
  };

  const clickNext = async () => {
    const clicked = await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="next-button"]');
      if (btn) { btn.click(); return true; }
      return false;
    });
    if (!clicked) {
      console.log('Warning: Could not find or click next button');
    }
  };

  await page.goto('http://localhost:8081', { waitUntil: 'networkidle0', timeout: 30000 });
  await sleep(2000);
  await ss('01_onboarding_slide1');

  await clickNext(); await sleep(700); await ss('02_onboarding_slide2');
  await clickNext(); await sleep(700); await ss('03_onboarding_slide3');
  await clickNext(); await sleep(700); await ss('04_onboarding_slide4');
  await clickNext(); await sleep(2500); await ss('05_home_screen');

  await clickText('Lịch cảm xúc'); await sleep(900); await ss('06_mood_calendar');
  await page.keyboard.press('Escape'); await sleep(500);

  await clickText('Ngày'); await sleep(900); await ss('07_day_screen');
  await clickText('Reel'); await sleep(900); await ss('08_reel_screen');
  await clickText('Me'); await sleep(900); await ss('09_me_screen');

  await page.evaluate(() => { const el = document.querySelector('[data-class="screen-scroll"], [class*="screenContent"]'); if (el) el.scrollTop = 400; });
  await sleep(500); await ss('10_me_screen_scrolled');

  await page.evaluate(() => { window.scrollTo(0, 400); }); await sleep(400);

  // Back to top
  await page.evaluate(() => window.scrollTo(0, 0)); await sleep(300);

  // Privacy
  await clickText('Quyền riêng tư & Nhật ký tự động'); await sleep(800); await ss('11_privacy_dialog');
  await clickText('Đóng'); await sleep(500);

  // Paywall
  await clickText('Nâng cấp'); await sleep(800); await ss('12_paywall_modal');
  await page.evaluate(() => {
    const btn = document.querySelector('[data-testid="paywall-close"]');
    if (btn) btn.click();
  });
  await sleep(500);

  // Home tab
  await clickText('Home'); await sleep(800);

  // Add moment sheet - click the + button
  await page.evaluate(() => {
    const allEls = [...document.querySelectorAll('*')];
    for (const el of allEls) {
      if (el.children.length === 0 && el.textContent && el.textContent.trim() === '+') {
        el.click(); return;
      }
    }
  });
  await sleep(900); await ss('13_add_moment_sheet');
  await page.keyboard.press('Escape'); await sleep(400);

  // Try clicking Xem cả ngày from home
  await clickText('Xem cả ngày'); await sleep(800); await ss('14_day_screen_from_home');

  await browser.close();
  console.log('ALL DONE');
})().catch(e => { console.error(e); process.exit(1); });
