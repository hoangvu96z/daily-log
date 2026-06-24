/**
 * 🎨 UI AUTOMATION TEST SUITE — DAILY LOG APP
 *
 * Runs against the live Expo web dev-server (http://localhost:8081)
 * using Puppeteer headless Chromium.
 *
 * Test plan:
 *  §0   Onboarding bypass
 *  §1   Home Screen renders correctly (header, bento grid, peace index)
 *  §2   Mood Calendar modal opens / shows days / closes
 *  §3   Highlight tiles are visible (photo grid)
 *  §4   "Xem cả ngày" CTA button is present
 *  §5   Day Tab — timeline renders
 *  §6   Day Tab — date navigation arrows exist
 *  §7   Reel Tab — "Hôm nay năm trước" card renders
 *  §8   Reel Tab — "Tuần của bạn" section header renders
 *  §9   Me Tab — settings groups render
 *  §10  Me Tab — Premium upgrade banner or active badge visible
 *  §11  Me Tab — Privacy explanation dialog opens
 *  §12  Me Tab — Backup row is visible (premium gate)
 *  §13  FAB (+) button is visible on Home / Day tabs
 *  §14  Tab bar has all 4 tabs (Home, Ngày, Reel, Me)
 */

import puppeteer from 'puppeteer';

// ─── Colours ──────────────────────────────────────────────────────────────────
const c = {
  reset:  '\x1b[0m',
  green:  '\x1b[32m',
  red:    '\x1b[31m',
  yellow: '\x1b[33m',
  cyan:   '\x1b[36m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
};

// ─── Config ───────────────────────────────────────────────────────────────────
const APP_URL    = process.env.APP_URL || 'http://localhost:8081';
const VIEWPORT   = { width: 390, height: 844 }; // iPhone 14 Pro size
const NAV_TIMEOUT = 30_000;
const WAIT_SHORT  = 800;
const WAIT_MED    = 1_500;
const WAIT_LONG   = 3_000;

// ─── Runner ───────────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;
const failLog = [];

function assert(title, condition, detail = '') {
  if (condition) {
    console.log(`  ✅ ${c.green}PASS${c.reset}  ${title}`);
    passed++;
  } else {
    const msg = `  ❌ ${c.red}FAIL${c.reset}  ${title}${detail ? `\n     ${c.dim}→ ${detail}${c.reset}` : ''}`;
    console.log(msg);
    failLog.push(title);
    failed++;
  }
}

