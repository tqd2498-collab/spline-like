import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js";
import { RoundedBoxGeometry } from "https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/geometries/RoundedBoxGeometry.js";
import { MeshSurfaceSampler } from "https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/math/MeshSurfaceSampler.js";
import { BufferGeometryUtils } from "https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/utils/BufferGeometryUtils.js";

const mount = document.getElementById("stage");

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(mount.clientWidth, mount.clientHeight);
renderer.setClearColor(0x000000, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;
mount.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(42, mount.clientWidth / mount.clientHeight, 0.1, 200);
camera.position.set(0, 1.2, 7.5);

const key = new THREE.DirectionalLight(0xffffff, 1.15);
key.position.set(5, 7, 4);
scene.add(key);

const rim = new THREE.DirectionalLight(0xffffff, 0.85);
rim.position.set(-6, 2.5, -2);
scene.add(rim);

scene.add(new THREE.AmbientLight(0xffffff, 0.25));

const group = new THREE.Group();
scene.add(group);

const cobalt = new THREE.Color("#1E5BEF");
const silver = new THREE.Color("#E5E7EB");

function matPBR(color, rough = 0.55, metal = 0.18) {
  return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
}

function tagBaseColor(mesh, color) {
  mesh.userData.baseColor = color;
  return mesh;
}

function makeLaptop() {
  const g = new THREE.Group();

  const base = tagBaseColor(
    new THREE.Mesh(new RoundedBoxGeometry(2.55, 0.14, 1.65, 8, 0.06), matPBR(silver, 0.65, 0.25)),
    silver
  );
  base.position.y = -0.28;

  const hinge = tagBaseColor(
    new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.3, 26), matPBR(silver, 0.55, 0.35)),
    silver
  );
  hinge.rotation.z = Math.PI / 2;
  hinge.position.set(0, -0.18, -0.78);

  const screenBack = tagBaseColor(
    new THREE.Mesh(new RoundedBoxGeometry(2.55, 1.6, 0.09, 8, 0.06), matPBR(silver, 0.6, 0.25)),
    silver
  );
  screenBack.position.set(0, 0.65, -0.82);
  screenBack.rotation.x = -0.26;

  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 1.3),
    new THREE.MeshBasicMaterial({ color: cobalt, transparent: true, opacity: 0.15 })
  );
  glow.position.set(0, 0.65, -0.76);
  glow.rotation.x = -0.26;

  g.add(base, hinge, screenBack, glow);
  g.rotation.y = 0.25;
  return g;
}

function makeBooks() {
  const g = new THREE.Group();

  const b1 = tagBaseColor(new THREE.Mesh(new RoundedBoxGeometry(1.95, 0.3, 1.28, 8, 0.06), matPBR(silver, 0.75, 0.2)), silver);
  const b2 = tagBaseColor(new THREE.Mesh(new RoundedBoxGeometry(1.95, 0.26, 1.28, 8, 0.06), matPBR(silver, 0.75, 0.2)), silver);
  const b3 = tagBaseColor(new THREE.Mesh(new RoundedBoxGeometry(1.95, 0.32, 1.28, 8, 0.06), matPBR(silver, 0.75, 0.2)), silver);

  b2.position.y = 0.29;
  b3.position.y = 0.56;

  const band = tagBaseColor(new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.95, 1.28), matPBR(cobalt, 0.5, 0.35)), cobalt);
  band.position.set(-0.93, 0.28, 0);

  g.add(b1, b2, b3, band);
  g.rotation.y = -0.28;
  return g;
}

function makePhone() {
  const g = new THREE.Group();

  const body = tagBaseColor(new THREE.Mesh(new RoundedBoxGeometry(1.15, 2.2, 0.16, 10, 0.12), matPBR(silver, 0.6, 0.25)), silver);

  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.95, 1.9),
    new THREE.MeshBasicMaterial({ color: cobalt, transparent: true, opacity: 0.12 })
  );
  screen.position.z = 0.1;

  const camPlate = tagBaseColor(new THREE.Mesh(new RoundedBoxGeometry(0.6, 0.6, 0.08, 8, 0.08), matPBR(silver, 0.55, 0.35)), silver);
  camPlate.position.set(0.25, 0.74, 0.06);

  const cam = tagBaseColor(new THREE.Mesh(new THREE.CircleGeometry(0.09, 30), matPBR(cobalt, 0.4, 0.4)), cobalt);
  cam.position.set(0.25, 0.74, 0.11);

  g.add(body, screen, camPlate, cam);
  g.rotation.y = 0.22;
  return g;
}

