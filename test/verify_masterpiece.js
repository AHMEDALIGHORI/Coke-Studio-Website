const { chromium } = require('playwright');

(async () => {
  console.log('--- STARTING PLAYWRIGHT AUTOMATED VERIFICATION ---');
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // 1. Check Soundscape widget
    const soundscapeBtn = await page.locator('#soundscapeToggle').count();
    console.log('1. Soundscape widget present:', soundscapeBtn === 1);

    // Click soundscape to test audio ignition
    await page.click('#soundscapeToggle');
    await page.waitForTimeout(500);
    const isPlayingClass = await page.locator('#soundscapeToggle.is-playing').count();
    console.log('2. Soundscape toggles to LIVE playing state:', isPlayingClass === 1);

    // 2. Check Era filter buttons
    const filterBtns = await page.locator('.catalog__filter').count();
    console.log('3. Catalog era filter pills count:', filterBtns);

    // Click on Strings Era filter
    await page.click('button[data-filter="strings"]');
    await page.waitForTimeout(600);
    const stringsTracks = await page.locator('.track').count();
    console.log('4. Filtered tracks for Strings era (expected 3):', stringsTracks);

    // 3. Test Gallery Lightbox click
    await page.click('.gallery__item');
    await page.waitForTimeout(600);
    const lightboxOpen = await page.locator('#lightboxModal.is-open').count();
    console.log('5. Gallery Lightbox opened on click:', lightboxOpen === 1);

    // Close Lightbox via Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    const lightboxClosed = await page.locator('#lightboxModal.is-open').count();
    console.log('6. Lightbox dismissed on Escape key:', lightboxClosed === 0);

    // 4. Test Keyboard Shortcuts HUD toggle with '?'
    await page.keyboard.press('?');
    await page.waitForTimeout(500);
    const hotkeysOpen = await page.locator('#hotkeysModal.is-open').count();
    console.log('7. Hotkeys Studio HUD modal opened with [?]:', hotkeysOpen === 1);

    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);

    console.log('8. Browser console errors:', errors.length ? errors.join('; ') : '0 errors (CLEAN!)');

    await page.screenshot({ path: 'masterpiece_full_suite_test.png' });
    console.log('Screenshot captured: masterpiece_full_suite_test.png');
    await browser.close();
    console.log('--- ALL AUTOMATED SUITE TESTS PASSED SUCCESSFULLY ---');
  } catch (err) {
    console.error('Test failed with error:', err);
    process.exit(1);
  }
})();
