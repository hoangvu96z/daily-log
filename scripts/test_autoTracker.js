const puppeteer = require('puppeteer');

(async () => {
  console.log('Khởi động trình duyệt để test AutoTracker...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  // Bắt console.log từ trong React Native Web
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('[AutoTracker]')) {
      console.log('APP LOG:', text);
    }
  });

  try {
    console.log('Mở trang Home...');
    await page.goto('http://localhost:8081/', { waitUntil: 'networkidle0', timeout: 10000 });
    
    // Đợi 3 giây để xem có log nào bắn ra không
    await new Promise(r => setTimeout(r, 3000));

    console.log('Chuyển sang Tab Ngày (DayScreen)...');
    // Tìm nút tab Ngày để click
    const dayTab = await page.$('[data-testid="tab-day"]');
    if (dayTab) {
      await dayTab.click();
    } else {
      console.log('Không tìm thấy nút tab Ngày, thử tìm bằng nội dung text...');
      const elements = await page.$$('div');
      for (let el of elements) {
        const text = await page.evaluate(e => e.textContent, el);
        if (text && text.includes('Ngày') || text && text.includes('Day')) {
          // Bấm đại vào thẻ div chứa text
          try { await el.click(); } catch(e) {}
        }
      }
    }
    
    // Đợi thêm 3 giây
    await new Promise(r => setTimeout(r, 3000));
    
  } catch (e) {
    console.error('Lỗi trong quá trình test:', e.message);
  } finally {
    await browser.close();
    console.log('Hoàn tất test.');
  }
})();
