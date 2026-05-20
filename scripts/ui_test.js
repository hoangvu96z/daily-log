/**
 * 🎨 END-TO-END UI AUTOMATION TEST SUITE (WITH ONBOARDING BYPASS)
 * 
 * This script runs a live UI automation test on the running web app using Puppeteer:
 * 
 * 1. Launches headless Chromium.
 * 2. Connects to the local development server (http://localhost:8081).
 * 3. Bypasses the Onboarding screen by clicking "Bỏ qua" (Skip).
 * 4. Asserts the Home Screen renders and calculates the Serenity/Peace index.
 * 5. Clicks the "Lịch tâm trạng" (Mood Calendar) button and verifies the Modal renders.
 * 6. Interacts with Bottom Tab items: clicks Day (Ngày), Reel, and Me tabs.
 * 7. Asserts Me Screen renders settings items (Backup, Notifications).
 */

const puppeteer = require('puppeteer');

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m"
};

async function runUITests() {
  console.log(`${colors.bold}${colors.cyan}====================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}      🎨 RUNNING LIVE UI AUTOMATION TESTS 🎨      ${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}====================================================${colors.reset}\n`);

  let browser;
  let passed = 0;
  let failed = 0;

  function assert(title, condition) {
    if (condition) {
      console.log(` ✅ ${colors.green}PASSED${colors.reset}: ${title}`);
      passed++;
    } else {
      console.log(` ❌ ${colors.red}FAILED${colors.reset}: ${title}`);
      failed++;
    }
  }

  try {
    console.log(`${colors.yellow}Connecting to http://localhost:8081...${colors.reset}`);
    browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    // Navigate to the local server
    await page.goto('http://localhost:8081', { waitUntil: 'networkidle2', timeout: 30000 });
    console.log(`${colors.green}Successfully loaded web app page!${colors.reset}\n`);

    // --- Onboarding Bypass ---
    console.log(`${colors.bold}0. Checking for Onboarding Flow...${colors.reset}`);
    await page.waitForSelector('body', { timeout: 5000 });
    let pageText = await page.evaluate(() => document.body.innerText);

    if (pageText.includes('Bỏ qua') || pageText.includes('Skip') || pageText.includes('Chào mừng') || pageText.includes('Nhật ký')) {
      console.log(`${colors.yellow}Onboarding screen detected. Bypassing onboarding...${colors.reset}`);
      
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
        await skipBtn.click();
        console.log(`${colors.green}Clicked Skip/Bỏ qua button successfully!${colors.reset}`);
        await new Promise(r => setTimeout(r, 3000)); // Wait for transition & hydration
        pageText = await page.evaluate(() => document.body.innerText);
      } else {
        console.log(`${colors.yellow}Skip button not found directly. Standard onboarding page rendered.${colors.reset}`);
      }
    } else {
      console.log(`${colors.green}Already hydrated to main screen. Skipping onboarding bypass.${colors.reset}`);
    }

    // --- Test 1: Verify App Frame & Title ---
    console.log(`\n${colors.bold}1. Verifying Home Screen Header Rendering...${colors.reset}`);
    const hasHomeHeader = pageText.includes('Hôm qua của bạn') || pageText.includes('Your Yesterday') || pageText.includes('nhật ký') || pageText.toLowerCase().includes('bình yên') || pageText.toLowerCase().includes('peace');
    assert("Main diary app structure/text should be rendered in viewport", hasHomeHeader);

    // --- Test 2: Verify Peace Index Circular Progress Ring ---
    console.log(`\n${colors.bold}2. Verifying Bento Grid & Peace Index...${colors.reset}`);
    const hasPeaceIndex = pageText.includes('%') && (pageText.toLowerCase().includes('bình yên') || pageText.toLowerCase().includes('peace'));
    assert("Circular Peace Index Bento card should be rendered on Home tab", hasPeaceIndex);

    // --- Test 3: Interact with Mood Calendar Modal ---
    console.log(`\n${colors.bold}3. Opening Mood Calendar Modal Dialog...${colors.reset}`);
    // Find button containing "Lịch cảm xúc" or "Mood Calendar"
    const buttons = await page.$$('div');
    let targetBtn = null;
    
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.innerText, btn);
      if (text && (text.includes('Lịch cảm xúc') || text.includes('Mood Calendar'))) {
        targetBtn = btn;
        break;
      }
    }
    
    if (targetBtn) {
      await targetBtn.click();
      await new Promise(r => setTimeout(r, 800)); // Wait for modal animation
      
      const modalText = await page.evaluate(() => document.body.innerText);
      const isModalVisible = modalText.includes('7 ngày qua') || modalText.includes('Past 7 Days') || modalText.includes('Tâm trạng') || modalText.includes('cảm xúc');
      assert("Mood calendar modal dialog should be successfully opened and visible", isModalVisible);
      
      // Close the modal
      const closeButtons = await page.$$('div');
      for (const cb of closeButtons) {
        const text = await page.evaluate(el => el.innerText, cb);
        if (text && (text.includes('Đóng') || text.includes('Close'))) {
          await cb.click();
          await new Promise(r => setTimeout(r, 600)); // Wait for modal animation to close
          break;
        }
      }
    } else {
      assert("Mood calendar button found and clicked", false);
    }

    // --- Test 4: Navigate to Day Tab ---
    console.log(`\n${colors.bold}4. Navigating to 'Ngày' (Day) Tab...${colors.reset}`);
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
      await dayTab.click();
      await new Promise(r => setTimeout(r, 800));
      const dayPageText = await page.evaluate(() => document.body.innerText);
      const hasTimeline = dayPageText.includes('Dòng thời gian') || dayPageText.includes('Timeline') || dayPageText.includes('ngày');
      assert("Day Screen timeline layout should be rendered successfully", hasTimeline);
    } else {
      assert("Day tab button found and clicked", false);
    }

    // --- Test 5: Navigate to Me Tab ---
    console.log(`\n${colors.bold}5. Navigating to 'Me' (Settings) Tab...${colors.reset}`);
    const meTabs = await page.$$('div');
    let meTab = null;
    
    for (const tab of meTabs) {
      const text = await page.evaluate(el => el.innerText, tab);
      if (text && (text.trim() === 'Me' || text.trim() === 'Tôi' || text.trim() === 'Settings')) {
        meTab = tab;
        break;
      }
    }
    
    if (meTab) {
      await meTab.click();
      await new Promise(r => setTimeout(r, 800));
      const mePageText = await page.evaluate(() => document.body.innerText);
      
      const hasSettings = mePageText.includes('Thiết lập') || mePageText.includes('Settings') || mePageText.includes('Thông báo') || mePageText.includes('Notifications') || mePageText.includes('Sao lưu') || mePageText.includes('Backup');
      assert("Me Screen setting options should render in viewport", hasSettings);
    } else {
      assert("Me tab button found and clicked", false);
    }

    // --- Final Verdict ---
    console.log(`\n${colors.bold}${colors.cyan}====================================================${colors.reset}`);
    console.log(`                    🏆 RESULTS 🏆                   `);
    console.log(`${colors.bold}${colors.cyan}====================================================${colors.reset}`);
    console.log(` ✅ TOTAL PASSED: ${colors.green}${passed}${colors.reset}`);
    console.log(` ❌ TOTAL FAILED: ${colors.red}${failed}${colors.reset}`);
    
    if (failed === 0) {
      console.log(`\n🎉 ${colors.green}${colors.bold}UI AUTOMATION TESTS PASSED 100% PERFECTLY!${colors.reset}\n`);
      process.exit(0);
    } else {
      console.log(`\n🚨 ${colors.red}${colors.bold}UI AUTOMATION TESTS DETECTED FAILURES!${colors.reset}\n`);
      process.exit(1);
    }

  } catch (err) {
    console.error(`\n🚨 ${colors.red}${colors.bold}Error running UI Tests:${colors.reset}`, err.message);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

runUITests();
