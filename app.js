import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js";

const mount = document.getElementById("stage");

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(mount.clientWidth, mount.clientHeight);
renderer.setClearColor(0x000000, 0);
mount.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 100);
camera.position.set(0, 1.2, 7);

scene.add(new THREE.AmbientLight(0xffffff, 0.55));
const key = new THREE.DirectionalLight(0xffffff, 0.9);
key.position.set(4, 6, 4);
scene.add(key);
const fill = new THREE.DirectionalLight(0xffffff, 0.5);
fill.position.set(-5, 2, 2);
scene.add(fill);

const group = new THREE.Group();
scene.add(group);

const accentBlue = new THREE.Color("#1E5BEF");
const slateDark = new THREE.Color("#374151");
const ink = new THREE.Color("#0F172A");

function matStandard(color, rough = 0.6, metal = 0.15) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: rough,
    metalness: metal
  });
}

function applyMaterial(root, material) {
  root.traverse((o) => {
    if (o.isMesh) o.material = material;
  });
}

function cloneWithWireframe(root, wireColor = accentBlue) {
  const copy = root.clone(true);
  copy.traverse((o) => {
    if (!o.isMesh) return;
    const geo = o.geometry;
    o.geometry = geo;
    o.material = new THREE.MeshBasicMaterial({ color: wireColor, wireframe: true, transparent: true, opacity: 0.65 });
  });
  return copy;
}

/* Objects: low poly, graphic, intentional */

function makeLaptop() {
  const g = new THREE.Group();

  const base = new THREE.Mesh(new THREE.BoxGeometry(2.25, 0.12, 1.55), matStandard(slateDark, 0.75, 0.15));
  base.position.y = -0.25;

  const screen = new THREE.Mesh(new THREE.BoxGeometry(2.25, 1.4, 0.08), matStandard(ink, 0.5, 0.1));
  screen.position.set(0, 0.58, -0.72);
  screen.rotation.x = -0.24;

  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.95, 1.15),
    new THREE.MeshBasicMaterial({ color: accentBlue, transparent: true, opacity: 0.18 })
  );
  glow.position.set(0, 0.58, -0.67);
  glow.rotation.x = -0.24;

  const trackpad = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.02, 0.52), matStandard(new THREE.Color("#6B7280"), 0.95, 0));
  trackpad.position.set(0, -0.18, 0.22);

  g.add(base, screen, glow, trackpad);
  g.rotation.y = 0.35;
  return g;
}

function makeBooks() {
  const g = new THREE.Group();

  const b1 = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.26, 1.15), matStandard(ink, 0.85, 0.1));
  const b2 = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.22, 1.15), matStandard(new THREE.Color("#334155"), 0.85, 0.1));
  const b3 = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.28, 1.15), matStandard(new THREE.Color("#111827"), 0.85, 0.1));
  b2.position.y = 0.25;
  b3.position.y = 0.5;

  const spine = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.8, 1.15), matStandard(accentBlue, 0.6, 0.2));
  spine.position.set(-0.8, 0.25, 0);

  g.add(b1, b2, b3, spine);
  g.rotation.y = -0.3;
  return g;
}

function makePhone() {
  const g = new THREE.Group();

  const body = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.1, 0.14), matStandard(ink, 0.45, 0.25));
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.95, 1.85),
    new THREE.MeshBasicMaterial({ color: accentBlue, transparent: true, opacity: 0.14 })
  );
  screen.position.z = 0.08;

  const cam = new THREE.Mesh(new THREE.CircleGeometry(0.085, 24), matStandard(new THREE.Color("#111827"), 0.25, 0.6));
  cam.position.set(0.33, 0.83, 0.08);

  g.add(body, screen, cam);
  g.rotation.y = 0.22;
  return g;
}

function makeBoot() {
  const g = new THREE.Group();

  const sole = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.18, 0.85), matStandard(new THREE.Color("#111827"), 0.95, 0));
  sole.position.y = -0.6;

  const foot = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.58, 0.8), matStandard(new THREE.Color("#1F2937"), 0.85, 0.1));
  foot.position.set(-0.08, -0.25, 0);

  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.58, 1.28, 24), matStandard(new THREE.Color("#334155"), 0.8, 0.1));
  shaft.position.set(-0.35, 0.58, 0);

  const stitch = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.02, 10, 56), matStandard(accentBlue, 0.6, 0.2));
  stitch.position.set(-0.35, 0.58, 0);
  stitch.rotation.x = Math.PI / 2;

  const heel = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.36, 0.75), matStandard(ink, 0.95, 0));
  heel.position.set(0.62, -0.45, 0);

  g.add(sole, foot, shaft, stitch, heel);
  g.rotation.y = 0.55;
  return g;
}

