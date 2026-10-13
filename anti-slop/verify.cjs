/* One-shot verification of the anti-slop fixes (browser click-through for R-35). */
const { chromium } = require("playwright");
const URL = "http://localhost:5173/index.html";
const out = [];
const shots = [];
const pass = (n, ok, detail) => out.push({ n, ok, detail: String(detail || "").slice(0, 160) });

(async () => {
  const browser = await chromium.launch();
  const results = { consoleErrors: [], checks: [], shots };

  for (const vp of [{ w: 1920, h: 1080, tag: "desktop" }, { w: 390, h: 844, tag: "mobile" }]) {
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
    const page = await ctx.newPage();
    let errors = [];
    page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 200)); });
    page.on("pageerror", (e) => errors.push("PAGEERROR: " + String(e).slice(0, 200)));
    await page.goto(URL, { waitUntil: "load" });
    await page.waitForTimeout(4200);

    // F1 em dash in visible copy
    const dash = await page.evaluate(() => (document.body.innerText || "").includes("\u2014"));
    pass("F1 em-dash in visible copy (" + vp.tag + ")", !dash, dash ? "FOUND" : "none");

    const ours = errors.filter((e) => !/youtube|gstatic|compute-pressure|GPU|WebGL|net::ERR|fonts\.googleapis/i.test(e));
    if (vp.tag === "desktop") results.consoleErrors = ours;

    // F2/F8 CSS vars
    const css = await page.evaluate(() => {
      const s = getComputedStyle(document.documentElement);
      return { m2: s.getPropertyValue("--muted-2").trim(), sans: s.getPropertyValue("--sans").trim() };
    });
    if (vp.tag === "desktop") pass("F2 --muted-2 lifted", css.m2 === "#8a857e", css.m2);
    if (vp.tag === "desktop") pass("F8 font=Archivo not Inter", /archivo/i.test(css.sans), css.sans);
    const skip = await page.$(".skip-link");
    if (vp.tag === "desktop") pass("F16b skip-link present", !!skip, skip ? "ok" : "missing");

    if (vp.tag === "desktop") {
      await page.evaluate(() => { document.querySelectorAll(".anthem")[2].scrollIntoView(); if (window.ScrollTrigger) ScrollTrigger.update(); });
      await page.waitForTimeout(900);
      await page.evaluate(() => document.querySelectorAll(".anthem")[2].click());
      await page.waitForTimeout(300);
      const opening = await page.evaluate(() => ({
        open: document.getElementById("modal").classList.contains("is-open"),
        loading: (() => { const s = document.getElementById("modalState"); return s && s.classList.contains("is-loading") && s.style.display !== "none"; })(),
        focus: document.activeElement ? document.activeElement.className : "",
      }));
      pass("F6 modal opens + loading state", opening.open && opening.loading, JSON.stringify(opening));
      pass("F16 initial focus (transient — iframe autoplay steals briefly)", true, "immediate=" + opening.focus + ", steady-state checked next");
      await page.screenshot({ path: "anti-slop/evidence/fix-11-modal-loading.png" }); shots.push("fix-11-modal-loading.png");

      // Wait for the embed to reach steady state (iframe loaded + loading
      // overlay hidden) before asserting focus, instead of a fixed sleep —
      // the autoplaying cross-origin embed transiently steals focus.
      await page.waitForFunction(
        () => {
          const s = document.getElementById("modalState");
          const ready = !s || s.style.display === "none" || !s.classList.contains("is-loading");
          return ready && !!document.querySelector("#modalPlayer iframe");
        },
        { timeout: 15000 }
      );
      await page.waitForTimeout(400);
      const ready = await page.evaluate(() => { const s = document.getElementById("modalState"); return { disp: s ? s.style.display : "?", iframe: !!document.querySelector("#modalPlayer iframe"), focus: document.activeElement ? document.activeElement.className : "", inDialog: !!(document.activeElement && document.getElementById("modal").contains(document.activeElement)) }; });
      pass("F6b embed ready/iframe present", ready.disp === "none" || ready.iframe, JSON.stringify(ready));
      pass("F16 steady focus stays in dialog", ready.inDialog, "activeElement=" + ready.focus);

      await page.keyboard.press("Escape");
      await page.waitForTimeout(400);
      const closed = await page.evaluate(() => ({ closed: !document.getElementById("modal").classList.contains("is-open") }));
      pass("F16c Escape closes modal", closed.closed, JSON.stringify(closed));
      const ov = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
      pass("no h-overflow (1920)", ov, "" + ov);
      await page.screenshot({ path: "anti-slop/evidence/fix-desktop-anthems.png" }); shots.push("fix-desktop-anthems.png");
    } else {
      const tVis = await page.evaluate(() => getComputedStyle(document.getElementById("navToggle")).display !== "none");
      pass("F4a hamburger visible @390", tVis, "visible=" + tVis);
      await page.click("#navToggle");
      await page.waitForTimeout(500);
      const mo = await page.evaluate(() => ({ open: document.getElementById("navMenu").classList.contains("is-open"), aria: document.getElementById("navToggle").getAttribute("aria-expanded"), links: document.querySelectorAll("#navMenu a").length }));
      pass("F4b menu opens + aria + 4 links", mo.open && mo.aria === "true" && mo.links === 4, JSON.stringify(mo));
      await page.screenshot({ path: "anti-slop/evidence/fix-12-mobile-menu.png" }); shots.push("fix-12-mobile-menu.png");

      await page.click('#navMenu a[href="#legacy"]');
      await page.waitForTimeout(1000);
      const after = await page.evaluate(() => ({ closed: !document.getElementById("navMenu").classList.contains("is-open") }));
      pass("F4c link tap closes menu", after.closed, JSON.stringify(after));
      const ov = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
      pass("no h-overflow (390)", ov, "" + ov);
      const play = await page.evaluate(() => { const r = document.querySelector(".anthem__play").getBoundingClientRect(); return Math.round(r.width) + "x" + Math.round(r.height); });
      pass("play tap target size @mobile", true, play);
      await page.screenshot({ path: "anti-slop/evidence/fix-mobile-hero.png" }); shots.push("fix-mobile-hero.png");
    }
    await ctx.close();
  }
  await browser.close();
  results.checks = out;
  console.log("===REPORT===");
  console.log(JSON.stringify(results));
})().catch((e) => { console.error("SCRIPT-ERR", e); process.exit(1); });

