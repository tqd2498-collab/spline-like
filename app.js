import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js";
import { RoundedBoxGeometry } from "https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/geometries/RoundedBoxGeometry.js";
import { EffectComposer } from "https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/postprocessing/ShaderPass.js";
import { DotScreenShader } from "https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/shaders/DotScreenShader.js";
import { SobelOperatorShader } from "https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/shaders/SobelOperatorShader.js";
import { AsciiEffect } from "https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/effects/AsciiEffect.js";

const mount = document.getElementById("stage");

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(mount.clientWidth, mount.clientHeight);
renderer.setClearColor(0x000000, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;
mount.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(42, mount.clientWidth / mount.clientHeight, 0.1, 150);
camera.position.set(0, 1.25, 7.2);

const key = new THREE.DirectionalLight(0xffffff, 1.2);
key.position.set(5, 7, 4);
scene.add(key);

const rim = new THREE.DirectionalLight(0xffffff, 0.8);
rim.position.set(-6, 3, -2);
scene.add(rim);

scene.add(new THREE.AmbientLight(0xffffff, 0.35));

const group = new THREE.Group();
scene.add(group);

const ink = new THREE.Color("#0F172A");
const slate = new THREE.Color("#334155");
const cobalt = new THREE.Color("#1E5BEF");
const paper = new THREE.Color("#E5E7EB");

function matPBR(color, rough = 0.55, metal = 0.15) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: rough,
    metalness: metal
  });
}

function matGlass(color, opacity = 0.22) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.08,
    metalness: 0.0,
    transmission: 1.0,
    thickness: 0.8,
    transparent: true,
    opacity
  });
}

function setAllMaterials(root, materialFactory) {
  root.traverse((o) => {
    if (!o.isMesh) return;
    const c = o.userData.baseColor || ink;
    o.material = materialFactory(c);
  });
}

function tagBaseColor(mesh, color) {
  mesh.userData.baseColor = color;
  return mesh;
}

function mergePositionsForPoints(root, step = 2) {
  const pts = [];
  const tmp = new THREE.Vector3();
  root.updateMatrixWorld(true);

  root.traverse((o) => {
    if (!o.isMesh) return;
    const geo = o.geometry.clone();
    geo.applyMatrix4(o.matrixWorld);
    const pos = geo.getAttribute("position");
    for (let i = 0; i < pos.count; i += step) {
      tmp.fromBufferAttribute(pos, i);
      pts.push(tmp.x, tmp.y, tmp.z);
    }
  });

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  return g;
}

function makeLaptop() {
  const g = new THREE.Group();

  const base = tagBaseColor(
    new THREE.Mesh(new RoundedBoxGeometry(2.45, 0.14, 1.6, 8, 0.06), matPBR(slate, 0.7, 0.2)),
    slate
  );
  base.position.y = -0.28;

  const hinge = tagBaseColor(
    new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.2, 24), matPBR(ink, 0.6, 0.35)),
    ink
  );
  hinge.rotation.z = Math.PI / 2;
  hinge.position.set(0, -0.18, -0.75);

  const screenBack = tagBaseColor(
    new THREE.Mesh(new RoundedBoxGeometry(2.45, 1.55, 0.09, 8, 0.06), matPBR(ink, 0.55, 0.15)),
    ink
  );
  screenBack.position.set(0, 0.62, -0.78);
  screenBack.rotation.x = -0.26;

  const screenGlass = tagBaseColor(
    new THREE.Mesh(new THREE.PlaneGeometry(2.15, 1.25), matGlass(cobalt, 0.18)),
    cobalt
  );
  screenGlass.position.set(0, 0.62, -0.72);
  screenGlass.rotation.x = -0.26;

  const trackpad = tagBaseColor(
    new THREE.Mesh(new RoundedBoxGeometry(0.72, 0.03, 0.5, 8, 0.05), matPBR(paper, 0.95, 0.0)),
    paper
  );
  trackpad.position.set(0, -0.18, 0.24);

  g.add(base, hinge, screenBack, screenGlass, trackpad);
  g.rotation.y = 0.28;
  return g;
}

function makeBooks() {
  const g = new THREE.Group();

  const b1 = tagBaseColor(new THREE.Mesh(new RoundedBoxGeometry(1.8, 0.28, 1.2, 8, 0.06), matPBR(ink, 0.85, 0.1)), ink);
  const b2 = tagBaseColor(new THREE.Mesh(new RoundedBoxGeometry(1.8, 0.24, 1.2, 8, 0.06), matPBR(slate, 0.85, 0.1)), slate);
  const b3 = tagBaseColor(new THREE.Mesh(new RoundedBoxGeometry(1.8, 0.3, 1.2, 8, 0.06), matPBR(new THREE.Color("#111827"), 0.85, 0.1)), new THREE.Color("#111827"));

  b2.position.y = 0.27;
  b3.position.y = 0.52;

  const band = tagBaseColor(
    new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.86, 1.2), matPBR(cobalt, 0.6, 0.2)),
    cobalt
  );
  band.position.set(-0.86, 0.26, 0);

  g.add(b1, b2, b3, band);
  g.rotation.y = -0.28;
  return g;
}

