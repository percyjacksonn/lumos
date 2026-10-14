/* =====================================================================
   Lumos UI sounds  (sounds.js)  -  Web Audio
   Warm, glass-like study-room sounds made with Web Audio. They are deliberately
   quiet and short so the interface feels polished without competing with study.
   - Nothing plays on page load, scroll or hover. Only taps / clicks and real results.
   - Each kind of button has its own sound; the same sound never stacks on itself.
   Load order in index.html: sounds.js -> script.js
   ===================================================================== */
(() => {
  "use strict";
  const on = () => true;
  let last = 0;

  /* ---- fallback: the same sounds made live with the Web Audio API ---- */
  let ctx = null;
  const SYNTH = {
    click: [[659, 0, .055, "sine", .035]], tap: [[784, 0, .045, "sine", .03]], card: [[523, 0, .07, "sine", .045, 659]],
    primary: [[523, 0, .07, "sine", .05], [784, .055, .13, "sine", .045]], soft: [[440, 0, .06, "sine", .035, 554]],
    save: [[784, 0, .07, "sine", .045], [1047, .055, .14, "sine", .04]], unsave: [[554, 0, .11, "sine", .035, 440]],
    download: [[170, 0, .13, "sine", .16, 85], [784, .11, .09, "triangle", .10], [1047, .19, .16, "triangle", .10]],
    login: [[523, 0, .09, "triangle", .12], [659, .08, .09, "triangle", .12], [784, .16, .09, "triangle", .12], [1047, .24, .22, "triangle", .13]],
    signup: [[392, 0, .08, "triangle", .12], [494, .07, .08, "triangle", .12], [587, .14, .08, "triangle", .12], [784, .21, .09, "triangle", .12], [1175, .29, .26, "sine", .12]],
    logout: [[784, 0, .10, "triangle", .11], [523, .10, .18, "triangle", .11]], error: [[170, 0, .13, "square", .08], [135, .12, .17, "square", .08]],
    unlock: [[988, 0, .06, "square", .07], [1319, .06, .06, "square", .07], [1568, .12, .20, "triangle", .12]],
    success: [[659, 0, .08, "triangle", .12], [784, .08, .08, "triangle", .12], [1047, .16, .08, "triangle", .12], [1319, .24, .25, "triangle", .13]],
    approve: [[880, 0, .08, "sine", .13], [1319, .08, .22, "sine", .13]], reject: [[196, 0, .16, "triangle", .14, 120]],
    toggle: [[660, 0, .05, "sine", .10], [880, .05, .07, "sine", .10]], ready: [[880, 0, .07, "sine", .07], [1175, .07, .13, "sine", .07]],
    notify: [[1047, 0, .08, "sine", .08], [784, .09, .14, "sine", .08]],
  };
  function audio() {
    if (!ctx) { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null; try { ctx = new AC(); } catch (e) { return null; } }
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  }
  function note(c, f, at, len, type, vol, to) {
    const t = c.currentTime + at, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + len);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + len + 0.03);
  }

  function play(name) {
    if (!on()) return;
    const now = Date.now(); if (now - last < 35) return; last = now;           // never double-fire
    const s = SYNTH[name], c = s && audio();
    if (c) s.forEach((n) => note(c, n[0], n[1], n[2], n[3], n[4], n[5]));
  }

  // which sound for which kind of button (looked up on every click)
  function soundFor(btn) {
    const a = btn.getAttribute("data-action") || "";
    if (/^(toggle-save|download-resource|logout|toggle-sound|toggle-motion)$/.test(a)) return null;   // these play their own sound with the real result
    if (/^c-adm-(approve|reject|delete)$/.test(a)) return null;
    if (btn.matches(".heart-btn,.save-toggle")) return null;
    if (btn.getAttribute("type") === "submit") return "tap";                   // the result (login, upload...) plays its own
    if (btn.matches(".btn-primary")) return "primary";
    if (btn.matches(".btn-secondary,.btn-sky,.pf-btn")) return "soft";
    if (btn.matches(".c-chip,.c-unit,.unit-chip,.chip,.auth-seg button,.crumb,.pw-eye,.c-x")) return "tap";
    if (btn.matches(".doodle-card,.dept-card,.year-card,.sem-card,.subject-card,.cat-card,.quick-card")) return "card";
    return "click";
  }

  document.addEventListener("click", (e) => {
    const el = e.target.closest && e.target.closest("button, a.btn, [role=button], .doodle-card");
    if (!el || el.disabled || el.closest("[disabled]")) return;
    const s = soundFor(el); if (s) play(s);
  }, true);

  window.Sfx = {
    play, enabled: on,
    status: () => ({ theme: "warm-glass" }),
    _sounds: SYNTH, _soundFor: soundFor,
  };
})();