function makeCup() {
  const g = new THREE.Group();

  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.56, 1.22, 32), matStandard(new THREE.Color("#E5E7EB"), 0.75, 0));
  const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.63, 0.53, 0.5, 32), matStandard(slateDark, 0.95, 0));
  sleeve.position.y = -0.05;

  const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.18, 32), matStandard(ink, 0.75, 0.1));
  lid.position.y = 0.7;

  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.06, 10, 40), matStandard(new THREE.Color("#E5E7EB"), 0.75, 0));
  handle.position.set(0.64, 0.1, 0);
  handle.rotation.y = Math.PI / 2;

  const logo = new THREE.Mesh(new THREE.CircleGeometry(0.18, 32), new THREE.MeshBasicMaterial({ color: accentBlue, transparent: true, opacity: 0.5 }));
  logo.position.set(0, -0.05, 0.58);

  g.add(cup, sleeve, lid, handle, logo);
  g.rotation.y = -0.15;
  return g;
}

function makeZine() {
  const g = new THREE.Group();

  const coverL = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.1, 0.08), matStandard(new THREE.Color("#111827"), 0.85, 0.1));
  const coverR = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.1, 0.08), matStandard(ink, 0.85, 0.1));
  coverL.position.x = -0.82;
  coverR.position.x = 0.82;
  coverL.rotation.y = 0.22;
  coverR.rotation.y = -0.22;

  const spine = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.15, 0.18), matStandard(accentBlue, 0.6, 0.2));
  spine.position.z = -0.02;

  const sticker = new THREE.Mesh(new THREE.CircleGeometry(0.22, 36), new THREE.MeshBasicMaterial({ color: accentBlue, transparent: true, opacity: 0.42 }));
  sticker.position.set(0.42, 0.62, 0.06);

  g.add(coverL, coverR, spine, sticker);
  g.rotation.y = 0.35;
  return g;
}

const objects = [makeLaptop(), makeBoot(), makeBooks(), makePhone(), makeCup(), makeZine()];

let currentIndex = 0;
let current = objects[currentIndex];
group.add(current);

/* Transition: wireframe pulse overlay */

let pulse = null;
let pulseT = 0;
let pulsing = false;

function startPulse() {
  if (pulse) {
    scene.remove(pulse);
    pulse = null;
  }
  pulse = cloneWithWireframe(current, accentBlue);
  scene.add(pulse);
  pulseT = 0;
  pulsing = true;
}

function updatePulse(dt) {
  if (!pulsing || !pulse) return;
  pulseT += dt;
  const a = Math.max(0, 1 - pulseT / 0.7);
  pulse.traverse((o) => {
    if (o.isMesh) o.material.opacity = 0.65 * a;
  });
  if (pulseT >= 0.7) {
    scene.remove(pulse);
    pulse = null;
    pulsing = false;
  }
}

function swapObject() {
  group.remove(current);
  currentIndex = (currentIndex + 1) % objects.length;
  current = objects[currentIndex];
  group.add(current);
}

/* Mouse follow */

const mouse = new THREE.Vector2(0, 0);
const target = new THREE.Vector3(0, 0, 0);
const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const ray = new THREE.Raycaster();

mount.addEventListener(
  "mousemove",
  (e) => {
    const r = mount.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    mouse.x = x * 2 - 1;
    mouse.y = -(y * 2 - 1);
  },
  { passive: true }
);

function updateMouseTarget() {
  ray.setFromCamera(mouse, camera);
  ray.ray.intersectPlane(plane, target);
}

/* Timing */

const changeEveryMs = 4000;
setInterval(() => {
  startPulse();
  swapObject();
}, changeEveryMs);

/* Resize */

function resize() {
  const w = mount.clientWidth;
  const h = mount.clientHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", resize);

/* Render loop */

let last = performance.now();
function tick(now) {
  requestAnimationFrame(tick);
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  updateMouseTarget();

  group.position.lerp(new THREE.Vector3(target.x * 0.12, target.y * 0.12, 0), 0.08);

  group.rotation.y += 0.01;
  group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, mouse.y * 0.22, 0.06);
  group.rotation.z = THREE.MathUtils.lerp(group.rotation.z, -mouse.x * 0.12, 0.06);

  updatePulse(dt);

  renderer.render(scene, camera);
}
tick(last);
