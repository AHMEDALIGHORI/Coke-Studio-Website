/* =========================================================================
   Coke Studio Pakistan - Tribute
   app.js - orchestrates the scroll-scrubbed cinematic film, the animated
   stats, the hall-of-fame with real YouTube playback, the pinned horizontal
   legacy timeline, the catalog, and all micro-interactions.

   Libraries (loaded in index.html): GSAP + ScrollTrigger + Lenis.
   ========================================================================= */
(function () {
  "use strict";

  const D = window.CS_DATA || {};
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

  const gsap = window.gsap || {
    registerPlugin() {},
    to(target, vars) {
      if (vars && typeof vars.v === "number") target.v = vars.v;
      if (vars && vars.onUpdate) vars.onUpdate();
      if (vars && vars.onComplete) vars.onComplete();
      return { timeScale() {} };
    },
    from() {},
    fromTo() {},
    set() {},
    utils: { toArray: (selector) => $$(selector) },
    ticker: { add() {}, lagSmoothing() {} },
  };
  const ScrollTrigger = window.ScrollTrigger || {
    update() {},
    create() {},
    refresh() {},
  };

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Formatting helpers ---------- */
  function compact(n) {
    if (n >= 1e9) return { num: (n / 1e9).toFixed(2).replace(/\.?0+$/, ""), suffix: "B" };
    if (n >= 1e6) return { num: (n / 1e6).toFixed(1).replace(/\.0$/, ""), suffix: "M" };
    if (n >= 1e3) return { num: (n / 1e3).toFixed(1).replace(/\.0$/, ""), suffix: "K" };
    return { num: String(n), suffix: "" };
  }
  function group(nStr) {
    return String(nStr).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  function animateNumber(el, target, opts) {
    opts = opts || {};
    const dur = opts.duration || 2;
    const obj = { v: 0 };
    gsap.to(obj, {
      v: target,
      duration: dur,
      ease: "power2.out",
      onUpdate() {
        const val = obj.v;
        if (opts.format === "compact") {
          const c = compact(Math.floor(val));
          el.innerHTML = group(c.num) + (c.suffix ? '<span class="suffix">' + c.suffix + "</span>" : "");
        } else if (opts.format === "decimal") {
          el.innerHTML = val.toFixed(1) + (opts.suffix ? '<span class="suffix">' + opts.suffix + "</span>" : "");
        } else {
          el.innerHTML = group(Math.floor(val)) + (opts.suffix ? '<span class="suffix">' + opts.suffix + "</span>" : "");
        }
      },
    });
  }

  /* ---------- Smooth scroll (Lenis) synced with GSAP ---------- */
  let lenis = null;
  function initLenis() {
    if (typeof Lenis === "undefined" || prefersReduced) return;
    lenis = new Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: 1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  function scrollTo(target) {
    if (lenis) lenis.scrollTo(target, { offset: -10, duration: 1.4 });
    else {
      const el = typeof target === "string" ? $(target) : target;
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }

  /* ---------- Preloader ---------- */
  function initLoader(done) {
    const loader = $("#loader");
    const fill = $("#loaderFill");
    const pct = $("#loaderPct");
    if (!loader) return done();
    const obj = { p: 0 };
    gsap.to(obj, {
      p: 100,
      duration: 2.1,
      ease: "power2.inOut",
      onUpdate() {
        fill.style.width = obj.p + "%";
        pct.textContent = Math.round(obj.p);
      },
      onComplete() {
        loader.classList.add("is-done");
        document.body.classList.remove("is-loading");
        setTimeout(done, 120);
      },
    });
  }

  /* ---------- Nav + top progress ---------- */
  function initNav() {
    const nav = $("#nav");
    const bar = $("#progressFill");
    const onScroll = () => {
      const y = window.scrollY || window.pageYOffset;
      if (nav) nav.classList.toggle("is-solid", y > 40);
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (bar && h > 0) bar.style.width = (y / h) * 100 + "%";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    $$("[data-nav]").forEach((a) =>
      a.addEventListener("click", (e) => {
        e.preventDefault();
        scrollTo(a.getAttribute("href"));
      })
    );
  }

  /* ---------- Mobile menu ---------- */
  function initMenu() {
    const toggle = $("#navToggle");
    const menu = $("#navMenu");
    if (!toggle || !menu) return;

    const setOpen = (open) => {
      toggle.classList.toggle("is-open", open);
      menu.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      menu.setAttribute("aria-hidden", open ? "false" : "true");
      document.documentElement.style.overflow = open ? "hidden" : "";
      if (lenis) (open ? lenis.stop() : lenis.start());
    };

    toggle.addEventListener("click", () => {
      setOpen(!menu.classList.contains("is-open"));
    });

    // close when a link is chosen
    $$("[data-menu]", menu).forEach((a) =>
      a.addEventListener("click", () => {
        setOpen(false);
        scrollTo(a.getAttribute("href"));
      })
    );

    // close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menu.classList.contains("is-open")) setOpen(false);
    });

    // if resized up to desktop, drop the overlay
    window.addEventListener("resize", () => {
      if (window.innerWidth > 720 && menu.classList.contains("is-open")) setOpen(false);
    });
  }


  /* ---------- Custom cursor ---------- */
  function initCursor() {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const cur = $(".cursor");
    if (!cur) return;
    const dot = $(".cursor__dot");
    const ring = $(".cursor__ring");
    const label = $(".cursor__label");
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;

    window.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
      gsap.to(dot, { x: mx, y: my, duration: 0.12, ease: "power2.out" });
    });
    gsap.ticker.add(() => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = "translate(" + rx + "px," + ry + "px) translate(-50%,-50%)";
    });

    const bind = () => {
      $$("[data-cursor], .anthem, .track, .tribute__cta, .modal__close").forEach((el) => {
        el.addEventListener("mouseenter", () => {
          cur.classList.add("is-hover");
          if (label && el.dataset.cursor) label.textContent = el.dataset.cursor;
          else if (label) label.textContent = "Play";
        });
        el.addEventListener("mouseleave", () => cur.classList.remove("is-hover"));
      });
    };
    bind();
    window.__rebindCursor = bind;
  }

  /* expose for sections below */
  window.__CS = { $, $$, D, compact, group, animateNumber, scrollTo, prefersReduced };

  /* =====================================================================
     THE FILM - a scroll-scrubbed, deterministic canvas "video".
     Cinematic sequence rendered frame-by-frame as a pure function of a
     normalized scroll progress `p` in [0,1]. Scroll forward plays it,
     scroll backward reverses it - the Coke Studio Bharat scroll-video feel.
     ===================================================================== */
  function initFilm() {
    const canvas = $("#filmCanvas");
    const film = $("#film");
    if (!canvas || !film) return;
    const ctx = canvas.getContext("2d");
    const chapters = $$(".film__chapter");
    const keyart = $("#filmKeyart");
    const overlay = $(".film__overlay");
    const scrollHint = $(".film__scroll");
    let W = 0, H = 0, dpr = 1, active = -1;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    // deterministic pseudo-random so the film is stable across renders
    const rnd = (seed) => {
      const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
      return x - Math.floor(x);
    };
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const lerp = (a, b, t) => a + (b - a) * t;
    const seg = (p, s, e) => clamp((p - s) / (e - s), 0, 1);
    const ease = (t) => t * t * (3 - 2 * t);
    const mix = (c1, c2, t) => {
      const p = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
      const a = p(c1), b = p(c2);
      return "rgb(" + a.map((v, i) => Math.round(lerp(v, b[i], t))).join(",") + ")";
    };
    function roundRect(c, x, y, w, h, r) {
      c.beginPath();
      c.moveTo(x + r, y);
      c.arcTo(x + w, y, x + w, y + h, r);
      c.arcTo(x + w, y + h, x, y + h, r);
      c.arcTo(x, y + h, x, y, r);
      c.arcTo(x, y, x + w, y, r);
      c.closePath();
    }

    function drawBackground(p) {
      const warm = seg(p, 0.55, 1);
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#0b0a10");
      g.addColorStop(1, mix("#0e0d12", "#170a0d", warm));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }

    // ACT 1 - the lone studio spotlight + microphone
    function actStudio(p) {
      const t = ease(seg(p, 0.0, 0.22));
      const cx = W / 2, cy = H / 2;
      const radius = lerp(0, Math.max(W, H) * 0.5, t);
      const cone = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius || 1);
      cone.addColorStop(0, "rgba(255,244,225," + 0.16 * t + ")");
      cone.addColorStop(0.4, "rgba(232,33,42," + 0.06 * t + ")");
      cone.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = cone;
      ctx.beginPath();
      ctx.arc(cx, cy, radius || 1, 0, Math.PI * 2);
      ctx.fill();

      const micA = 0.5 + 0.5 * Math.sin(t * Math.PI);
      if (t > 0.2) {
        const s = Math.min(W, H) * 0.16 * (0.7 + 0.3 * t);
        ctx.save();
        ctx.translate(cx, cy);
        ctx.globalAlpha = micA * 0.9;
        ctx.fillStyle = "#1c1b22";
        roundRect(ctx, -s * 0.16, -s * 0.55, s * 0.32, s * 0.95, s * 0.16);
        ctx.fill();
        ctx.strokeStyle = "rgba(244,239,230," + 0.5 * t + ")";
        ctx.lineWidth = 1.4;
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.moveTo(-s * 0.16, -s * 0.42 + i * s * 0.09);
          ctx.lineTo(s * 0.16, -s * 0.42 + i * s * 0.09);
          ctx.stroke();
        }
        ctx.strokeStyle = "rgba(200,162,74," + 0.6 * t + ")";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, s * 0.4);
        ctx.lineTo(0, s * 0.85);
        ctx.moveTo(-s * 0.34, s * 0.85);
        ctx.lineTo(s * 0.34, s * 0.85);
        ctx.stroke();
        ctx.restore();
      }
    }

    // ACT 2 - the circle of musicians orbiting the light
    function actCircle(p) {
      const t = ease(seg(p, 0.2, 0.5));
      if (t <= 0) return;
      const cx = W / 2, cy = H / 2;
      const R = Math.min(W, H) * 0.32;
      const n = 12;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < n; i++) {
        const seed = rnd(i);
        const ang = (i / n) * Math.PI * 2 + t * Math.PI * 1.2;
        const rr = R * (0.85 + seed * 0.4);
        const x = cx + Math.cos(ang) * rr;
        const y = cy + Math.sin(ang) * rr * 0.62;
        const glow = 0.25 + 0.5 * Math.abs(Math.sin(ang * 2 + i));
        ctx.beginPath();
        ctx.arc(x, y, 2 + seed * 3, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(232,33,42," + glow * t + ")";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, 12 + seed * 18, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(200,162,74," + 0.05 * t + ")";
        ctx.fill();
      }
      ctx.beginPath();
      ctx.ellipse(cx, cy, R, R * 0.62, 0, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(244,239,230," + 0.12 * t + ")";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }

    // ACT 3 - soundwaves rippling out (the music)
    function actWaves(p) {
      const t = ease(seg(p, 0.48, 0.78));
      if (t <= 0) return;
      const cx = W / 2, cy = H / 2;
      const maxR = Math.max(W, H) * 0.7;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const rings = 16;
      for (let i = 0; i < rings; i++) {
        const base = (i / rings) * maxR;
        const wave = Math.sin(base * 0.03 - t * 6) * 14 * t;
        const r = base + wave;
        const a = (1 - i / rings) * 0.28 * t;
        ctx.beginPath();
        ctx.ellipse(cx, cy, r, r * 0.6, 0, 0, Math.PI * 2);
        ctx.strokeStyle = i % 3 === 0 ? "rgba(232,33,42," + a + ")" : "rgba(200,162,74," + a * 0.8 + ")";
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
      ctx.restore();
    }

    // ACT 4/5 - converge into the Coke mark + particle bloom
    function actMark(p) {
      const t = ease(seg(p, 0.72, 1));
      if (t <= 0) return;
      const cx = W / 2, cy = H / 2;
      const R = Math.min(W, H) * 0.2 * (0.6 + 0.4 * t);
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const n = 90;
      for (let i = 0; i < n; i++) {
        const seed = rnd(i + 3);
        const ang = seed * Math.PI * 2;
        const dist = (0.4 + seed * 1.6) * R * (2.4 - t * 1.4);
        const x = cx + Math.cos(ang + t) * dist;
        const y = cy + Math.sin(ang + t) * dist * 0.7;
        ctx.beginPath();
        ctx.arc(x, y, 1.4 + seed * 1.6, 0, Math.PI * 2);
        ctx.fillStyle = seed > 0.5 ? "rgba(232,33,42," + 0.5 * t + ")" : "rgba(200,162,74," + 0.5 * t + ")";
        ctx.fill();
      }
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.6);
      grd.addColorStop(0, "rgba(232,33,42," + 0.5 * t + ")");
      grd.addColorStop(1, "rgba(232,33,42,0)");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(244,239,230," + 0.35 * t + ")";
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.restore();
    }

    let lastP = 0;
    function render(p) {
      lastP = p;
      drawBackground(p);
      actStudio(p);
      actCircle(p);
      actWaves(p);
      actMark(p);

      // finale: the procedural film resolves into the painted key art,
      // while the typographic overlay + scroll hint clear the frame for it
      const artT = ease(seg(p, 0.86, 0.98));
      if (keyart) {
        keyart.style.opacity = artT;
        keyart.style.transform = "scale(" + (1.08 - 0.08 * artT) + ")";
      }
      const fade = 1 - seg(p, 0.84, 0.92);
      if (overlay) overlay.style.opacity = fade;
      if (scrollHint) scrollHint.style.opacity = fade;

      // chapter cross-fade based on scroll progress
      const idx = p < 0.24 ? 0 : p < 0.5 ? 1 : p < 0.76 ? 2 : 3;
      if (idx !== active) {
        chapters.forEach((c, i) => {
          const on = i === idx;
          c.classList.toggle("is-active", on);
          if (on && !prefersReduced) {
            gsap.fromTo(c, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" });
          }
        });
        active = idx;
      }
    }

    window.addEventListener("resize", () => {
      resize();
      render(lastP);
    });

    if (prefersReduced) {
      render(0);
      return;
    }

    // Pin the film and drive it purely by scroll progress (scrub)
    gsap.to({ p: 0 }, {
      p: 1,
      ease: "none",
      scrollTrigger: {
        trigger: film,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        onUpdate: (self) => render(self.progress),
      },
    });
    render(0);
  }


  /* =====================================================================
     STATS - animated count-up on enter
     ===================================================================== */
  function initStats() {
    const grid = $("#statsGrid");
    if (!grid || !D.stats) return;
    grid.innerHTML = D.stats
      .map(
        (s) => `
      <div class="stat">
        <div class="stat__value" data-value="${s.value}" data-format="${s.format}" data-suffix="${s.suffix || ""}">0</div>
        <div class="stat__label">${s.label}</div>
        <div class="stat__note">${s.note || ""}</div>
      </div>`
      )
      .join("");

    $$(".stat__value", grid).forEach((el) => {
      const target = parseFloat(el.dataset.value);
      const fmt = el.dataset.format;
      const suffix = el.dataset.suffix;
      if (prefersReduced) {
        const c = compact(target);
        el.innerHTML = group(c.num) + (c.suffix ? '<span class="suffix">' + c.suffix + "</span>" : "");
        return;
      }
      ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        once: true,
        onEnter() {
          animateNumber(el, target, { format: fmt, suffix, duration: 2.2 });
        },
      });
    });
  }

  /* =====================================================================
     ANTHEMS - Hall of Fame with real YouTube playback
     ===================================================================== */
  function initAnthems() {
    const list = $("#anthemsList");
    if (!list || !D.anthems) return;
    list.innerHTML = D.anthems
      .map(
        (a) => `
      <article class="anthem" style="--accent:${a.accent};--accent-glow:${a.accent}"
               data-video="${a.videoId}" data-cursor="Play"
               tabindex="0" role="button" aria-label="Play ${a.title}">
        <div class="anthem__rank">${a.rank}</div>
        <div class="anthem__thumb">
          <img src="https://img.youtube.com/vi/${a.videoId}/maxresdefault.jpg"
               alt="${a.title} performance still from Coke Studio Pakistan"
               loading="lazy" decoding="async" />
          <div class="anthem__thumbplay" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
        <div>
          <h3 class="anthem__title"><em>${a.title}</em></h3>
          <p class="anthem__artists">${a.artists}</p>
        </div>
        <div>
          <div class="anthem__meta">
            <div class="anthem__views" data-views="${a.views}">0</div>
            <div class="anthem__viewslabel">YouTube views</div>
            <div class="anthem__tags">
              <span class="tag">${a.season}</span>
              <span class="tag">${a.genre}</span>
              <span class="tag">${a.duration}</span>
            </div>
          </div>
        </div>
        <button class="anthem__play" aria-label="Play ${a.title}">
          <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        </button>
      </article>`
      )
      .join("");

    // view count-ups
    $$(".anthem__views", list).forEach((el) => {
      const target = parseFloat(el.dataset.views);
      if (prefersReduced) {
        const c = compact(target);
        el.innerHTML = group(c.num) + (c.suffix ? '<span class="suffix">' + c.suffix + "</span>" : "");
        return;
      }
      ScrollTrigger.create({
        trigger: el,
        start: "top 88%",
        once: true,
        onEnter() {
          const counter = { v: 0 };
          gsap.to(counter, {
            v: target,
            duration: 2.4,
            ease: "power2.out",
            onUpdate() {
              const c = compact(Math.floor(counter.v));
              el.innerHTML = group(c.num) + (c.suffix ? '<span class="suffix">' + c.suffix + "</span>" : "");
            },
          });
        },
      });
    });

    // reveal
    if (!prefersReduced) {
      gsap.utils.toArray(".anthem").forEach((row) => {
        gsap.from(row, {
          opacity: 0,
          y: 40,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: row, start: "top 85%" },
        });
      });
    }

    // open modal on click / enter
    $$(".anthem", list).forEach((row) => {
      const open = () => {
        const id = row.dataset.video;
        const song = D.anthems.find((a) => a.videoId === id);
        if (song) openModal(song);
      };
      row.addEventListener("click", open);
      row.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      });
    });

    if (window.__rebindCursor) window.__rebindCursor();
  }

  /* =====================================================================
     MARQUEE - infinite artist/song ticker
     ===================================================================== */
  function initMarquee() {
    const track = $("#marqueeTrack");
    if (!track || !D.anthems) return;
    const words = []
      .concat(D.anthems.map((a) => a.title))
      .concat(["Rahat", "Abida", "Atif", "Nusrat", "Ali Sethi", "Momina", "Sufi", "Qawwali", "Folk", "Since 2008"]);
    const item = (w) => `<span class="marquee__item">${w}<span class="dot">●</span></span>`;
    track.innerHTML = words.map(item).join("") + words.map(item).join("");

    if (prefersReduced) return;
    const tween = gsap.to(track, {
      xPercent: -50,
      duration: 34,
      ease: "none",
      repeat: -1,
    });
    ScrollTrigger.create({
      trigger: ".marquee",
      start: "top bottom",
      end: "bottom top",
      onUpdate(self) {
        gsap.to(tween, { timeScale: 1 + Math.min(self.getVelocity() / 2600, 2.4), overwrite: true, duration: 0.4 });
      },
    });
  }

  /* =====================================================================
     LEGACY - pinned horizontal timeline
     ===================================================================== */
  function initLegacy() {
    const track = $("#legacyTrack");
    const bar = $("#legacyBar");
    if (!track || !D.eras) return;
    track.innerHTML = D.eras
      .map(
        (e) => `
      <article class="era">
        <span class="era__mark">${e.mark}</span>
        <div class="era__years">${e.years}</div>
        <h3 class="era__producer">${e.producer}</h3>
        <div class="era__seasons">${e.seasons}</div>
        <p class="era__note">${e.note}</p>
      </article>`
      )
      .join("");

    if (prefersReduced) return;
    const getDist = () => Math.max(0, track.scrollWidth - window.innerWidth + 80);
    gsap.to(track, {
      x: () => -getDist(),
      ease: "none",
      scrollTrigger: {
        trigger: "#legacy",
        start: "top top",
        end: () => "+=" + (getDist() + window.innerHeight),
        pin: "#legacyPin",
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate(self) {
          if (bar) bar.style.width = self.progress * 100 + "%";
        },
      },
    });

    gsap.utils.toArray(".era").forEach((card, i) => {
      gsap.from(card, {
        opacity: 0,
        y: 60,
        duration: 0.8,
        ease: "power3.out",
        delay: i * 0.05,
        scrollTrigger: { trigger: "#legacy", start: "top 60%" },
      });
    });
  }

  /* =====================================================================
     CATALOG - grid linking to authentic YouTube recordings + Era Filters
     ===================================================================== */
  function initCatalog() {
    const grid = $("#catalogGrid");
    const filters = $("#catalogFilters");
    const search = $("#catalogSearch");
    if (!grid || !D.catalog) return;

    let activeEra = "all";
    const renderTracks = (era, query) => {
      activeEra = era;
      const normalizedQuery = (query || "").trim().toLowerCase();
      const items = D.catalog.filter((t) => {
        const matchesEra = era === "all" || t.era === era;
        const searchable = [t.title, t.artists, t.season, t.genre].join(" ").toLowerCase();
        return matchesEra && (!normalizedQuery || searchable.includes(normalizedQuery));
      });
      grid.innerHTML = items
        .map(
          (t) => `
        <a class="track" target="_blank" rel="noopener" data-era="${t.era || 'all'}"
           href="https://www.youtube.com/results?search_query=coke+studio+pakistan+${encodeURIComponent(
             t.title + " " + t.artists
           )}" data-cursor="Open">
          <div class="track__season">
            <span>${t.season}</span>
            <span>${t.genre || t.year}</span>
          </div>
          <svg class="track__go" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M7 17L17 7M9 7h8v8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <h3 class="track__title">${t.title}</h3>
          <p class="track__artists">${t.artists}</p>
        </a>`
        )
        .join("") || '<p class="catalog__empty">No performances match that search.</p>';

      if (!prefersReduced) {
        gsap.fromTo(
          ".track",
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.45, stagger: 0.03, ease: "power2.out" }
        );
      }
      if (window.__rebindCursor) window.__rebindCursor();
    };

    renderTracks("all");

    if (filters) {
      $$(".catalog__filter", filters).forEach((btn) => {
        btn.addEventListener("click", () => {
          $$(".catalog__filter", filters).forEach((b) => {
            b.classList.remove("is-active");
            b.setAttribute("aria-selected", "false");
          });
          btn.classList.add("is-active");
          btn.setAttribute("aria-selected", "true");
          renderTracks(btn.dataset.filter, search && search.value);
        });
      });
    }

    if (search) {
      search.addEventListener("input", () => renderTracks(activeEra, search.value));
    }

    if (!prefersReduced) {
      gsap.from(".poster", {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".poster", start: "top 82%" },
      });
      gsap.from(".poster__caption > *", {
        opacity: 0,
        y: 26,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".poster", start: "top 72%" },
      });
      gsap.from(".track", {
        opacity: 0,
        y: 30,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.05,
        scrollTrigger: { trigger: grid, start: "top 80%" },
      });
    }
    if (window.__rebindCursor) window.__rebindCursor();
  }

  /* =====================================================================
     TRIBUTE footer text + section reveals
     ===================================================================== */
  function initTribute() {
    if (D.brand) {
      const disc = $("#disclaimer");
      if (disc) disc.textContent = D.brand.disclaimer;
      const yr = $("#yearNow");
      if (yr) yr.textContent = new Date().getFullYear();
    }
    if (prefersReduced) return;
    gsap.from(".tribute__quote", {
      opacity: 0,
      y: 40,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: { trigger: ".tribute__quote", start: "top 82%" },
    });
    gsap.from(".tribute__seal", {
      opacity: 0,
      scale: 0.8,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: { trigger: ".tribute__seal", start: "top 90%" },
    });
    gsap.from(".tribute__coke", {
      opacity: 0,
      scale: 0.9,
      duration: 1.2,
      ease: "power3.out",
      scrollTrigger: { trigger: ".tribute__coke", start: "top 85%" },
    });
    gsap.utils.toArray(".section-title").forEach((t) => {
      gsap.from(t, {
        opacity: 0,
        y: 36,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: t, start: "top 85%" },
      });
    });
  }

  /* =====================================================================
     MODAL - YouTube player (loading state, error fallback, focus trap)
     ===================================================================== */
  let lastFocus = null;
  function openModal(song) {
    const modal = $("#modal");
    const player = $("#modalPlayer");
    const state = $("#modalState");
    if (!modal || !player) return;
    lastFocus = document.activeElement;

    $("#modalTitle").textContent = song.title;
    $("#modalArtists").textContent = song.artists + " · " + song.season;
    $("#modalTags").innerHTML = `<span class="tag">${song.genre}</span><span class="tag">${song.duration}</span>`;

    // reset to the loading state, wire the fallback link to the real video
    const fallback = $("#modalFallback");
    if (fallback) {
      fallback.href = "https://www.youtube.com/watch?v=" + song.videoId;
      fallback.hidden = true;
    }
    showState("loading");
    const previewImg = document.createElement("img");
    previewImg.className = "modal__preview";
    previewImg.src = "https://img.youtube.com/vi/" + song.videoId + "/maxresdefault.jpg";
    previewImg.alt = song.title + " preview";
    const stateEl = $("#modalState");
    if (stateEl && !$(".modal__preview", player)) stateEl.insertAdjacentElement("afterend", previewImg);

    const frame = document.createElement("iframe");
    frame.src = "https://www.youtube.com/embed/" + song.videoId + "?autoplay=1&rel=0&modestbranding=1";
    frame.title = song.title + ", Coke Studio Pakistan";
    frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    frame.allowFullscreen = true;
    // hide the loading state once the player has loaded
    frame.addEventListener("load", () => {
      if (modal.classList.contains("is-open")) {
        showState("ready");
        // Return keyboard control to the dialog. An autoplaying cross-origin
        // embed can leave focus on <body> or inside the iframe, where our
        // Escape/Tab trap cannot see keystrokes (finding 16). Re-assert focus
        // on the close button so steady-state focus is always in-dialog.
        const cb = $(".modal__close", modal);
        if (cb) cb.focus();
      }
    });
    player.appendChild(frame);

    // Inserting a navigating cross-origin iframe transiently blurs focus to
    // <body> (no focusin fires for that), which can leave the dialog briefly
    // keyboard-less. Re-assert focus on the next frame; the iframe `load`
    // handler above makes it permanent once the player is ready.
    requestAnimationFrame(() => {
      if (modal.classList.contains("is-open")) {
        const cb = $(".modal__close", modal);
        if (cb) cb.focus();
      }
    });

    // safety net: if the embed never loads (blocked / offline), offer the fallback
    clearTimeout(openModal._t);
    openModal._t = setTimeout(() => {
      if (modal.classList.contains("is-open")) showState("error");
    }, 7000);

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.documentElement.style.overflow = "hidden";
    if (lenis) lenis.stop();

    // move focus into the dialog so Escape reaches our handler, not the iframe
    const closeBtn = $(".modal__close", modal);
    if (closeBtn) closeBtn.focus();
  }

  function showState(kind) {
    const state = $("#modalState");
    const text = $("#modalStateText");
    const fallback = $("#modalFallback");
    const spin = $(".modal__spinner");
    if (!state) return;
    state.classList.remove("is-loading", "is-error");
    if (kind === "ready") {
      state.style.display = "none";
      return;
    }
    state.style.display = "";
    if (kind === "loading") {
      state.classList.add("is-loading");
      if (text) text.textContent = "Loading the studio take…";
      if (spin) spin.style.display = "";
      if (fallback) fallback.hidden = true;
    } else if (kind === "error") {
      state.classList.add("is-error");
      if (text) text.textContent = "";
      if (spin) spin.style.display = "none";
      if (fallback) fallback.hidden = false;
    }
  }

  function closeModal() {
    const modal = $("#modal");
    const player = $("#modalPlayer");
    if (!modal) return;
    clearTimeout(openModal._t);
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    if (player) {
      const pv = $(".modal__preview", player);
      if (pv) pv.remove();
      const oldIframe = $("iframe", player);
      if (oldIframe) oldIframe.remove();
    }
    document.documentElement.style.overflow = "";
    if (lenis) lenis.start();
    // restore focus to the element that opened the modal
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  function initModal() {
    const modal = $("#modal");
    if (!modal) return;
    $$("[data-close]", modal).forEach((b) => b.addEventListener("click", closeModal));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
      // keep Tab focus inside the dialog while it is open
      if (e.key === "Tab" && modal.classList.contains("is-open")) {
        const focusables = $$("button, a[href], iframe, [tabindex]:not([tabindex='-1'])", modal).filter(
          (el) => !el.hasAttribute("hidden")
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    // Reclaim focus into the dialog whenever it escapes. The autoplaying
    // YouTube embed can hand focus back to <body>; without this the dialog
    // loses keyboard control and Escape stops working (finding 16).
    document.addEventListener("focusin", (e) => {
      if (!modal.classList.contains("is-open")) return;
      // focus legitimately inside the dialog (buttons, links, or the iframe) is fine
      if (modal.contains(e.target)) return;
      const cb = $(".modal__close", modal);
      if (cb) cb.focus();
    });
  }



  /* ---------- Boot ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("is-loading");

    // Build content first so ScrollTrigger measures real DOM
    initStats();
    initAnthems();
    initMarquee();
    initLegacy();
    initCatalog();
    initTribute();

    // Cinema break sections: parallax + text reveal
    (function initCinemaBreaks() {
      if (prefersReduced) return;
      $$(".cinema-break").forEach((section) => {
        const img = $(".cinema-break__img", section);
        if (img) {
          gsap.fromTo(img, { y: -30 }, {
            y: 30,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          });
        }
        ScrollTrigger.create({
          trigger: section,
          start: "top 70%",
          once: true,
          onEnter() { section.classList.add("is-visible"); },
        });
      });
    })();
    initModal();

    initLenis();
    initNav();
    initMenu();
    initCursor();
    initFilm();

    initLoader(() => {
      ScrollTrigger.refresh();
    });

    // Recalculate once everything (fonts/layout) has settled
    window.addEventListener("load", () => ScrollTrigger.refresh());

    /* ==================================================================
       ADVANCED MICRO-INTERACTIONS (Awwwards-tier)
       ================================================================== */

    /* --- 1. TEXT SPLIT: staggered character reveals on section titles (HTML-safe) --- */
    (function initTextSplit() {
      if (prefersReduced) return;
      $$(".section-title, .tribute__quote").forEach((el) => {
        // Parse child nodes to split text without mangling <em> or <br> tags
        const fragment = document.createDocumentFragment();
        Array.from(el.childNodes).forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            const words = node.textContent.split(/(\s+)/);
            words.forEach((w) => {
              if (/^\s+$/.test(w)) {
                fragment.appendChild(document.createTextNode(w));
              } else if (w.length > 0) {
                const wordSpan = document.createElement("span");
                wordSpan.className = "word";
                wordSpan.style.display = "inline-block";
                wordSpan.style.whiteSpace = "nowrap";
                w.split("").forEach((c) => {
                  const charSpan = document.createElement("span");
                  charSpan.className = "char";
                  charSpan.textContent = c;
                  charSpan.style.cssText = "display:inline-block;opacity:0;transform:translateY(36px) rotate(3deg);";
                  wordSpan.appendChild(charSpan);
                });
                fragment.appendChild(wordSpan);
              }
            });
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.tagName.toLowerCase() === "br") {
              fragment.appendChild(document.createElement("br"));
            } else {
              // Keep elements like <em> and split inside them
              const clone = node.cloneNode(false);
              const words = node.textContent.split(/(\s+)/);
              words.forEach((w) => {
                if (/^\s+$/.test(w)) {
                  clone.appendChild(document.createTextNode(w));
                } else if (w.length > 0) {
                  const wordSpan = document.createElement("span");
                  wordSpan.className = "word";
                  wordSpan.style.display = "inline-block";
                  wordSpan.style.whiteSpace = "nowrap";
                  w.split("").forEach((c) => {
                    const charSpan = document.createElement("span");
                    charSpan.className = "char";
                    charSpan.textContent = c;
                    charSpan.style.cssText = "display:inline-block;opacity:0;transform:translateY(36px) rotate(3deg);";
                    wordSpan.appendChild(charSpan);
                  });
                  clone.appendChild(wordSpan);
                }
              });
              fragment.appendChild(clone);
            }
          }
        });
        el.innerHTML = "";
        el.appendChild(fragment);

        ScrollTrigger.create({
          trigger: el,
          start: "top 85%",
          once: true,
          onEnter() {
            gsap.to($$(".char", el), {
              opacity: 1,
              y: 0,
              rotation: 0,
              duration: 0.6,
              ease: "power3.out",
              stagger: 0.016,
            });
          },
        });
      });
    })();

    /* --- 2. 3D PERSPECTIVE TILT on anthem cards --- */
    (function initTilt() {
      if (window.matchMedia("(pointer: coarse)").matches) return;
      $$(".anthem").forEach((card) => {
        card.style.transformStyle = "preserve-3d";
        card.addEventListener("mousemove", (e) => {
          const r = card.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5;
          const y = (e.clientY - r.top) / r.height - 0.5;
          gsap.to(card, {
            rotateY: x * 5, rotateX: -y * 3, scale: 1.012,
            duration: 0.4, ease: "power2.out",
            transformPerspective: 800,
          });
        });
        card.addEventListener("mouseleave", () => {
          gsap.to(card, { rotateY: 0, rotateX: 0, scale: 1, duration: 0.7, ease: "power3.out" });
        });
      });
    })();

    /* --- 3. MAGNETIC BUTTONS --- */
    (function initMagnetic() {
      if (window.matchMedia("(pointer: coarse)").matches) return;
      $$(".tribute__cta, .anthem__play, .modal__close").forEach((btn) => {
        btn.addEventListener("mousemove", (e) => {
          const r = btn.getBoundingClientRect();
          const dx = (e.clientX - r.left - r.width / 2) * 0.3;
          const dy = (e.clientY - r.top - r.height / 2) * 0.3;
          gsap.to(btn, { x: dx, y: dy, duration: 0.4, ease: "power3.out" });
        });
        btn.addEventListener("mouseleave", () => {
          gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
        });
      });
    })();

    /* --- 4. CLIP-PATH REVEALS on cinema breaks --- */
    (function initClipReveals() {
      if (prefersReduced) return;
      $$(".cinema-break__img").forEach((img) => {
        img.style.clipPath = "inset(8% 16% 8% 16%)";
        ScrollTrigger.create({
          trigger: img.parentElement,
          start: "top 80%",
          end: "top 20%",
          scrub: 1,
          onUpdate(self) {
            const p = self.progress;
            const v = 8 * (1 - p), h = 16 * (1 - p);
            img.style.clipPath = "inset(" + v + "% " + h + "% " + v + "% " + h + "%)";
          },
        });
      });
    })();

    /* --- 5. POSTER IMAGE PARALLAX on mousemove --- */
    (function initPosterParallax() {
      if (window.matchMedia("(pointer: coarse)").matches) return;
      const frame = $(".poster__frame");
      const img = $(".poster__img");
      if (!frame || !img) return;
      frame.addEventListener("mousemove", (e) => {
        const r = frame.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(img, { x: x * 16, y: y * 16, rotation: x * 1.5, duration: 0.8, ease: "power2.out" });
      });
      frame.addEventListener("mouseleave", () => {
        gsap.to(img, { x: 0, y: 0, rotation: 0, duration: 1.2, ease: "elastic.out(1, 0.5)" });
      });
    })();

    /* --- 6. SCROLL VELOCITY ATMOSPHERE (grain intensifies on fast scroll) --- */
    (function initScrollAtmosphere() {
      if (prefersReduced) return;
      let lastV = 0;
      ScrollTrigger.create({
        trigger: "body", start: "top top", end: "bottom bottom",
        onUpdate(self) {
          const v = Math.min(Math.abs(self.getVelocity()) / 3000, 1);
          if (Math.abs(v - lastV) > 0.02) {
            lastV = v;
            const g = document.querySelector(".grain");
            if (g) g.style.opacity = 0.05 + v * 0.06;
          }
        },
      });
    })();

    /* --- 7. ERA CARD STAGGER with scale pop --- */
    (function initEraEntrance() {
      if (prefersReduced) return;
      gsap.utils.toArray(".era").forEach((card, i) => {
        gsap.set(card, { scale: 0.92, opacity: 0 });
        ScrollTrigger.create({
          trigger: "#legacy", start: "top 50%", once: true,
          onEnter() {
            gsap.to(card, { scale: 1, opacity: 1, duration: 0.9, delay: i * 0.1, ease: "power3.out" });
          },
        });
      });
    })();

    /* --- 8. CATALOG HOVER IMAGE TILT --- */
    (function initCatalogTilt() {
      if (window.matchMedia("(pointer: coarse)").matches) return;
      $$(".track").forEach((card) => {
        card.addEventListener("mousemove", (e) => {
          const r = card.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5;
          const y = (e.clientY - r.top) / r.height - 0.5;
          gsap.to(card, { rotateY: x * 8, rotateX: -y * 6, duration: 0.3, ease: "power2.out", transformPerspective: 600 });
        });
        card.addEventListener("mouseleave", () => {
          gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.6, ease: "power3.out" });
        });
      });
    })();

    /* --- 9. SMOOTH ANTHEM THUMB REVEAL on scroll --- */
    (function initThumbReveal() {
      if (prefersReduced) return;
      $$(".anthem__thumb").forEach((thumb, i) => {
        gsap.set(thumb, { clipPath: "inset(0 100% 0 0)", opacity: 0 });
        ScrollTrigger.create({
          trigger: thumb, start: "top 88%", once: true,
          onEnter() {
            gsap.to(thumb, {
              clipPath: "inset(0 0% 0 0)", opacity: 1,
              duration: 1, delay: i * 0.12, ease: "power3.inOut",
            });
          },
        });
      });
    })();

    /* --- 10. GALLERY ITEM STAGGER REVEAL on scroll --- */
    (function initGalleryReveal() {
      if (prefersReduced) return;
      gsap.utils.toArray(".gallery__item").forEach((item, i) => {
        gsap.from(item, {
          opacity: 0,
          y: 45,
          scale: 0.96,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: item,
            start: "top 85%",
          },
        });
      });
    })();

    /* ==================================================================
       11. WEB AUDIO AMBIENT SOUNDSCAPE SYNTH (Generative Sufi Drone)
       ================================================================== */
    (function initSoundscape() {
      const toggle = $("#soundscapeToggle");
      const stateLabel = $("#soundscapeState");
      if (!toggle || !stateLabel) return;

      let audioCtx = null;
      let masterGain = null;
      let oscillators = [];
      let isPlaying = false;

      function startAudio() {
        if (!audioCtx) {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          audioCtx = new AudioContext();
        }
        if (audioCtx.state === "suspended") {
          audioCtx.resume();
        }

        masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
        // Gentle ramp up to avoid sudden loud bursts
        masterGain.gain.exponentialRampToValueAtTime(0.14, audioCtx.currentTime + 3);
        masterGain.connect(audioCtx.destination);

        // Tanpura / Sufi drone harmonic chord: D2 (73.42Hz), A2 (110Hz), D3 (146.83Hz), F#3 (185Hz)
        const notes = [73.42, 110.0, 146.83, 185.0];
        oscillators = notes.map((freq, idx) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = idx === 0 ? "triangle" : "sine";
          osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

          // Subtle LFO modulation for breathing drone feel
          const lfo = audioCtx.createOscillator();
          const lfoGain = audioCtx.createGain();
          lfo.frequency.setValueAtTime(0.15 + idx * 0.05, audioCtx.currentTime);
          lfoGain.gain.setValueAtTime(2.5, audioCtx.currentTime);
          lfo.connect(osc.frequency);
          lfo.start();

          gain.gain.setValueAtTime(idx === 0 ? 0.35 : 0.18, audioCtx.currentTime);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start();
          return { osc, lfo };
        });

        isPlaying = true;
        toggle.classList.add("is-playing");
        toggle.setAttribute("aria-pressed", "true");
        stateLabel.textContent = "Harmonic Drone (Live)";
      }

      function stopAudio() {
        if (!audioCtx || !isPlaying) return;
        masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime);
        masterGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);
        setTimeout(() => {
          oscillators.forEach((item) => {
            item.osc.stop();
            item.lfo.stop();
          });
          oscillators = [];
          isPlaying = false;
          toggle.classList.remove("is-playing");
          toggle.setAttribute("aria-pressed", "false");
          stateLabel.textContent = "Muted (Offline)";
        }, 1250);
      }

      toggle.addEventListener("click", () => {
        if (!isPlaying) startAudio();
        else stopAudio();
      });

      // Expose globally for keyboard shortcut [M]
      window.__toggleSoundscape = () => {
        if (!isPlaying) startAudio();
        else stopAudio();
      };
    })();

    /* ==================================================================
       12. INTERACTIVE GALLERY LIGHTBOX MODAL
       ================================================================== */
    (function initLightbox() {
      const modal = $("#lightboxModal");
      const img = $("#lightboxImg");
      const title = $("#lightboxTitle");
      const desc = $("#lightboxDesc");
      const tag = $("#lightboxTag");
      if (!modal || !img || !title || !desc) return;

      let lastActiveEl = null;

      function openLightbox(item) {
        lastActiveEl = document.activeElement;
        const mediaImg = $(".gallery__media img", item);
        const itemTitle = $(".gallery__title", item);
        const itemDesc = $(".gallery__desc", item);
        const itemTag = $(".gallery__tag", item);

        if (mediaImg) {
          img.src = mediaImg.src;
          img.alt = mediaImg.alt;
        }
        if (itemTitle) title.textContent = itemTitle.textContent;
        if (itemDesc) desc.textContent = itemDesc.textContent;
        if (itemTag && tag) tag.textContent = itemTag.textContent;

        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.documentElement.style.overflow = "hidden";
        if (lenis) lenis.stop();

        const closeBtn = $(".lightbox__close", modal);
        if (closeBtn) closeBtn.focus();
      }

      function closeLightbox() {
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        document.documentElement.style.overflow = "";
        if (lenis) lenis.start();
        if (lastActiveEl) lastActiveEl.focus();
      }

      $$(".gallery__item").forEach((item) => {
        item.style.cursor = "pointer";
        item.setAttribute("tabindex", "0");
        item.setAttribute("role", "button");
        item.setAttribute("aria-label", "Inspect artwork");
        item.addEventListener("click", () => openLightbox(item));
        item.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openLightbox(item);
          }
        });
      });

      $$("[data-lightbox-close]", modal).forEach((btn) => btn.addEventListener("click", closeLightbox));
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("is-open")) {
          closeLightbox();
        }
        if (e.key === "Tab" && modal.classList.contains("is-open")) {
          const focusables = $$('button, [tabindex]:not([tabindex="-1"])', modal).filter(
            (el) => !el.hasAttribute("hidden")
          );
          if (!focusables.length) return;
          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          if (!modal.contains(document.activeElement)) {
            e.preventDefault();
            first.focus();
          } else if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      });
      document.addEventListener("focusin", (e) => {
        if (!modal.classList.contains("is-open") || modal.contains(e.target)) return;
        const closeBtn = $(".lightbox__close", modal);
        if (closeBtn) closeBtn.focus();
      });
    })();

    /* ==================================================================
       13. STUDIO KEYBOARD SHORTCUTS & HELP DIALOG
       ================================================================== */
    (function initShortcuts() {
      const modal = $("#hotkeysModal");
      if (!modal) return;

      const toggleHotkeys = () => {
        const isOpen = modal.classList.contains("is-open");
        modal.classList.toggle("is-open", !isOpen);
        modal.setAttribute("aria-hidden", isOpen ? "true" : "false");
      };

      $$("[data-hotkeys-close]", modal).forEach((b) => b.addEventListener("click", toggleHotkeys));

      document.addEventListener("keydown", (e) => {
        // Do not intercept if typing in inputs or forms
        if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) return;

        if (e.key === "?" || (e.shiftKey && e.key === "/")) {
          e.preventDefault();
          toggleHotkeys();
        } else if (e.key.toLowerCase() === "m") {
          e.preventDefault();
          if (window.__toggleSoundscape) window.__toggleSoundscape();
        } else if (e.key.toLowerCase() === "g") {
          e.preventDefault();
          scrollTo("#gallery");
        } else if (e.key.toLowerCase() === "a") {
          e.preventDefault();
          scrollTo("#anthems");
        } else if (e.key === " " && !$("#modal").classList.contains("is-open") && !$("#lightboxModal").classList.contains("is-open")) {
          // Play first Hall of Fame anthem on Spacebar
          const firstAnthem = $(".anthem");
          if (firstAnthem) {
            e.preventDefault();
            firstAnthem.click();
          }
        } else if (e.key === "Escape" && modal.classList.contains("is-open")) {
          toggleHotkeys();
        }
      });
    })();

    /* ==================================================================
       14. COSMIC GOLDEN ACOUSTIC DUST CANVAS ENGINE
       ================================================================== */
    (function initCosmicDust() {
      if (prefersReduced) return;
      const canvas = $("#cosmicDust");
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      let w = 0, h = 0;
      const numParticles = 65;
      const particles = [];

      function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
      }
      resize();
      window.addEventListener("resize", resize, { passive: true });

      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * (w || 1000),
          y: Math.random() * (h || 1000),
          radius: Math.random() * 1.8 + 0.6,
          speedX: (Math.random() - 0.5) * 0.35,
          speedY: -Math.random() * 0.45 - 0.1,
          opacity: Math.random() * 0.6 + 0.2,
          hue: Math.random() > 0.4 ? "rgba(200, 162, 74," : "rgba(232, 33, 42,",
          pulse: Math.random() * Math.PI,
        });
      }

      let mouseX = w / 2, mouseY = h / 2;
      window.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
      }, { passive: true });

      function render() {
        ctx.clearRect(0, 0, w, h);
        for (let i = 0; i < numParticles; i++) {
          const p = particles[i];
          p.x += p.speedX;
          p.y += p.speedY;
          p.pulse += 0.025;

          // Gentle mouse gravity repulsion
          const dx = mouseX - p.x;
          const dy = mouseY - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            p.x -= (dx / dist) * 1.2;
            p.y -= (dy / dist) * 1.2;
          }

          // Loop bounds
          if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
          if (p.x < -10) p.x = w + 10;
          if (p.x > w + 10) p.x = -10;

          const currentOpacity = p.opacity * (0.6 + 0.4 * Math.sin(p.pulse));
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.hue + currentOpacity + ")";
          ctx.shadowBlur = 10;
          ctx.shadowColor = p.hue + "0.6)";
          ctx.fill();
        }
        requestAnimationFrame(render);
      }
      render();
    })();

    /* ==================================================================
       15. REALTIME SPOTLIGHT AURA TRACKER ON ANTHEM & GALLERY CARDS
       ================================================================== */
    (function initSpotlightTracker() {
      if (window.matchMedia("(pointer: coarse)").matches) return;
      $$(".anthem, .gallery__item").forEach((card) => {
        card.addEventListener("mousemove", (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          card.style.setProperty("--mouse-x", `${x}px`);
          card.style.setProperty("--mouse-y", `${y}px`);
        });
      });
    })();

  });
})();

