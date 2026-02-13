import * as THREE from "https://unpkg.com/three@0.152.2/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.152.2/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "https://unpkg.com/three@0.152.2/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://unpkg.com/three@0.152.2/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "https://unpkg.com/three@0.152.2/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "https://unpkg.com/three@0.152.2/examples/jsm/postprocessing/UnrealBloomPass.js";
import { AsciiEffect } from "https://unpkg.com/three@0.152.2/examples/jsm/effects/AsciiEffect.js";

const mount = document.getElementById("stage");

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(mount.clientWidth, mount.clientHeight);
renderer.setClearColor(0x000000, 0);
mount.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 200);
camera.position.set(0, 1.2, 7);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.enableZoom = false;

scene.add(new THREE.AmbientLight(0xffffff, 0.35));
const key = new THREE.DirectionalLight(0xffffff, 1.1);
key.position.set(3, 6, 4);
scene.add(key);
const fill = new THREE.DirectionalLight(0xffffff, 0.5);
fill.position.set(-4, 2, 2);
scene.add(fill);

const group = new THREE.Group();
scene.add(group);

const accentBlue = new THREE.Color(0x1E5BEF);
const slateDark = new THREE.Color(0x374151);

function matStandard(color, rough = 0.6, metal = 0.1) {
  return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
}
function matToon(color) {
  return new THREE.MeshToonMaterial({ color });
}

function makeLaptop() {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.12, 1.5), matStandard(slateDark, 0.7, 0.2));
  base.position.y = -0.25;

  const screen = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.35, 0.08), matStandard(new THREE.Color(0x111827), 0.4, 0.05));
  screen.position.set(0, 0.55, -0.7);
  screen.rotation.x = -0.25;

  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.9, 1.1),
    new THREE.MeshBasicMaterial({ color: accentBlue, transparent: true, opacity: 0.35 })
  );
  glow.position.set(0, 0.55, -0.65);
  glow.rotation.x = -0.25;

  const trackpad = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.02, 0.5), matStandard(new THREE.Color(0x6B7280), 0.9, 0.0));
  trackpad.position.set(0, -0.18, 0.2);

  g.add(base, screen, glow, trackpad);
  return g;
}

function makeBooks() {
  const g = new THREE.Group();
  const b1 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.25, 1.1), matStandard(new THREE.Color(0x111827), 0.8, 0.1));
  const b2 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.22, 1.1), matStandard(new THREE.Color(0x334155), 0.8, 0.1));
  const b3 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.28, 1.1), matStandard(new THREE.Color(0x0B1220), 0.8, 0.1));
  b2.position.y = 0.24;
  b3.position.y = 0.48;

  const spine = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.78, 1.1), matStandard(accentBlue, 0.5, 0.2));
  spine.position.set(-0.75, 0.24, 0);

  g.add(b1, b2, b3, spine);
  g.rotation.y = 0.35;
  return g;
}

function makePhone() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.1, 0.12), matStandard(new THREE.Color(0x0B1220), 0.4, 0.2));
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 1.85), new THREE.MeshBasicMaterial({ color: accentBlue, transparent: true, opacity: 0.25 }));
  screen.position.z = 0.07;

  const cam = new THREE.Mesh(new THREE.CircleGeometry(0.08, 24), matStandard(new THREE.Color(0x111827), 0.2, 0.6));
  cam.position.set(0.32, 0.82, 0.07);

  g.add(body, screen, cam);
  g.rotation.y = -0.25;
  return g;
}

function makeCowboyBoot() {
  const g = new THREE.Group();
  const sole = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.18, 0.8), matStandard(new THREE.Color(0x111827), 0.9, 0.0));
  sole.position.y = -0.6;

  const foot = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.55, 0.75), matStandard(new THREE.Color(0x1F2937), 0.8, 0.1));
  foot.position.set(-0.1, -0.25, 0);

  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.55, 1.25, 24), matStandard(new THREE.Color(0x334155), 0.75, 0.1));
  shaft.position.set(-0.35, 0.55, 0);

  const stitch = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.02, 8, 48), matStandard(accentBlue, 0.6, 0.2));
  stitch.position.set(-0.35, 0.55, 0);
  stitch.rotation.x = Math.PI / 2;

  const heel = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.7), matStandard(new THREE.Color(0x0B1220), 0.9, 0.0));
  heel.position.set(0.6, -0.45, 0);

  g.add(sole, foot, shaft, stitch, heel);
  g.rotation.y = 0.6;
  return g;
}

