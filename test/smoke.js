// Headless smoke test: loads the site, captures console/page errors,
// verifies injected content, exercises scroll + the film + the video modal.
const { chromium } = require("playwright");

(async () => {
  const errors = [];
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on("console", (m) => {
    if (m.type() === "error") errors.push("CONSOLE: " + m.text());
  });
  page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));
  page.on("requestfailed", (r) => {
    // ignore CDN/network flakiness; we only care about local asset failures
    if (r.url().includes("localhost:5173")) errors.push("REQFAIL: " + r.url());
  });

  await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });

  // wait for the preloader to finish (2.1s anim + margin)
  await page.waitForFunction(
    () => document.getElementById("loader").classList.contains("is-done"),
    { timeout: 8000 }
  );
  console.log("loader: finished");

  // verify injected content
  const counts = await page.evaluate(() => ({
    stats: document.querySelectorAll(".stat").length,
    anthems: document.querySelectorAll(".anthem").length,
    eras: document.querySelectorAll(".era").length,
    tracks: document.querySelectorAll(".track").length,
    canvasHasSize: (() => {
      const c = document.getElementById("filmCanvas");
      return c && c.width > 0 && c.height > 0;
    })(),
    disclaimer: (document.getElementById("disclaimer") || {}).textContent || "",
    yearNow: (document.getElementById("yearNow") || {}).textContent || "",
  }));
  console.log("counts:", JSON.stringify(counts));

  // a stat should have counted up (not still showing 0)
  const statText = await page.evaluate(
    () => document.querySelector(".stat__value").textContent
  );
  console.log("first stat value:", statText);

  // scroll through the film to force frame renders + chapter changes
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.2));
  await page.waitForTimeout(600);
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2.6));
  await page.waitForTimeout(600);
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 3.8));
  await page.waitForTimeout(600);
  const activeChapter = await page.evaluate(
    () => (document.querySelector(".film__chapter.is-active") || {}).dataset?.chapter
  );
  console.log("active film chapter after scroll:", activeChapter);

  // open the video modal by clicking the first anthem
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  await page.click(".anthem .anthem__play");
  await page.waitForTimeout(500);
  const modalOpen = await page.evaluate(
    () => document.getElementById("modal").classList.contains("is-open")
  );
  const iframeSrc = await page.evaluate(
    () => (document.querySelector("#modalPlayer iframe") || {}).src || ""
  );
  console.log("modal open:", modalOpen, "| iframe:", iframeSrc);

  // close modal
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  const modalClosed = await page.evaluate(
    () => !document.getElementById("modal").classList.contains("is-open")
  );
  console.log("modal closed on Escape:", modalClosed);

  await browser.close();

  if (errors.length) {
    console.log("\n=== ERRORS ===");
    errors.forEach((e) => console.log(e));
    process.exit(1);
  } else {
    console.log("\nNO CONSOLE/PAGE ERRORS ✓");
  }
})();
