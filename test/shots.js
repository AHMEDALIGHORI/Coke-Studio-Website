// Capture screenshots of each section to verify visual design quality.
const { chromium } = require("playwright");

(async () => {
  const b = await chromium.launch();
  const page = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.getElementById("loader").classList.contains("is-done"), { timeout: 8000 });

  const shots = [
    { name: "01-hero", scroll: 0, wait: 800 },
    { name: "02-film-mid", scroll: 1400, wait: 700 },
    { name: "03-film-late", scroll: 3600, wait: 700 },
    { name: "04-stats", scroll: () => document.getElementById("stats").offsetTop - 200, wait: 3200 },
    { name: "05-anthems", scroll: () => document.getElementById("anthems").offsetTop, wait: 3200 },
    { name: "06-legacy", scroll: () => document.getElementById("legacy").offsetTop + 400, wait: 1200 },
    { name: "07-catalog", scroll: () => document.getElementById("catalog").offsetTop, wait: 1400 },
    { name: "08-tribute", scroll: 1e7, wait: 1400 },
  ];

  for (const s of shots) {
    const y = typeof s.scroll === "function" ? await page.evaluate(s.scroll) : s.scroll;
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(s.wait);
    await page.screenshot({ path: `d:/CokeStudio Pakistan/test/shots/${s.name}.png` });
    console.log("captured", s.name);
  }

  // modal shot
  await page.evaluate(() => window.scrollTo(0, document.getElementById("anthems").offsetTop));
  await page.waitForTimeout(1500);
  await page.click(".anthem .anthem__play");
  await page.waitForTimeout(900);
  await page.screenshot({ path: "d:/CokeStudio Pakistan/test/shots/09-modal.png" });
  console.log("captured 09-modal");

  await b.close();
})();
