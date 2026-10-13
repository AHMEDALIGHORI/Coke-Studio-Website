/* Render anti-slop/og-card.html -> anti-slop/og-card.png at 1200x630.
   The card uses the site's own fonts (loaded over the network) and the
   portrait key art, so we wait for the network to idle before capture. */
const { chromium } = require("playwright");
const path = require("path");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  const file = "file://" + path.resolve(__dirname, "og-card.html");
  await page.goto(file, { waitUntil: "networkidle" });
  // give webfonts a beat to apply
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.resolve(__dirname, "og-card.png") });
  await browser.close();
  console.log("OG-CARD-RENDERED");
})().catch((e) => {
  console.error("OG-CARD-ERR", e);
  process.exit(1);
});