function makeBoot() {
  const g = new THREE.Group();

  const sole = tagBaseColor(new THREE.Mesh(new RoundedBoxGeometry(1.75, 0.22, 0.95, 8, 0.06), matPBR(silver, 0.85, 0.15)), silver);
  sole.position.y = -0.64;

  const foot = tagBaseColor(new THREE.Mesh(new RoundedBoxGeometry(1.3, 0.64, 0.88, 10, 0.12), matPBR(silver, 0.8, 0.18)), silver);
  foot.position.set(-0.08, -0.26, 0);

  const shaft = tagBaseColor(new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.64, 1.38, 34), matPBR(silver, 0.8, 0.18)), silver);
  shaft.position.set(-0.35, 0.62, 0);

  const stitch = tagBaseColor(new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.022, 10, 72), matPBR(cobalt, 0.5, 0.35)), cobalt);
  stitch.position.set(-0.35, 0.62, 0);
  stitch.rotation.x = Math.PI / 2;

  const heel = tagBaseColor(new THREE.Mesh(new RoundedBoxGeometry(0.4, 0.44, 0.82, 8, 0.06), matPBR(silver, 0.9, 0.1)), silver);
  heel.position.set(0.66, -0.45, 0);

  g.add(sole, foot, shaft, stitch, heel);
  g.rotation.y = 0.55;
  return g;
}

function makeCup() {
  const g = new THREE.Group();

  const cup = tagBaseColor(new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.62, 1.3, 48), matPBR(silver, 0.75, 0.15)), silver);

  const sleeve = tagBaseColor(new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.58, 0.54, 48), matPBR(silver, 0.9, 0.1)), silver);
  sleeve.position.y = -0.05;

  const lid = tagBaseColor(new THREE.Mesh(new THREE.CylinderGeometry(0.76, 0.76, 0.18, 48), matPBR(silver, 0.8, 0.15)), silver);
  lid.position.y = 0.74;

  const handle = tagBaseColor(new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.06, 12, 60), matPBR(cobalt, 0.5, 0.35)), cobalt);
  handle.position.set(0.7, 0.1, 0);
  handle.rotation.y = Math.PI / 2;

  const logo = new THREE.Mesh(new THREE.CircleGeometry(0.19, 38), new THREE.MeshBasicMaterial({ color: cobalt, transparent: true, opacity: 0.25 }));
  logo.position.set(0, -0.05, 0.64);

  g.add(cup, sleeve, lid, handle, logo);
  g.rotation.y = -0.18;
  return g;
}

function makeBrain() {
  const g = new THREE.Group();

  const left = tagBaseColor(new THREE.Mesh(new THREE.SphereGeometry(0.95, 40, 28), matPBR(silver, 0.7, 0.18)), silver);
  left.scale.set(1.0, 0.82, 0.92);
  left.position.x = -0.54;

  const right = tagBaseColor(new THREE.Mesh(new THREE.SphereGeometry(0.95, 40, 28), matPBR(silver, 0.7, 0.18)), silver);
  right.scale.set(1.0, 0.82, 0.92);
  right.position.x = 0.54;

  const core = tagBaseColor(new THREE.Mesh(new THREE.TorusKnotGeometry(0.48, 0.12, 160, 20), matPBR(cobalt, 0.45, 0.35)), cobalt);
  core.rotation.x = 0.6;
  core.rotation.y = 0.25;

  g.add(left, right, core);
  g.rotation.y = 0.25;
  return g;
}

function mergedGeometryFromObject(obj) {
  const geos = [];
  obj.updateMatrixWorld(true);

  obj.traverse((o) => {
    if (!o.isMesh) return;
    const g = o.geometry.clone();
    g.applyMatrix4(o.matrixWorld);
    geos.push(g);
  });

  const merged = BufferGeometryUtils.mergeGeometries(geos, false);
  return merged;
}

function samplePointsFromObject(obj, count) {
  const merged = mergedGeometryFromObject(obj);
  merged.computeVertexNormals();

  const tmpMesh = new THREE.Mesh(merged, new THREE.MeshBasicMaterial());
  const sampler = new MeshSurfaceSampler(tmpMesh).build();

  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  const p = new THREE.Vector3();
  const mix = new THREE.Color();

  for (let i = 0; i < count; i++) {
    sampler.sample(p);

    positions[i * 3 + 0] = p.x;
    positions[i * 3 + 1] = p.y;
    positions[i * 3 + 2] = p.z;

    const t = 0.15 + 0.85 * Math.random();
    mix.copy(silver).lerp(cobalt, t * t * 0.55);

    colors[i * 3 + 0] = mix.r;
    colors[i * 3 + 1] = mix.g;
    colors[i * 3 + 2] = mix.b;
  }

  merged.dispose();

  return { positions, colors };
}

const objects = [makeLaptop(), makeBoot(), makeBooks(), makePhone(), makeCup(), makeBrain()];

const POINTS_COUNT = 22000;

const pointTargets = objects.map((o) => samplePointsFromObject(o, POINTS_COUNT));

const geom = new THREE.BufferGeometry();
const posAttr = new THREE.BufferAttribute(new Float32Array(POINTS_COUNT * 3), 3);
const colAttr = new THREE.BufferAttribute(new Float32Array(POINTS_COUNT * 3), 3);

geom.setAttribute("position", posAttr);
geom.setAttribute("color", colAttr);