function makeCoffeeCup() {
  const g = new THREE.Group();
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.55, 1.2, 32), matStandard(new THREE.Color(0xE5E7EB), 0.7, 0.0));
  const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.52, 0.5, 32), matStandard(new THREE.Color(0x374151), 0.9, 0.0));
  sleeve.position.y = -0.05;

  const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.68, 0.18, 32), matStandard(new THREE.Color(0x111827), 0.7, 0.1));
  lid.position.y = 0.68;

  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.06, 10, 40), matStandard(new THREE.Color(0xE5E7EB), 0.7, 0.0));
  handle.position.set(0.62, 0.1, 0);
  handle.rotation.y = Math.PI / 2;

  const logo = new THREE.Mesh(new THREE.CircleGeometry(0.18, 32), new THREE.MeshBasicMaterial({ color: accentBlue, transparent: true, opacity: 0.7 }));
  logo.position.set(0, -0.05, 0.56);

  g.add(cup, sleeve, lid, handle, logo);
  return g;
}

function makeZine() {
  const g = new THREE.Group();
  const coverL = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.1, 0.08), matStandard(new THREE.Color(0x111827), 0.8, 0.1));
  const coverR = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.1, 0.08), matStandard(new THREE.Color(0x0B1220), 0.8, 0.1));
  coverL.position.x = -0.82;
  coverR.position.x = 0.82;
  coverL.rotation.y = 0.22;
  coverR.rotation.y = -0.22;

  const spine = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.15, 0.18), matStandard(accentBlue, 0.5, 0.2));
  spine.position.z = -0.02;

  const sticker = new THREE.Mesh(new THREE.CircleGeometry(0.22, 36), new THREE.MeshBasicMaterial({ color: accentBlue, transparent: true, opacity: 0.6 }));
  sticker.position.set(0.4, 0.6, 0.06);

  g.add(coverL, coverR, spine, sticker);
  g.rotation.y = 0.4;
  return g;
}

const objects = [makeLaptop(), makeCowboyBoot(), makeBooks(), makePhone(), makeCoffeeCup(), makeZine()];
let currentIndex = 0;
let current = objects[currentIndex];
group.add(current);

function swapObject() {
  group.remove(current);
  currentIndex = (currentIndex + 1) % objects.length;
  current = objects[currentIndex];
  group.add(current);
}

function traverseMeshes(root, fn) {
  root.traverse((o) => { if (o.isMesh) fn(o); });
}

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(new THREE.Vector2(mount.clientWidth, mount.clientHeight), 0.6, 0.55, 0.85);
bloomPass.enabled = false;
composer.addPass(bloomPass);

