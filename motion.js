/* =====================================================================
   Lumos motion  (motion.js)  -  GSAP + ScrollTrigger
   Load AFTER script.js and contribute.js. Everything here is optional polish:
   if GSAP fails to load, or the visitor prefers reduced motion, or they switch
   "Motion" off in the footer, the site simply works exactly as before.

   What it does
   - Page entrance: headings and cards fade/slide in (staggered); cards further down reveal as you scroll.
   - Hero blobs drift slightly as you scroll (restrained parallax). Normal scrolling is never hijacked.
   - Windows (resource preview, login, search), the mobile menu and toasts ease in.
   - A soft ambient colour background on every page (pure CSS shapes moved by GSAP) that gently
     changes tint for each department; plus a 3D background (Three.js) on Home / Contribute only.
   - A thin loading bar at the top that follows REAL network work: it starts when an operation starts
     and finishes when it ends or fails. Nothing here fakes success.
   Only transform and opacity are animated (no layout shift) and inline styles are removed afterwards.
   ===================================================================== */
(() => {
  "use strict";
  const KEY = "lumos-motion";
  const root = document.documentElement;
  const mq = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };
  // Keep native scrolling accessible while giving anchor/programmatic navigation a premium ease.
  if (!mq.matches) root.style.scrollBehavior = "smooth";
  const S = () => (typeof state !== "undefined" ? state : null);
  const userOn = () => { try { return localStorage.getItem(KEY) !== "off"; } catch (e) { return true; } };
  const libs = () => !!(window.gsap && window.ScrollTrigger);
  const canAnimate = () => libs() && userOn() && !mq.matches;
  if (libs()) { try { window.gsap.registerPlugin(window.ScrollTrigger); window.ScrollTrigger.config({ ignoreMobileResize: true }); } catch (e) { /* ignore */ } }

  /* ------------------------------------------------ loading bar (real work only) */
  const bar = document.createElement("div");
  bar.className = "mo-bar"; bar.setAttribute("aria-hidden", "true"); bar.innerHTML = "<i></i>";
  document.body.appendChild(bar);
  const fill = bar.firstChild;
  let busyN = 0, prog = 0, tick = 0, showT = 0, hideT = 0;
  const paint = () => { fill.style.transform = "scaleX(" + prog + ")"; };
  function busyStart() {
    let ended = false;
    clearTimeout(hideT);
    if (busyN++ === 0) {
      prog = 0.08; paint();
      showT = setTimeout(() => bar.classList.add("on"), 140);            // quick operations never flash a bar
      tick = setInterval(() => { prog += (0.92 - prog) * 0.07; paint(); }, 180);
    }
    return () => {                                                         // called when the operation really finishes OR fails
      if (ended) return; ended = true;
      if (--busyN > 0) return;
      busyN = 0; clearInterval(tick); clearTimeout(showT); prog = 1; paint();
      hideT = setTimeout(() => { bar.classList.remove("on"); prog = 0; paint(); }, 260);
    };
  }

  /* ------------------------------------------------ ambient colour background */
  const amb = document.createElement("div");
  amb.className = "mo-ambient"; amb.setAttribute("aria-hidden", "true");
  amb.innerHTML = '<i class="mo-orb o1"></i><i class="mo-orb o2"></i><i class="mo-orb o3"></i>';
  document.body.appendChild(amb);
  const DEFAULT_TINT = ["#FFC93C", "#3AACFF", "#F0523A"];
  let tintKey = "";
  function setTint(colors) {
    const key = colors.join();
    if (key === tintKey) return; tintKey = key;
    if (canAnimate()) window.gsap.to(amb, { "--a": colors[0], "--b": colors[1], "--c": colors[2], duration: 1.4, ease: "power2.inOut", overwrite: "auto" });
    else { amb.style.setProperty("--a", colors[0]); amb.style.setProperty("--b", colors[1]); amb.style.setProperty("--c", colors[2]); }
  }
  let drifts = [];
  function startAmbient() {
    stopAmbient();
    if (!canAnimate()) return;
    const g = window.gsap;
    amb.querySelectorAll(".mo-orb").forEach((o, i) => {
      drifts.push(g.to(o, { x: (i % 2 ? -1 : 1) * (50 + i * 22), y: (i === 1 ? -1 : 1) * (40 + i * 18), duration: 16 + i * 5, ease: "sine.inOut", repeat: -1, yoyo: true }));
    });
  }
  function stopAmbient() { drifts.forEach((t) => t.kill()); drifts = []; if (window.gsap) window.gsap.set(amb.querySelectorAll(".mo-orb"), { clearProps: "transform" }); }
  let qx, qy, px = 0, py = 0;
  function startParallax() {
    if (!canAnimate() || qx) return;
    const g = window.gsap; qx = g.quickTo(amb, "x", { duration: 1.4, ease: "power3" }); qy = g.quickTo(amb, "y", { duration: 1.4, ease: "power3" });
    const upd = () => { qx(px); qy(py - Math.min(window.scrollY, 3000) * 0.035); };
    window.addEventListener("scroll", upd, { passive: true });
    if (window.matchMedia("(pointer:fine)").matches)
      window.addEventListener("pointermove", (e) => { px = (e.clientX / window.innerWidth - 0.5) * -26; py = (e.clientY / window.innerHeight - 0.5) * -18; upd(); }, { passive: true });
  }

  /* ------------------------------------------------ page entrance + scroll reveals */
  const TEXT = "main h1, main h2, main .eyebrow, main .hero-sub, main .hero-actions, main .hero-search, main .hero-stats, main .breadcrumb, main .dash-sub, main .c-lead";
  const CARDS = "main .doodle-card, main .step-card, main .stat-card, main .unit-chip, main .empty-state, main .pf-panel, main .pf-side, main .upload-form, main .c-hero, main .c-panel, main .c-steps, main .unit-group, main .c-adm-row, main .c-tablewrap, main .upload-success, main .c-unlocked";
  const SETTLE = 1300;              // ms during which a repeat render continues the same entrance instead of restarting it
  let lastKey = "", lastAt = 0, entTl = null;
  const viewKey = () => { const s = S(); if (!s) return ""; const n = s.nav || {}; return [s.page, n.deptId, n.year, n.sem, n.subjectId, n.category, n.teacherId, s.unitFilter].join("|"); };
  const clean = (els) => {                                              // hand control back to the CSS hover styles
    els.forEach((el) => el.classList.remove("mo-anim"));
    window.gsap.set(els, { clearProps: "opacity,transform,visibility,willChange" });
  };
  const outermost = (list, all) => list.filter((el) => !(el.parentElement && el.parentElement.closest(all)));

  function entrance(elapsed, fresh) {
    const g = window.gsap, ST = window.ScrollTrigger;
    const main = document.querySelector("main"); if (!main) return;
    const texts = outermost([...main.querySelectorAll(TEXT)], TEXT);
    const cards = outermost([...main.querySelectorAll(CARDS)], CARDS);
    const vh = window.innerHeight * 0.94, inView = (el) => el.getBoundingClientRect().top < vh;
    const tNow = texts.filter(inView), cNow = cards.filter(inView).slice(0, 26);
    const later = [...texts.filter((t) => !tNow.includes(t)), ...cards.filter((c) => !cNow.includes(c))];   // headings AND cards further down
    const all = [...texts, ...cards];
    try {
      all.forEach((el) => el.classList.add("mo-anim"));                  // no CSS transition while GSAP moves it
      g.set(all, { opacity: 0, y: 18 });
      if (entTl) entTl.kill();
      entTl = g.timeline({ defaults: { ease: "power3.out" }, onComplete: () => clean([...tNow, ...cNow]) });
      entTl.to(tNow, { opacity: 1, y: 0, duration: 0.5, stagger: Math.min(0.06, 0.3 / Math.max(tNow.length, 1)) })
           .to(cNow, { opacity: 1, y: 0, duration: 0.45, stagger: Math.min(0.045, 0.35 / Math.max(cNow.length, 1)) }, "-=0.3");
      if (elapsed > 0) entTl.time(Math.min(elapsed, entTl.duration()));
      // cards below the fold reveal as they scroll into view (batched, once)
      if (later.length) ST.batch(later, {
        start: "top 95%", once: true,
        onEnter: (batch) => g.to(batch, { opacity: 1, y: 0, duration: 0.55, stagger: 0.07, ease: "power2.out", overwrite: true, onComplete: () => clean(batch) }),
      });
      if (fresh) countUp(main);
    } catch (e) { console.error("motion", e); try { clean(all); } catch (x) { /* ignore */ } }
  }
  function parallax() {                              // restrained: hero blobs drift a little while scrolling
    const g = window.gsap, hero = document.querySelector("main .hero"); if (!hero) return;
    hero.querySelectorAll(".blob-sun,.blob-sky").forEach((b, i) =>
      g.to(b, { yPercent: i ? -18 : 22, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.6 } }));
  }
  function countUp(main) {                           // "12+ subjects mapped" counts up once on the home page
    const g = window.gsap;
    main.querySelectorAll(".hero-stats span").forEach((el) => {
      const m = /^([\d,]+)(.*)$/.exec(el.textContent.trim()); if (!m) return;
      const end = Number(m[1].replace(/,/g, "")), rest = m[2]; if (!(end > 0)) return;
      const o = { n: 0 };
      g.to(o, { n: end, duration: 1.1, ease: "power2.out", delay: 0.25, onUpdate: () => { el.textContent = Math.round(o.n).toLocaleString() + rest; }, onComplete: () => { el.textContent = end.toLocaleString() + rest; } });
    });
  }

  /* ------------------------------------------------ windows, menus, toasts, heart pop */
  const flags = { modal: "", search: false, menu: false, toast: "" };
  let popId = null;
  function overlays() {
    const s = S(), g = window.gsap; if (!s) return;
    const modalKey = s.activeResourceId || (s.authOpen ? "auth" : "");
    const ov = document.querySelector(".modal-overlay"), panel = ov && ov.querySelector(".modal-panel");
    if (modalKey && modalKey !== flags.modal && ov && panel) {
      g.fromTo(ov, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "none", clearProps: "opacity" });
      g.fromTo(panel, { y: 36, opacity: 0, scale: 0.985 }, { y: 0, opacity: 1, scale: 1, duration: 0.36, ease: "power3.out", clearProps: "transform,opacity" });
    }
    flags.modal = modalKey;
    const sp = document.querySelector(".search-panel");
    if (s.searchOpen && !flags.search && sp) g.fromTo(sp, { y: -14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.28, ease: "power3.out", clearProps: "transform,opacity" });
    flags.search = !!s.searchOpen;
    const mm = document.querySelector(".mobile-menu");
    if (s.mobileMenuOpen && !flags.menu && mm) { mm.style.overflow = "hidden"; g.from(mm, { height: 0, opacity: 0, duration: 0.3, ease: "power2.out", clearProps: "height,opacity,overflow" }); }
    flags.menu = !!s.mobileMenuOpen;
    const t = document.querySelector(".toast");
    if (t && s.toast && s.toast !== flags.toast) g.fromTo(t, { xPercent: -50, y: 16, opacity: 0 }, { xPercent: -50, y: 0, opacity: 1, duration: 0.3, ease: "back.out(1.5)", clearProps: "transform,opacity" });
    flags.toast = s.toast || "";
    if (popId != null) {                                                    // a heart that was just saved pops
      const id = popId; popId = null;
      document.querySelectorAll('[data-action="toggle-save"]').forEach((b) => { if (b.getAttribute("data-id") === id) { const ic = b.querySelector("svg"); if (ic) g.fromTo(ic, { scale: 0.4 }, { scale: 1, duration: 0.55, ease: "elastic.out(1, 0.5)", clearProps: "transform" }); } });
    }
  }

  /* ------------------------------------------------ single interactive background orb (lazy, Home / Contribute only) */
  let bg = null, bgLoading = false;
  const wantBg = () => { const s = S(); return !!s && canAnimate() && (s.page === "home" || s.page === "upload") && !(navigator.connection && navigator.connection.saveData); };
  function syncBg() {
    if (wantBg() && !bg && !bgLoading) {
      bgLoading = true;
      const go = () => import("./background3d.js")
        .then((m) => { if (m.start()) { bg = m; m.setVisible(wantBg()); } })
        .catch((e) => console.warn("3D background not loaded:", e))
        .finally(() => { bgLoading = false; });
      (window.requestIdleCallback || ((f) => setTimeout(f, 900)))(go, { timeout: 2500 });
    } else if (bg) bg.setVisible(wantBg());
  }

  /* ------------------------------------------------ after every render */
  function afterRender() {
    const s = S(); if (!s) return;
    const dept = s.nav && s.nav.deptId && typeof deptBg === "function" ? deptBg(s.nav.deptId) : null;
    setTint(dept ? [dept, "#FFC93C", "#3AACFF"] : DEFAULT_TINT);
    if (!canAnimate()) { root.classList.remove("mo-on"); return; }
    root.classList.add("mo-on");
    window.ScrollTrigger.getAll().forEach((t) => t.kill());               // the DOM was replaced: old triggers point at dead elements
    const key = viewKey(), now = performance.now();
    if (key !== lastKey) { lastKey = key; lastAt = now; entrance(0, true); }
    else if (now - lastAt < SETTLE) entrance((now - lastAt) / 1000, false);    // re-render during the entrance: carry on seamlessly
    try { parallax(); } catch (e) { console.error("motion", e); }
    overlays(); syncBg();
  }

  /* ------------------------------------------------ on / off */
  function toggle() {
    try { localStorage.setItem(KEY, userOn() ? "off" : "on"); } catch (e) { /* ignore */ }
    if (userOn()) { startAmbient(); startParallax(); lastKey = ""; }
    else {
      stopAmbient(); root.classList.remove("mo-on");
      if (window.gsap) { window.gsap.globalTimeline.clear(); window.ScrollTrigger && window.ScrollTrigger.getAll().forEach((t) => t.kill()); window.gsap.set("main *, .mo-anim", { clearProps: "opacity,transform,visibility" }); document.querySelectorAll(".mo-anim").forEach((e) => e.classList.remove("mo-anim")); }
      if (bg) { bg.setVisible(false); }
    }
    syncBg(); return userOn();
  }
  if (mq.addEventListener) mq.addEventListener("change", () => { if (mq.matches) { stopAmbient(); if (bg) bg.setVisible(false); root.classList.remove("mo-on"); } else { startAmbient(); startParallax(); syncBg(); } });

  window.Motion = { busyStart, toggle, enabled: userOn, active: canAnimate, pop: (id) => { popId = String(id); }, setTint, status: () => ({ gsap: libs(), reduced: mq.matches, on: userOn(), bg: bg ? bg.stats() : null }) };

  // run after every render()
  const baseRender = window.render;
  if (typeof baseRender === "function") {
    window.render = function () { const r = baseRender.apply(this, arguments); try { afterRender(); } catch (e) { console.error("motion", e); } return r; };
  }
  startAmbient(); startParallax();
  try { afterRender(); } catch (e) { console.error("motion", e); }        // animate the page that is already on screen
})();