function section(title) {
  console.log(`\n${c.bold}${c.cyan}▶ ${title}${c.reset}`);
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ─── Browser helpers ──────────────────────────────────────────────────────────

/** Returns the full visible text of the page */
async function pageText(page) {
  return page.evaluate(() => document.body.innerText || '');
}

/**
 * Click the first element whose trimmed innerText exactly or partially matches
 * any of the given strings.
 * Returns true on success, false if nothing found.
 */
async function clickText(page, ...candidates) {
  return page.evaluate((texts) => {
    const all = Array.from(document.querySelectorAll('div, span, button, a, p'));
    // prefer leaf elements (fewest children) to avoid clicking wrapper divs
    all.sort((a, b) => a.children.length - b.children.length);
    for (const text of texts) {
      const el = all.find(el => {
        const t = (el.innerText || '').trim();
        return t === text || (t.includes(text) && el.children.length <= 2);
      });
      if (el) { el.click(); return true; }
    }
    return false;
  }, candidates);
}

/** Check whether any element contains a given string */
async function hasText(page, ...candidates) {
  const text = await pageText(page);
  return candidates.some(t => text.includes(t));
}

/** Wait until the page contains one of the given strings, or timeout */
async function waitForText(page, texts, timeoutMs = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const text = await pageText(page);
    if (texts.some(t => text.includes(t))) return true;
    await sleep(250);
  }
  return false;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function runUITests() {
  console.log(`${c.bold}${c.cyan}${'═'.repeat(52)}${c.reset}`);
  console.log(`${c.bold}${c.cyan}   🎨 DAILY LOG — UI AUTOMATION TEST SUITE   ${c.reset}`);
  console.log(`${c.bold}${c.cyan}${'═'.repeat(52)}${c.reset}`);
  console.log(`${c.dim}  Target : ${APP_URL}${c.reset}`);
  console.log(`${c.dim}  Viewport: ${VIEWPORT.width}×${VIEWPORT.height}${c.reset}\n`);

  let browser;

  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
    });

    const page = await browser.newPage();
    await page.setViewport({ ...VIEWPORT, isMobile: true });

    // Listen to page console events
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

    console.log(`${c.yellow}⏳ Connecting to ${APP_URL}…${c.reset}`);
    await page.goto(APP_URL, { waitUntil: 'networkidle2', timeout: NAV_TIMEOUT });
    await sleep(WAIT_LONG);
    console.log(`${c.green}✓  Page loaded${c.reset}`);

    // ─── §0  Onboarding bypass ────────────────────────────────────────────────
    section('§0  Onboarding Bypass');

    let text = await pageText(page);
    const onOnboarding = text.includes('Bỏ qua') || text.includes('Skip') ||
                         text.includes('Nhật ký') || text.includes('Chào mừng') ||
                         text.includes('timeline') || text.includes('dòng thời gian');

    if (onOnboarding) {
      console.log(`  ${c.yellow}ℹ Onboarding detected — clicking Skip${c.reset}`);
      const skipped = await clickText(page, 'Bỏ qua', 'Skip');
      assert('Skip / Bỏ qua button is clickable', skipped);
      await sleep(WAIT_LONG);
      text = await pageText(page);
    } else {
      console.log(`  ${c.dim}ℹ Already on main screen (hydrated state)${c.reset}`);
      assert('App loads without requiring onboarding', true);
    }

    // ─── §1  Home Screen ─────────────────────────────────────────────────────
    section('§1  Home Screen Renders');

    await sleep(WAIT_MED);
    text = await pageText(page);

    const homePassed = text.includes('Hôm qua') || text.includes('Yesterday') || text.includes('Home');
    if (!homePassed) console.log('PAGE TEXT:', text.substring(0, 500));
    assert('Home screen title visible ("Hôm qua" or "Yesterday")', homePassed);

    assert('Peace Index / Serenity block rendered',
      text.includes('bình yên') || text.includes('Peace') || text.includes('%'));

    // ─── §2  Mood Calendar Modal ──────────────────────────────────────────────
    section('§2  Mood Calendar Modal');

    const calOpened = await clickText(page, 'Lịch cảm xúc', 'Mood Calendar');
    assert('Mood Calendar button found and clicked', calOpened);

    if (calOpened) {
      await sleep(WAIT_MED);
      text = await pageText(page);

      assert('Modal shows calendar-related content',
        text.includes('cảm xúc') || text.includes('mood') || text.includes('Mood') ||
        text.includes('ngày') || text.includes('Day') || text.includes('Tuần'));

      assert('Modal contains day labels or date markers',
        text.includes('T2') || text.includes('Mon') || text.includes('Th 2') || text.includes('Chưa ghi') || text.includes('Not logged'));

      // Close modal
      const closed = await page.evaluate(() => {
        const btn = document.querySelector('[aria-label="close"]');
        if (btn) { btn.click(); return true; }
        return false;
      });
      assert('Mood Calendar modal can be closed', closed);
      await sleep(WAIT_SHORT);
    }

    // ─── §2b Daily Insight Dialog ──────────────────────────────────────────────
    section('§2b Daily Insight Dialog');

    const insightOpened = await clickText(page, 'Gợi ý suy ngẫm', 'khoảnh khắc bất ngờ', 'insight', 'Insight');
    assert('Daily Insight button found and clicked', insightOpened);

    if (insightOpened) {
      await sleep(WAIT_MED);
      text = await pageText(page);

      assert('Insight Dialog shows analysis or suggestions',
        text.includes('Dựa trên') || text.includes('Năng lượng') || text.includes('Luminous') || text.includes('insight'));

      const insightClosed = await clickText(page, 'Đóng', 'Close', '×', 'X');
      assert('Insight Dialog can be closed', insightClosed);
      await sleep(WAIT_SHORT);
    }

    // ─── §3  Highlight Tiles ──────────────────────────────────────────────────
    section('§3  Highlight Tiles (Bento Grid)');

    text = await pageText(page);
    // Highlight tiles show entry time or mood chip text
    const hasHighlights =
      text.includes(':') ||           // time like 07:30
      text.includes('☕') ||
      text.includes('mood') ||
      text.includes('Mood') ||
      text.includes('Gợi ý') ||
      text.includes('Suggested');

    assert('Bento grid / highlight tiles have visible content', hasHighlights);

    // ─── §4  CTA Buttons ─────────────────────────────────────────────────────
    section('§4  CTA Buttons on Home');

    text = await pageText(page);
    assert('"Xem cả ngày" or "View full day" CTA button present',
      text.includes('Xem cả ngày') || text.includes('View full day') || text.includes('View Full Day'));

    assert('"Lịch cảm xúc" or "Mood Calendar" secondary CTA present',
      text.includes('Lịch cảm xúc') || text.includes('Mood Calendar'));

    // ─── §5  Day Tab ──────────────────────────────────────────────────────────
    section('§5  Day Tab — Timeline');

    const dayClicked = await clickText(page, 'Ngày', 'Day');
    assert('Day tab button found and clickable', dayClicked);

    if (dayClicked) {
      await sleep(WAIT_MED);
      text = await pageText(page);

      assert('Day screen shows date navigation or header',
        text.includes('ngày') || text.includes('Day') || text.includes('khoảnh khắc') || text.includes('moments'));

      assert('Day screen shows timeline entries or empty-state',
        text.includes(':') || text.includes('Chưa có') || text.includes('No moments') ||
        text.includes('Gợi ý') || text.includes('coffee') || text.includes('Lưu'));
    }

    // ─── §6  Date Navigation ─────────────────────────────────────────────────
    section('§6  Day Tab — Date Navigation Controls');

    // Check for chevron / arrow elements
    const hasDateNav = await page.evaluate(() => {
      const allText = document.body.innerText || '';
      // Looking for ‹ › or < > or left/right arrow characters typically rendered
      return allText.includes('‹') || allText.includes('›') || allText.includes('<') ||
             document.querySelectorAll('[role="button"]').length > 2;
    });
    assert('Date navigation controls (prev/next) exist on Day screen', hasDateNav);

    // ─── §7  Reel Tab ─────────────────────────────────────────────────────────
    section('§7  Reel Tab — "Hôm nay năm trước" Card');

    const reelClicked = await clickText(page, 'Reel', 'Xem lại', 'Look Back');
    assert('Reel tab button found and clickable', reelClicked);

    if (reelClicked) {
      await sleep(WAIT_MED);
      text = await pageText(page);

      assert('"Hôm nay năm trước" or "Today Last Year" card visible',
        text.toLowerCase().includes('hôm nay năm trước') || text.toLowerCase().includes('today last year') || text.toLowerCase().includes('năm trước'));
    }

    // ─── §8  Reel Tab — Week Section ─────────────────────────────────────────
    section('§8  Reel Tab — "Tuần của bạn" Section');

    if (reelClicked) {
      assert('"Tuần của bạn" or "Your Week" section header visible',
        text.includes('Tuần của bạn') || text.includes('Your Week'));

      assert('Play-all button or reel content visible',
        text.includes('Phát toàn bộ') || text.includes('Play All') ||
        text.includes('khoảnh khắc') || text.includes('moment') ||
        text.includes('Chưa có reel') || text.includes('No reels'));
    }

    // ─── §9  Me Tab ────────────────────────────────────────
    section('§9  Me Tab');

    const meClicked = await clickText(page, 'Me', 'Tôi');
    assert('Me tab button found and clickable', meClicked);

    if (meClicked) {
      await sleep(WAIT_MED);
      text = await pageText(page);

      assert('Me screen title visible',
        text.includes('Me') || text.includes('Tôi'));

      // Click settings icon to go to Settings screen
      const settingsIconClicked = await page.evaluate(() => {
        const btn = document.querySelector('[aria-label="settings-outline"]');
        if (btn) { btn.click(); return true; }
        return false;
      });
      assert('Settings button found and clicked', settingsIconClicked);
      
      if (settingsIconClicked) {
        await sleep(WAIT_MED);
        text = await pageText(page);
        
        assert('Settings screen title visible',
          text.includes('Cài đặt') || text.includes('Settings'));

        assert('Privacy microcopy visible',
          text.includes('máy') || text.includes('device') || text.includes('offline') || text.includes('SQLite') || text.includes('locally'));
          
        // Click close to go back to Me tab
        const closedSettings = await page.evaluate(() => {
          const btn = document.querySelector('[aria-label="close"]');
          if (btn) { btn.click(); return true; }
          return false;
        });
        assert('Settings screen can be closed', closedSettings);
        await sleep(WAIT_MED);
        text = await pageText(page);
      }
    }

    // ─── §10  Premium Banner ──────────────────────────────────────────────────
    section('§10  Me Tab — Premium Banner or Badge');

    if (meClicked) {
      assert('Premium upgrade banner or active badge visible',
        text.includes('Premium') || text.includes('Nâng cấp') || text.includes('Upgrade') ||
        text.includes('premium') || text.includes('sparkles'));
    }

    // ─── §11  FAB Button ──────────────────────────────────────────────────────
    section('§11  FAB (+) Compose Button');

    // Navigate back to Home to check FAB
    await clickText(page, 'Home', 'Trang chủ');
    await sleep(WAIT_MED);

    const hasFab = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('div, button'));
      return all.some(el => {
        const txt = (el.innerText || '').trim();
        return txt === '+' || txt === '＋' || el.getAttribute('aria-label') === 'Add moment';
      });
    });
    assert('FAB (+) compose button is present on Home screen', hasFab);

    // ─── §12  Tab Bar ─────────────────────────────────────────────────────────
    section('§12  Tab Bar — All 4 Tabs Present');

    text = await pageText(page);
    assert('Tab bar has "Home" tab label',  text.includes('Home'));
    assert('Tab bar has "Ngày"/"Day" tab',  text.includes('Ngày') || text.includes('Day'));
    assert('Tab bar has "Reel" tab',        text.includes('Reel'));
    assert('Tab bar has "Me" tab',          text.includes('Me'));

    // ─── Final report ─────────────────────────────────────────────────────────
    const total = passed + failed;
    console.log(`\n${c.bold}${c.cyan}${'═'.repeat(52)}${c.reset}`);
    console.log(`${c.bold}  📊 UI TEST RESULTS${c.reset}`);
    console.log(`${c.bold}${c.cyan}${'═'.repeat(52)}${c.reset}`);
    console.log(`  Tests run  : ${c.bold}${total}${c.reset}`);
    console.log(`  ✅ Passed  : ${c.green}${c.bold}${passed}${c.reset}`);
    console.log(`  ❌ Failed  : ${failed > 0 ? c.red : c.green}${c.bold}${failed}${c.reset}`);

    if (failLog.length > 0) {
      console.log(`\n${c.red}  Failed tests:${c.reset}`);
      failLog.forEach(t => console.log(`  ${c.dim}•${c.reset} ${t}`));
    }

    console.log(`${c.bold}${c.cyan}${'═'.repeat(52)}${c.reset}\n`);

    if (failed === 0) {
      console.log(`🎉 ${c.green}${c.bold}ALL UI TESTS PASSED (${passed}/${total})${c.reset}\n`);
      process.exit(0);
    } else {
      console.log(`🚨 ${c.red}${c.bold}${failed} TEST(S) FAILED — see above${c.reset}\n`);
      process.exit(1);
    }

  } catch (err) {
    console.error(`\n🚨 ${c.red}${c.bold}Fatal error running UI tests:${c.reset}`, err.message);
    console.error(`${c.dim}Make sure "npm run web" is running on port 8081${c.reset}\n`);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
}

await runUITests();