const PixelateShader = {
  uniforms: {
    tDiffuse: { value: null },
    resolution: { value: new THREE.Vector2(mount.clientWidth, mount.clientHeight) },
    pixelSize: { value: 6.0 }
  },
  vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 resolution;
    uniform float pixelSize;
    varying vec2 vUv;
    void main(){
      vec2 dxy = pixelSize / resolution;
      vec2 coord = dxy * floor(vUv / dxy);
      gl_FragColor = texture2D(tDiffuse, coord);
    }`
};
const pixelPass = new ShaderPass(PixelateShader);
pixelPass.enabled = false;
composer.addPass(pixelPass);

const asciiEffect = new AsciiEffect(renderer, " .:-=+*#%@", { invert: true });
asciiEffect.domElement.style.color = "inherit";
asciiEffect.domElement.style.backgroundColor = "transparent";
asciiEffect.domElement.style.position = "absolute";
asciiEffect.domElement.style.inset = "0";
asciiEffect.domElement.style.pointerEvents = "none";
asciiEffect.domElement.style.display = "none";
mount.appendChild(asciiEffect.domElement);

function asciiEnabled(v) {
  asciiEffect.enabled = v;
  asciiEffect.domElement.style.display = v ? "block" : "none";
}
function pixelEnabled(v) { pixelPass.enabled = v; }
function bloomEnabled(v) { bloomPass.enabled = v; }

let burst = null;
let burstOn = false;

function makeBurstFromCurrent() {
  const pts = [];
  const cols = [];
  const tmp = new THREE.Vector3();

  traverseMeshes(current, (m) => {
    const geo = m.geometry.clone();
    geo.applyMatrix4(m.matrixWorld);
    const pos = geo.getAttribute("position");
    for (let i = 0; i < pos.count; i += 3) {
      tmp.fromBufferAttribute(pos, i);
      pts.push(tmp.x, tmp.y, tmp.z);
      cols.push(0.12, 0.36, 0.94);
    }
  });

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));

  const m = new THREE.PointsMaterial({ size: 0.03, vertexColors: true, transparent: true, opacity: 0.95 });
  const p = new THREE.Points(g, m);

  const vel = new Float32Array((pts.length / 3) * 3);
  for (let i = 0; i < vel.length; i += 3) {
    vel[i] = (Math.random() - 0.5) * 0.02;
    vel[i + 1] = (Math.random() - 0.5) * 0.02;
    vel[i + 2] = (Math.random() - 0.5) * 0.02;
  }
  p.userData.vel = vel;
  return p;
}

function burstEnabled(v) {
  if (v === burstOn) return;
  burstOn = v;

  if (v) {
    burst = makeBurstFromCurrent();
    scene.add(burst);
    current.visible = false;
  } else {
    if (burst) scene.remove(burst);
    burst = null;
    current.visible = true;
  }
}

let styleIndex = 0;

function applyStyle() {
  const s = styleIndex % 6;

  traverseMeshes(current, (m) => {
    const c = m.material?.color ? m.material.color : slateDark;
    m.material = matStandard(c, 0.65, 0.15);
    m.material.wireframe = false;
  });

  asciiEnabled(false);
  pixelEnabled(false);
  burstEnabled(false);
  bloomEnabled(false);

  if (s === 0) return;

  if (s === 1) {
    traverseMeshes(current, (m) => {
      m.material = matStandard(m.material.color || slateDark, 0.25, 0.6);
      m.material.wireframe = true;
    });
    return;
  }

  if (s === 2) {
    traverseMeshes(current, (m) => { m.material = matToon(m.material.color || slateDark); });
    return;
  }

  if (s === 3) {
    pixelEnabled(true);
    return;
  }

  if (s === 4) {
    asciiEnabled(true);
    return;
  }

  if (s === 5) {
    burstEnabled(true);
    bloomEnabled(true);
  }
}

applyStyle();

const mouse = new THREE.Vector2(0, 0);
const target = new THREE.Vector3(0, 0, 0);
const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const ray = new THREE.Raycaster();

mount.addEventListener("mousemove", (e) => {
  const r = mount.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width;
  const y = (e.clientY - r.top) / r.height;
  mouse.x = x * 2 - 1;
  mouse.y = -(y * 2 - 1);
}, { passive: true });

function updateMouseTarget() {
  ray.setFromCamera(mouse, camera);
  ray.ray.intersectPlane(plane, target);
}

function nextScene() {
  swapObject();
  styleIndex = (styleIndex + 1) % 6;
  applyStyle();
  if (burstOn) { burstEnabled(false); burstEnabled(true); }
}

const changeEveryMs = 4500;
setInterval(nextScene, changeEveryMs);

function resize() {
  const w = mount.clientWidth;
  const h = mount.clientHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  composer.setSize(w, h);
  pixelPass.uniforms.resolution.value.set(w, h);
  asciiEffect.setSize(w, h);
}
window.addEventListener("resize", resize);

let t = 0;
function tick() {
  requestAnimationFrame(tick);
  controls.update();

  t += 0.01;
  updateMouseTarget();

  group.position.lerp(new THREE.Vector3(target.x * 0.12, target.y * 0.12, 0), 0.08);
  group.rotation.y += 0.01;
  group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, mouse.y * 0.25, 0.06);
  group.rotation.z = THREE.MathUtils.lerp(group.rotation.z, -mouse.x * 0.15, 0.06);

  if (burst) {
    burst.rotation.y += 0.01;
    const pos = burst.geometry.getAttribute("position");
    const vel = burst.userData.vel;
    for (let i = 0; i < pos.count; i++) {
      const ix = i * 3;
      pos.array[ix] += vel[ix];
      pos.array[ix + 1] += vel[ix + 1] + Math.sin(t + i * 0.01) * 0.0002;
      pos.array[ix + 2] += vel[ix + 2];
    }
    pos.needsUpdate = true;
    burst.material.opacity = 0.75 + 0.2 * Math.sin(t * 2.0);
  }

  if (asciiEffect.enabled) asciiEffect.render(scene, camera);
  else composer.render();
}
tick();
