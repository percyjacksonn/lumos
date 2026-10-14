/* =====================================================================
   Lumos 3D background  (background3d.js)  -  Three.js
   Loaded ONLY on the Home and Contribute pages, only on devices that can
   comfortably run it, and only after the page is already usable.
   A calm, low-opacity field: soft dots, a few wireframe shapes and large soft spheres in
   the Lumos colours, faded into the paper colour with distance (depth).
   It reacts a little to the cursor and to scrolling and never competes with the content.
   Pauses when the tab is hidden or the page does not need it. Never runs for people who
   prefer reduced motion (motion.js decides that before importing this file).
   ===================================================================== */
import * as THREE from "./vendor/three.module.min.js";

const PAPER = 0xfaf9ec;
const PALETTE = [0xF0523A, 0xFFC93C, 0x3AACFF, 0x2FAE73];
const small = () => window.innerWidth < 760 || (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;

let canvas, renderer, scene, camera, dots, dotsPos, dotsSpeed, shapes = [], spheres = [];
let running = false, shown = false, built = false, frames = 0, lastT = 0, stopTimer = 0;
let mx = 0, my = 0, cx = 0, cy = 0, sy = 0, fpsGap = 0;
let bubbleClicks = 0, bursting = false, reformAt = 0;
const clock = new THREE.Clock();

function softDot() {
  const c = document.createElement("canvas"); c.width = c.height = 64;
  const g = c.getContext("2d"), grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)"); grad.addColorStop(0.45, "rgba(255,255,255,.8)"); grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad; g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}
const rnd = (a, b) => a + Math.random() * (b - a);

function build() {
  const lite = small();
  canvas = document.createElement("canvas"); canvas.className = "mo-bg3d"; canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);
  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !lite, powerPreference: "low-power" });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lite ? 1.25 : 1.5));
  scene = new THREE.Scene(); scene.fog = new THREE.Fog(PAPER, 7, 18);
  camera = new THREE.PerspectiveCamera(48, 1, 0.1, 40); camera.position.set(0, 0, 9);

  // soft dots
  const N = lite ? 34 : 90, pos = new Float32Array(N * 3), col = new Float32Array(N * 3), tmp = new THREE.Color();
  dotsSpeed = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    pos.set([rnd(-11, 11), rnd(-7, 7), rnd(-8, 3)], i * 3);
    tmp.setHex(PALETTE[i % PALETTE.length]); col.set([tmp.r, tmp.g, tmp.b], i * 3);
    dotsSpeed[i] = rnd(0.05, 0.16);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  // The dots stay invisible until the bubble bursts, when they become its soft particles.
  dots = new THREE.Points(g, new THREE.PointsMaterial({ size: lite ? 0.18 : 0.15, map: softDot(), vertexColors: true, transparent: true, opacity: 0, depthWrite: false, fog: true }));
  dotsPos = pos; scene.add(dots);

  // a few wireframe shapes (slow, far, translucent)
  const geos = [new THREE.IcosahedronGeometry(1, 0), new THREE.TorusGeometry(0.75, 0.17, 6, 18), new THREE.OctahedronGeometry(1, 0), new THREE.IcosahedronGeometry(0.8, 0)];
  const nShapes = 0;
  for (let i = 0; i < nShapes; i++) {
    const m = new THREE.Mesh(geos[i % geos.length], new THREE.MeshBasicMaterial({ color: PALETTE[(i + 1) % PALETTE.length], wireframe: true, transparent: true, opacity: 0.38, fog: true }));
    m.position.set(rnd(-9, 9), rnd(-5, 5), rnd(-7, 0)); m.scale.setScalar(rnd(0.7, 1.5));
    m.userData = { rx: rnd(0.04, 0.14), ry: rnd(0.05, 0.16), bob: rnd(0.2, 0.5), ph: rnd(0, 6.28), y0: m.position.y };
    shapes.push(m); scene.add(m);
  }
  // big soft spheres: gentle colour and depth, like out-of-focus lights
  for (let i = 0; i < 1; i++) {
    const s = new THREE.Mesh(new THREE.SphereGeometry(1.7, 32, 20), new THREE.MeshBasicMaterial({ color: PALETTE[1], transparent: true, opacity: 0.22, fog: true, depthWrite: false }));
    s.position.set(2.8, .4, 0); s.userData = { ph: rnd(0, 6.28), y0: s.position.y };
    spheres.push(s); scene.add(s);
  }
  fpsGap = lite ? 1000 / 30 : 1000 / 45;                       // lighter frame rate budget on phones
  resize();
  window.addEventListener("resize", debounce(resize, 150));
  window.addEventListener("scroll", () => { sy = window.scrollY; }, { passive: true });
  if (window.matchMedia && matchMedia("(pointer:fine)").matches)
    window.addEventListener("pointermove", (e) => { mx = (e.clientX / window.innerWidth - 0.5) * 2; my = (e.clientY / window.innerHeight - 0.5) * 2; }, { passive: true });
  document.addEventListener("visibilitychange", () => { if (document.hidden) halt(); else if (shown) go(); });
  document.addEventListener("click", bubbleClick, true);
  canvas.addEventListener("webglcontextlost", (e) => { e.preventDefault(); halt(); });
  built = true;
}
function debounce(f, ms) { let t; return () => { clearTimeout(t); t = setTimeout(f, ms); }; }
function resize() {
  if (!renderer) return;
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
}
function bubbleClick(e) {
  if (!shown || bursting || e.target.closest("button,a,input,select,textarea,label")) return;
  const b = spheres[0]; if (!b) return;
  const p = b.position.clone().project(camera);
  const x = (p.x * .5 + .5) * innerWidth, y = (-p.y * .5 + .5) * innerHeight;
  if (Math.hypot(e.clientX - x, e.clientY - y) > Math.min(innerWidth, innerHeight) * .16) return;
  bubbleClicks++;
  if (bubbleClicks < 3) { b.scale.setScalar(1 + bubbleClicks * .06); return; }
  bubbleClicks = 0; bursting = true; b.visible = false; dots.material.opacity = .7; reformAt = performance.now() + 700;
  for (let i = 0; i < dotsSpeed.length; i++) { const k = i * 3, a = Math.random() * Math.PI * 2; dotsPos[k] = b.position.x; dotsPos[k + 1] = b.position.y; dotsPos[k + 2] = 0; dotsSpeed[i] = 1 + Math.random() * 1.4; dotsPos[k] += Math.cos(a) * .02; dotsPos[k + 1] += Math.sin(a) * .02; }
  dots.geometry.attributes.position.needsUpdate = true;
}
function frame() {
  const now = performance.now(); if (now - lastT < fpsGap) return; lastT = now;
  const dt = Math.min(clock.getDelta(), 0.1), t = clock.elapsedTime;
  for (let i = 0; i < dotsSpeed.length; i++) {                  // particles drift only during a burst
    const k = i * 3;
    if (bursting) { dotsPos[k + 1] += dotsSpeed[i] * dt; dotsPos[k] += Math.sin(t * 4 + i) * .018; }
  }
  dots.geometry.attributes.position.needsUpdate = true;
  for (const m of shapes) { m.rotation.x += m.userData.rx * dt; m.rotation.y += m.userData.ry * dt; m.position.y = m.userData.y0 + Math.sin(t * m.userData.bob + m.userData.ph) * 0.35; }
  for (const s of spheres) {
    if (!bursting) { s.position.y = s.userData.y0 + Math.sin(t * 0.18 + s.userData.ph) * 0.08; s.scale.lerp(new THREE.Vector3(1, 1, 1), .04); }
  }
  if (bursting && now >= reformAt) { bursting = false; dots.material.opacity = 0; if (spheres[0]) { spheres[0].visible = true; spheres[0].scale.setScalar(.72); } }
  cx += (mx * 0.7 - cx) * 0.04; cy += (-my * 0.4 - cy) * 0.04;   // cursor parallax, eased
  camera.position.x = cx; camera.position.y = cy - Math.min(sy, 4000) * 0.0016;
  camera.lookAt(0, camera.position.y * 0.6, 0);
  renderer.render(scene, camera); frames++;
}
function go() { if (!built || running || document.hidden) return; running = true; clock.getDelta(); renderer.setAnimationLoop(frame); }
function halt() { if (!running) return; running = false; renderer.setAnimationLoop(null); }

/** Start (build once). Returns true when WebGL is available. */
export function start() {
  if (built) return true;
  try { build(); return true; }
  catch (e) { console.warn("3D background unavailable:", e); destroy(); return false; }
}
/** Fade the background in or out; the loop only runs while it is shown. */
export function setVisible(v) {
  if (!built) return;
  shown = !!v; clearTimeout(stopTimer);
  if (shown) { canvas.classList.add("on"); go(); }
  else { canvas.classList.remove("on"); stopTimer = setTimeout(halt, 1000); }   // keep running while it fades out
}
export function destroy() {
  halt(); clearTimeout(stopTimer);
  document.removeEventListener("click", bubbleClick, true);
  try { scene && scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) { o.material.map && o.material.map.dispose(); o.material.dispose(); } }); } catch (e) { /* ignore */ }
  try { renderer && renderer.dispose(); } catch (e) { /* ignore */ }
  if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
  canvas = renderer = scene = camera = dots = null; shapes = []; spheres = []; built = false; shown = false;
}
export const stats = () => ({ built, running, shown, frames, interaction: "third-click bubble burst" });