const pointsMat = new THREE.PointsMaterial({
  size: 0.028,
  vertexColors: true,
  transparent: true,
  opacity: 0.95,
  depthWrite: false
});

const points = new THREE.Points(geom, pointsMat);
group.add(points);

let currentIndex = 0;
let nextIndex = 1;

posAttr.array.set(pointTargets[currentIndex].positions);
colAttr.array.set(pointTargets[currentIndex].colors);
posAttr.needsUpdate = true;
colAttr.needsUpdate = true;

const startPositions = new Float32Array(POINTS_COUNT * 3);
const startColors = new Float32Array(POINTS_COUNT * 3);

const randDir = new Float32Array(POINTS_COUNT * 3);
const randPhase = new Float32Array(POINTS_COUNT);

for (let i = 0; i < POINTS_COUNT; i++) {
  let x = Math.random() * 2 - 1;
  let y = Math.random() * 2 - 1;
  let z = Math.random() * 2 - 1;
  const len = Math.max(1e-6, Math.sqrt(x * x + y * y + z * z));
  x /= len;
  y /= len;
  z /= len;

  randDir[i * 3 + 0] = x;
  randDir[i * 3 + 1] = y;
  randDir[i * 3 + 2] = z;
  randPhase[i] = Math.random() * Math.PI * 2;
}

function easeInOut(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

let morphT = 1;
let morphing = false;

function startMorph() {
  startPositions.set(posAttr.array);
  startColors.set(colAttr.array);

  nextIndex = (currentIndex + 1) % pointTargets.length;
  morphT = 0;
  morphing = true;
}

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

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function smoothstep01(t) {
  t = clamp01(t);
  return t * t * (3 - 2 * t);
}

function resize() {
  const w = mount.clientWidth;
  const h = mount.clientHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", resize);

const MORPH_SECONDS = 1.6;
const SWITCH_MS = 4200;

setInterval(() => startMorph(), SWITCH_MS);

let last = performance.now();
let time = 0;

function tick(now) {
  requestAnimationFrame(tick);

  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  time += dt;

  updateMouseTarget();

  group.position.lerp(new THREE.Vector3(target.x * 0.12, target.y * 0.12, 0), 0.08);

  group.rotation.y += 0.006;
  group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, mouse.y * 0.18, 0.06);
  group.rotation.z = THREE.MathUtils.lerp(group.rotation.z, -mouse.x * 0.1, 0.06);

  const center = group.position;
  const dx = target.x - center.x;
  const dy = target.y - center.y;
  const d = Math.sqrt(dx * dx + dy * dy);

  const near = 0.0;
  const far = 2.2;
  const proximity = 1 - smoothstep01((d - near) / (far - near));

  const scatterAmp = 0.65 * proximity;

  if (morphing) {
    morphT += dt / MORPH_SECONDS;
    const t = easeInOut(clamp01(morphT));

    const toPos = pointTargets[nextIndex].positions;
    const toCol = pointTargets[nextIndex].colors;

    const a = posAttr.array;
    const c = colAttr.array;

    for (let i = 0; i < POINTS_COUNT; i++) {
      const ix = i * 3;

      const bx = startPositions[ix + 0] + (toPos[ix + 0] - startPositions[ix + 0]) * t;
      const by = startPositions[ix + 1] + (toPos[ix + 1] - startPositions[ix + 1]) * t;
      const bz = startPositions[ix + 2] + (toPos[ix + 2] - startPositions[ix + 2]) * t;

      const wob = 0.5 + 0.5 * Math.sin(time * 5 + randPhase[i]);
      const s = scatterAmp * wob;

      a[ix + 0] = bx + randDir[ix + 0] * s;
      a[ix + 1] = by + randDir[ix + 1] * s;
      a[ix + 2] = bz + randDir[ix + 2] * s;

      c[ix + 0] = startColors[ix + 0] + (toCol[ix + 0] - startColors[ix + 0]) * t;
      c[ix + 1] = startColors[ix + 1] + (toCol[ix + 1] - startColors[ix + 1]) * t;
      c[ix + 2] = startColors[ix + 2] + (toCol[ix + 2] - startColors[ix + 2]) * t;
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;

    if (morphT >= 1) {
      morphing = false;
      currentIndex = nextIndex;
    }
  } else {
    const a = posAttr.array;
    for (let i = 0; i < POINTS_COUNT; i++) {
      const ix = i * 3;

      const wob = 0.5 + 0.5 * Math.sin(time * 5 + randPhase[i]);
      const s = scatterAmp * wob;

      const baseX = pointTargets[currentIndex].positions[ix + 0];
      const baseY = pointTargets[currentIndex].positions[ix + 1];
      const baseZ = pointTargets[currentIndex].positions[ix + 2];

      a[ix + 0] = baseX + randDir[ix + 0] * s;
      a[ix + 1] = baseY + randDir[ix + 1] * s;
      a[ix + 2] = baseZ + randDir[ix + 2] * s;
    }
    posAttr.needsUpdate = true;
  }

  renderer.render(scene, camera);
}

tick(last);