function makePhone() {
  const g = new THREE.Group();

  const body = tagBaseColor(new THREE.Mesh(new RoundedBoxGeometry(1.12, 2.15, 0.15, 10, 0.12), matPBR(ink, 0.55, 0.25)), ink);

  const glass = tagBaseColor(new THREE.Mesh(new THREE.PlaneGeometry(0.92, 1.85), matGlass(cobalt, 0.16)), cobalt);
  glass.position.z = 0.09;

  const camPlate = tagBaseColor(new THREE.Mesh(new RoundedBoxGeometry(0.55, 0.55, 0.08, 8, 0.08), matPBR(slate, 0.6, 0.3)), slate);
  camPlate.position.set(0.25, 0.72, 0.06);

  const cam = tagBaseColor(new THREE.Mesh(new THREE.CircleGeometry(0.09, 28), matPBR(new THREE.Color("#0B1220"), 0.25, 0.6)), new THREE.Color("#0B1220"));
  cam.position.set(0.25, 0.72, 0.11);

  g.add(body, glass, camPlate, cam);
  g.rotation.y = 0.22;
  return g;
}

function makeBoot() {
  const g = new THREE.Group();

  const sole = tagBaseColor(new THREE.Mesh(new RoundedBoxGeometry(1.7, 0.2, 0.9, 8, 0.06), matPBR(new THREE.Color("#111827"), 0.95, 0.0)), new THREE.Color("#111827"));
  sole.position.y = -0.62;

  const foot = tagBaseColor(new THREE.Mesh(new RoundedBoxGeometry(1.28, 0.62, 0.84, 10, 0.12), matPBR(slate, 0.85, 0.1)), slate);
  foot.position.set(-0.08, -0.26, 0);

  const shaft = tagBaseColor(new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.62, 1.32, 32), matPBR(ink, 0.8, 0.12)), ink);
  shaft.position.set(-0.35, 0.6, 0);

  const stitch = tagBaseColor(new THREE.Mesh(new THREE.TorusGeometry(0.54, 0.022, 10, 70), matPBR(cobalt, 0.55, 0.2)), cobalt);
  stitch.position.set(-0.35, 0.6, 0);
  stitch.rotation.x = Math.PI / 2;

  const heel = tagBaseColor(new THREE.Mesh(new RoundedBoxGeometry(0.38, 0.42, 0.78, 8, 0.06), matPBR(new THREE.Color("#0B1220"), 0.95, 0.0)), new THREE.Color("#0B1220"));
  heel.position.set(0.64, -0.45, 0);

  g.add(sole, foot, shaft, stitch, heel);
  g.rotation.y = 0.55;
  return g;
}

function makeCup() {
  const g = new THREE.Group();

  const cup = tagBaseColor(new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.6, 1.26, 44), matPBR(paper, 0.75, 0.0)), paper);

  const sleeve = tagBaseColor(new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.56, 0.52, 44), matPBR(slate, 0.95, 0.0)), slate);
  sleeve.position.y = -0.05;

  const lid = tagBaseColor(new THREE.Mesh(new THREE.CylinderGeometry(0.74, 0.74, 0.18, 44), matPBR(ink, 0.75, 0.1)), ink);
  lid.position.y = 0.72;

  const handle = tagBaseColor(new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.06, 12, 56), matPBR(paper, 0.75, 0.0)), paper);
  handle.position.set(0.68, 0.1, 0);
  handle.rotation.y = Math.PI / 2;

  const logo = new THREE.Mesh(
    new THREE.CircleGeometry(0.19, 36),
    new THREE.MeshBasicMaterial({ color: cobalt, transparent: true, opacity: 0.55 })
  );
  logo.position.set(0, -0.05, 0.62);

  g.add(cup, sleeve, lid, handle, logo);
  g.rotation.y = -0.18;
  return g;
}

function makeBrain() {
  const g = new THREE.Group();

  const left = tagBaseColor(new THREE.Mesh(new THREE.SphereGeometry(0.92, 36, 26), matPBR(ink, 0.65, 0.15)), ink);
  left.scale.set(1.0, 0.82, 0.92);
  left.position.x = -0.52;

  const right = tagBaseColor(new THREE.Mesh(new THREE.SphereGeometry(0.92, 36, 26), matPBR(ink, 0.65, 0.15)), ink);
  right.scale.set(1.0, 0.82, 0.92);
  right.position.x = 0.52;

  const core = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.45, 0.12, 140, 18),
    matPBR(cobalt, 0.35, 0.25)
  );
  core.rotation.x = 0.6;
  core.rotation.y = 0.25;

  g.add(left, right, core);
  g.rotation.y = 0.25;
  return g;
}

const objects = [makeLaptop(), makeBoot(), makeBooks(), makePhone(), makeCup(), makeBrain()];

const STYLE = {
  PBR: "PBR",
  ASCII: "ASCII",
  DOTS: "DOTS",
  WIREFRAME: "WIREFRAME",
  POINTS: "POINTS",
  SKETCH: "SKETCH"
};

