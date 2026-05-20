const puppeteer = require('puppeteer');
const path = require('path');

const artifactDir = '/Users/hoangvu96z/.gemini/antigravity-ide/brain/6c8605af-e558-449a-bf4c-d3eb870671c4';

async function takeScreenshot(page, filename) {
  const filepath = path.join(artifactDir, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`📸 Screenshot saved: ${filepath}`);
}

async function runUITests() {
  console.log('Running screenshot script...');
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    // Simulate a typical mobile screen size for better native-like screenshots
    await page.setViewport({ width: 390, height: 844, isMobile: true });
    
    await page.goto('http://localhost:8081', { waitUntil: 'networkidle2', timeout: 30000 });
    console.log('Successfully loaded web app page!');
    
    // Wait for hydration
    await new Promise(r => setTimeout(r, 2000));

    // --- Onboarding Bypass ---
    await page.waitForSelector('body', { timeout: 5000 });
    let pageText = await page.evaluate(() => document.body.innerText);

    if (pageText.includes('Bỏ qua') || pageText.includes('Skip') || pageText.includes('Chào mừng') || pageText.includes('Nhật ký')) {
      await takeScreenshot(page, 'onboarding.png');
      
      const elements = await page.$$('div');
      let skipBtn = null;
      for (const el of elements) {
        const text = await page.evaluate(e => e.innerText, el);
        if (text && text.trim() === 'Bỏ qua') {
          skipBtn = el;
          break;
        }
      }

      if (skipBtn) {
        await page.evaluate(e => e.click(), skipBtn);
        await new Promise(r => setTimeout(r, 3000));
        pageText = await page.evaluate(() => document.body.innerText);
      }
    }

    // --- Home Screen ---
    await new Promise(r => setTimeout(r, 2000));
    await takeScreenshot(page, 'home_screen.png');

    // --- Mood Calendar Modal ---
    const buttons = await page.$$('div');
    let targetBtn = null;
    
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.innerText, btn);
      if (text && (text.includes('Lịch cảm xúc') || text.includes('Mood Calendar') || text.includes('7 ngày qua'))) {
        targetBtn = btn;
      }
    }
    
    if (!targetBtn) {
       for (const btn of buttons) {
          const text = await page.evaluate(el => el.innerText, btn);
          if (text && (text.includes('Lịch') || text.includes('Calendar'))) {
              targetBtn = btn;
          }
       }
    }

    if (targetBtn) {
      await page.evaluate(e => e.click(), targetBtn);
      await new Promise(r => setTimeout(r, 1000));
      await takeScreenshot(page, 'mood_calendar.png');
      
      // Close the modal
      const closeButtons = await page.$$('div');
      for (let i = closeButtons.length - 1; i >= 0; i--) {
        const cb = closeButtons[i];
        const text = await page.evaluate(el => el.innerText ? el.innerText.trim() : '', cb);
        if (text === 'Đóng' || text === 'Close' || text === 'X') {
          await page.evaluate(e => e.click(), cb);
          await new Promise(r => setTimeout(r, 1000));
          break;
        }
      }
    }

    // --- Day Tab ---
    const tabs = await page.$$('div');
    let dayTab = null;
    
    for (const tab of tabs) {
      const text = await page.evaluate(el => el.innerText, tab);
      if (text && (text.trim() === 'Ngày' || text.trim() === 'Day' || text.trim() === 'Timeline')) {
        dayTab = tab;
        break;
      }
    }
    
    if (dayTab) {
      await page.evaluate(e => e.click(), dayTab);
      await new Promise(r => setTimeout(r, 2000));
      await takeScreenshot(page, 'day_tab.png');
    }

    // --- Me Tab ---
    let meTab = null;
    for (const tab of tabs) {
      const text = await page.evaluate(el => el.innerText, tab);
      if (text && (text.trim() === 'Me' || text.trim() === 'Tôi' || text.trim() === 'Settings')) {
        meTab = tab;
        break;
      }
    }
    
    if (meTab) {
      await page.evaluate(e => e.click(), meTab);
      await new Promise(r => setTimeout(r, 2000));
      await takeScreenshot(page, 'settings_tab.png');
    }

    console.log('Screenshots generated successfully!');
    process.exit(0);

  } catch (err) {
    console.error(`Error:`, err.message);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

runUITests();