const styleCycle = [
  STYLE.PBR,
  STYLE.ASCII,
  STYLE.DOTS,
  STYLE.WIREFRAME,
  STYLE.POINTS,
  STYLE.SKETCH
];

let currentIndex = 0;
let styleIndex = 0;

let current = objects[currentIndex];
group.add(current);

let pointsObj = null;

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const dotsPass = new ShaderPass(DotScreenShader);
dotsPass.enabled = false;
dotsPass.uniforms.scale.value = 2.2;

const sobelPass = new ShaderPass(SobelOperatorShader);
sobelPass.enabled = false;

composer.addPass(dotsPass);
composer.addPass(sobelPass);

const asciiEffect = new AsciiEffect(renderer, " .:-=+*#%@", { invert: true });
asciiEffect.domElement.style.position = "absolute";
asciiEffect.domElement.style.inset = "0";
asciiEffect.domElement.style.pointerEvents = "none";
asciiEffect.domElement.style.backgroundColor = "transparent";
asciiEffect.domElement.style.color = "#E5E7EB";
asciiEffect.domElement.style.opacity = "0.95";
asciiEffect.domElement.style.display = "none";
mount.appendChild(asciiEffect.domElement);

function setAscii(on) {
  asciiEffect.domElement.style.display = on ? "block" : "none";
  renderer.domElement.style.opacity = on ? "0" : "1";
}

function clearStyleSideEffects() {
  dotsPass.enabled = false;
  sobelPass.enabled = false;
  setAscii(false);

  if (pointsObj) {
    scene.remove(pointsObj);
    pointsObj.geometry.dispose();
    pointsObj.material.dispose();
    pointsObj = null;
    current.visible = true;
  }

  current.traverse((o) => {
    if (o.isMesh) {
      if (o.material && o.material.wireframe) o.material.wireframe = false;
    }
  });

  setAllMaterials(current, (c) => matPBR(c, 0.55, 0.15));
}

function applyStyle(style) {
  clearStyleSideEffects();

  if (style === STYLE.PBR) {
    return;
  }

  if (style === STYLE.ASCII) {
    setAscii(true);
    return;
  }

  if (style === STYLE.DOTS) {
    dotsPass.enabled = true;
    return;
  }

  if (style === STYLE.WIREFRAME) {
    current.traverse((o) => {
      if (!o.isMesh) return;
      const c = o.userData.baseColor || ink;
      o.material = new THREE.MeshStandardMaterial({
        color: c,
        roughness: 0.35,
        metalness: 0.35,
        wireframe: true
      });
    });
    return;
  }

  if (style === STYLE.POINTS) {
    const g = mergePositionsForPoints(current, 2);
    const m = new THREE.PointsMaterial({
      size: 0.03,
      color: 0xE5E7EB,
      transparent: true,
      opacity: 0.92
    });
    pointsObj = new THREE.Points(g, m);
    scene.add(pointsObj);
    current.visible = false;
    return;
  }

  if (style === STYLE.SKETCH) {
    sobelPass.enabled = true;
    const w = mount.clientWidth;
    const h = mount.clientHeight;
    sobelPass.uniforms.resolution.value.set(w, h);
    return;
  }
}

function swapObject() {
  group.remove(current);
  currentIndex = (currentIndex + 1) % objects.length;
  current = objects[currentIndex];
  group.add(current);

  applyStyle(styleCycle[styleIndex]);

  if (pointsObj) {
    pointsObj.position.copy(group.position);
    pointsObj.rotation.copy(group.rotation);
  }
}

function nextStyle() {
  styleIndex = (styleIndex + 1) % styleCycle.length;
  applyStyle(styleCycle[styleIndex]);
}

applyStyle(styleCycle[styleIndex]);

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

const changeEveryMs = 4200;
setInterval(() => {
  nextStyle();
  swapObject();
}, changeEveryMs);

function resize() {
  const w = mount.clientWidth;
  const h = mount.clientHeight;

  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();

  composer.setSize(w, h);

  sobelPass.uniforms.resolution.value.set(w, h);
  asciiEffect.setSize(w, h);
}
window.addEventListener("resize", resize);

let t = 0;
function tick() {
  requestAnimationFrame(tick);
  t += 0.01;

  updateMouseTarget();

  group.position.lerp(new THREE.Vector3(target.x * 0.12, target.y * 0.12, 0), 0.08);

  group.rotation.y += 0.01;
  group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, mouse.y * 0.22, 0.06);
  group.rotation.z = THREE.MathUtils.lerp(group.rotation.z, -mouse.x * 0.12, 0.06);

  if (pointsObj) {
    pointsObj.position.copy(group.position);
    pointsObj.rotation.copy(group.rotation);
    pointsObj.rotation.y += 0.005;
  }

  const style = styleCycle[styleIndex];

  if (style === STYLE.ASCII) {
    asciiEffect.render(scene, camera);
  } else {
    composer.render();
  }
}
tick();
