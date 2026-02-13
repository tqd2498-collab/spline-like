// /src/three-particle-scatter.js
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js";
import { RoundedBoxGeometry } from "https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/geometries/RoundedBoxGeometry.js";
import { MeshSurfaceSampler } from "https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/math/MeshSurfaceSampler.js";

const mount = document.getElementById("stage");

/* ----------------------------- renderer/scene ----------------------------- */
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(mount.clientWidth, mount.clientHeight);
renderer.setClearColor(0x000000, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;
mount.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  42,
  mount.clientWidth / mount.clientHeight,
  0.1,
  200
);
camera.position.set(0, 1.15, 7.6);

scene.add(new THREE.AmbientLight(0xffffff, 0.35));

const key = new THREE.DirectionalLight(0xffffff, 1.25);
key.position.set(6, 8, 5);
scene.add(key);

const rim = new THREE.DirectionalLight(0xffffff, 0.75);
rim.position.set(-7, 2, -3);
scene.add(rim);

const group = new THREE.Group();
scene.add(group);

/* --------------------------------- palette -------------------------------- */
const ink = new THREE.Color("#0F172A");
const slate = new THREE.Color("#334155");
const cobalt = new THREE.Color("#1E5BEF");
const paper = new THREE.Color("#E5E7EB");
const obsidian = new THREE.Color("#0B1220");
const charcoal = new THREE.Color("#111827");

function matPBR(color, rough = 0.55, metal = 0.15) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: rough,
    metalness: metal,
  });
}
function matGlass(color, opacity = 0.2) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.08,
    metalness: 0.0,
    transmission: 1.0,
    thickness: 0.9,
    transparent: true,
    opacity,
  });
}
function tagBaseColor(mesh, color) {
  mesh.userData.baseColor = color;
  return mesh;
}
function setAllMaterials(root, factory) {
  root.traverse((o) => {
    if (!o.isMesh) return;
    const c = o.userData.baseColor || ink;
    o.material = factory(c);
  });
}

/* --------------------------- more complex objects -------------------------- */
function makeGadgetCore() {
  const g = new THREE.Group();

  const shell = tagBaseColor(
    new THREE.Mesh(
      new RoundedBoxGeometry(2.3, 1.35, 1.1, 10, 0.14),
      matPBR(ink, 0.55, 0.22)
    ),
    ink
  );

  const glass = tagBaseColor(
    new THREE.Mesh(new RoundedBoxGeometry(2.12, 1.18, 0.06, 10, 0.14), matGlass(cobalt, 0.16)),
    cobalt
  );
  glass.position.z = 0.56;

  const ring = tagBaseColor(
    new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.08, 16, 80), matPBR(slate, 0.35, 0.55)),
    slate
  );
  ring.position.set(-0.72, 0.22, 0.56);
  ring.rotation.x = Math.PI / 2;

  const lens = tagBaseColor(
    new THREE.Mesh(new THREE.SphereGeometry(0.16, 32, 22), matPBR(obsidian, 0.22, 0.7)),
    obsidian
  );
  lens.position.set(-0.72, 0.22, 0.66);

  const vents = new THREE.Group();
  for (let i = 0; i < 8; i += 1) {
    const bar = tagBaseColor(
      new THREE.Mesh(new RoundedBoxGeometry(0.23, 0.03, 0.5, 6, 0.02), matPBR(charcoal, 0.85, 0.05)),
      charcoal
    );
    bar.position.set(0.55 + (i % 4) * 0.28, -0.36 + Math.floor(i / 4) * 0.13, -0.52);
    vents.add(bar);
  }

  const knob = tagBaseColor(
    new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.12, 48), matPBR(paper, 0.65, 0.05)),
    paper
  );
  knob.position.set(0.9, 0.52, -0.18);

  const knobCap = tagBaseColor(
    new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.06, 48), matPBR(cobalt, 0.35, 0.35)),
    cobalt
  );
  knobCap.position.set(0.9, 0.58, -0.18);

  g.add(shell, glass, ring, lens, vents, knob, knobCap);
  g.rotation.y = 0.45;
  return g;
}

function makeDeskTotem() {
  const g = new THREE.Group();

  const base = tagBaseColor(
    new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.25, 0.22, 64), matPBR(slate, 0.75, 0.18)),
    slate
  );
  base.position.y = -0.75;

  const column = tagBaseColor(
    new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.42, 1.7, 64), matPBR(ink, 0.65, 0.2)),
    ink
  );
  column.position.y = 0.1;

  const crown = tagBaseColor(
    new THREE.Mesh(new THREE.TorusKnotGeometry(0.62, 0.16, 220, 28), matPBR(cobalt, 0.35, 0.35)),
    cobalt
  );
  crown.position.y = 1.28;
  crown.rotation.set(0.55, 0.35, 0.1);

  const halo = tagBaseColor(
    new THREE.Mesh(new THREE.TorusGeometry(0.92, 0.05, 16, 120), matPBR(paper, 0.35, 0.02)),
    paper
  );
  halo.position.y = 1.22;
  halo.rotation.x = Math.PI / 2;

  const beads = new THREE.Group();
  for (let i = 0; i < 24; i += 1) {
    const a = (i / 24) * Math.PI * 2;
    const bead = tagBaseColor(
      new THREE.Mesh(new THREE.SphereGeometry(0.06, 18, 12), matPBR(charcoal, 0.5, 0.12)),
      charcoal
    );
    bead.position.set(Math.cos(a) * 0.92, 1.22 + Math.sin(a * 2) * 0.03, Math.sin(a) * 0.92);
    beads.add(bead);
  }

  g.add(base, column, crown, halo, beads);
  g.rotation.y = -0.35;
  return g;
}

function makeOrbRig() {
  const g = new THREE.Group();

  const orb = tagBaseColor(
    new THREE.Mesh(new THREE.IcosahedronGeometry(1.05, 3), matPBR(ink, 0.45, 0.22)),
    ink
  );

  const inner = tagBaseColor(
    new THREE.Mesh(new THREE.SphereGeometry(0.74, 48, 30), matGlass(cobalt, 0.13)),
    cobalt
  );

  const bands = new THREE.Group();
  for (let i = 0; i < 3; i += 1) {
    const t = tagBaseColor(
      new THREE.Mesh(new THREE.TorusGeometry(1.08, 0.045, 14, 140), matPBR(paper, 0.45, 0.05)),
      paper
    );
    t.rotation.set(i * 0.9, i * 0.55, i * 0.3);
    bands.add(t);
  }

  const pins = new THREE.Group();
  for (let i = 0; i < 36; i += 1) {
    const a = (i / 36) * Math.PI * 2;
    const pin = tagBaseColor(
      new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.22, 24), matPBR(slate, 0.7, 0.2)),
      slate
    );
    pin.position.set(Math.cos(a) * 1.06, Math.sin(a * 3) * 0.12, Math.sin(a) * 1.06);
    pin.lookAt(0, 0, 0);
    pins.add(pin);
  }

  g.add(orb, inner, bands, pins);
  g.rotation.y = 0.25;
  return g;
}

const objects = [makeGadgetCore(), makeDeskTotem(), makeOrbRig()];

/* ------------------------ particles: mesh -> points ------------------------ */
function collectMeshes(root) {
  const meshes = [];
  root.updateMatrixWorld(true);
  root.traverse((o) => {
    if (!o.isMesh) return;
    meshes.push(o);
  });
  return meshes;
}

function allocateCounts(meshes, totalCount) {
  const weights = meshes.map((m) => {
    const pos = m.geometry?.attributes?.position?.count ?? 0;
    return Math.max(1, pos);
  });
  const sum = weights.reduce((a, b) => a + b, 0);

  let remaining = totalCount;
  const counts = weights.map((w, i) => {
    const c = i === weights.length - 1 ? remaining : Math.max(64, Math.floor((w / sum) * totalCount));
    remaining -= c;
    return c;
  });
  return counts;
}

function makeParticleSystemFromObject(root, totalCount = 14000) {
  const meshes = collectMeshes(root);
  const counts = allocateCounts(meshes, totalCount);

  const positions = new Float32Array(totalCount * 3);
  const normals = new Float32Array(totalCount * 3);
  const rand = new Float32Array(totalCount * 3);
  const seeds = new Float32Array(totalCount);
  const colors = new Float32Array(totalCount * 3);

  const p = new THREE.Vector3();
  const n = new THREE.Vector3();
  const r = new THREE.Vector3();
  const tmpColor = new THREE.Color();

  let cursor = 0;

  for (let mi = 0; mi < meshes.length; mi += 1) {
    const mesh = meshes[mi];
    const sampler = new MeshSurfaceSampler(mesh).build();
    const baseColor = mesh.userData.baseColor || ink;

    for (let i = 0; i < counts[mi]; i += 1) {
      sampler.sample(p, n);

      // already in world space? sampler samples in local; convert -> world
      p.applyMatrix4(mesh.matrixWorld);
      n.transformDirection(mesh.matrixWorld);

      const idx = cursor * 3;

      positions[idx + 0] = p.x;
      positions[idx + 1] = p.y;
      positions[idx + 2] = p.z;

      normals[idx + 0] = n.x;
      normals[idx + 1] = n.y;
      normals[idx + 2] = n.z;

      // random "scatter direction" biased by normal + noise
      r.set(
        (Math.random() * 2 - 1) * 0.85,
        (Math.random() * 2 - 1) * 0.85,
        (Math.random() * 2 - 1) * 0.85
      )
        .addScaledVector(n, 0.9)
        .normalize()
        .multiplyScalar(0.5 + Math.random() * 1.6);

      rand[idx + 0] = r.x;
      rand[idx + 1] = r.y;
      rand[idx + 2] = r.z;

      seeds[cursor] = Math.random() * 1000;

      tmpColor.copy(baseColor).lerp(paper, Math.random() * 0.15);
      colors[idx + 0] = tmpColor.r;
      colors[idx + 1] = tmpColor.g;
      colors[idx + 2] = tmpColor.b;

      cursor += 1;
      if (cursor >= totalCount) break;
    }
    if (cursor >= totalCount) break;
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geom.setAttribute("aNormal", new THREE.BufferAttribute(normals, 3));
  geom.setAttribute("aRand", new THREE.BufferAttribute(rand, 3));
  geom.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  geom.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector3(0, 0, 0) },
      uScatter: { value: 1.55 },
      uMinDist: { value: 0.25 },
      uMaxDist: { value: 2.35 },
      uPointSize: { value: 2.2 }, // in pixels-ish (scaled in shader)
      uAlpha: { value: 0.9 },
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uMouse;
      uniform float uScatter;
      uniform float uMinDist;
      uniform float uMaxDist;
      uniform float uPointSize;

      attribute vec3 aNormal;
      attribute vec3 aRand;
      attribute float aSeed;
      attribute vec3 aColor;

      varying vec3 vColor;
      varying float vAlpha;

      float saturate(float x){ return clamp(x, 0.0, 1.0); }

      void main() {
        vColor = aColor;

        vec3 base = position;

        float d = length(base - uMouse);
        float influence = 1.0 - smoothstep(uMinDist, uMaxDist, d);
        influence = influence * influence;

        // micro swirl (keeps it feeling "particle-y" even when not scattered)
        float t = uTime * 0.9 + aSeed;
        vec3 swirl = vec3(
          sin(t * 1.3) * 0.08,
          cos(t * 1.1) * 0.08,
          sin(t * 0.9) * 0.08
        );

        // scatter pushes along random dir + a bit along normal
        vec3 scatterDir = normalize(aRand + aNormal * 0.65);

        float scatterAmt = influence * uScatter;
        vec3 scattered = base + scatterDir * (scatterAmt * 1.35) + swirl * (0.8 + influence * 2.0);

        // subtle "breathing" outward even when far
        vec3 idle = base + aNormal * (0.03 * sin(uTime * 1.2 + aSeed));

        vec3 finalPos = mix(idle, scattered, influence);

        vec4 mv = modelViewMatrix * vec4(finalPos, 1.0);
        gl_Position = projectionMatrix * mv;

        // perspective-correct point size
        float size = uPointSize * (300.0 / -mv.z);
        gl_PointSize = clamp(size, 1.0, 18.0);

        // fade a bit as it scatters (prevents blowout)
        vAlpha = mix(1.0, 0.55, influence);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uAlpha;
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        // soft round sprite
        vec2 uv = gl_PointCoord.xy - 0.5;
        float r = length(uv);
        float a = smoothstep(0.5, 0.12, r);
        a *= uAlpha * vAlpha;

        // tiny core pop
        float core = smoothstep(0.18, 0.0, r) * 0.35;

        gl_FragColor = vec4(vColor + core, a);
      }
    `,
  });

  const points = new THREE.Points(geom, material);
  points.frustumCulled = false;

  return points;
}

function disposeObject3D(root) {
  root.traverse((o) => {
    if (!o.isMesh) return;
    o.geometry?.dispose?.();
    if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose?.());
    else o.material?.dispose?.();
  });
}

function disposePoints(points) {
  points.geometry?.dispose?.();
  points.material?.dispose?.();
}

/* ------------------------------- interaction ------------------------------- */
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

/* ------------------------------- state/swap -------------------------------- */
let objectIndex = 0;
let solidMode = false;

let currentSolid = objects[objectIndex];
group.add(currentSolid);

let currentParticles = makeParticleSystemFromObject(currentSolid, 16000);
scene.add(currentParticles);
currentSolid.visible = false;

function applyVisibility() {
  currentSolid.visible = solidMode;
  currentParticles.visible = !solidMode;
}

function swap() {
  // remove old
  group.remove(currentSolid);
  scene.remove(currentParticles);

  // dispose old particles (keep solid geometries reused if you want; here we keep)
  disposePoints(currentParticles);

  objectIndex = (objectIndex + 1) % objects.length;
  currentSolid = objects[objectIndex];
  group.add(currentSolid);

  currentParticles = makeParticleSystemFromObject(currentSolid, 16000);
  scene.add(currentParticles);

  currentSolid.visible = false;
  applyVisibility();
}

mount.addEventListener("click", swap, { passive: true });

window.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    solidMode = !solidMode;
    applyVisibility();
  }
  if (e.code === "KeyR") {
    // rebuild particles (handy while tuning)
    scene.remove(currentParticles);
    disposePoints(currentParticles);
    currentParticles = makeParticleSystemFromObject(currentSolid, 16000);
    scene.add(currentParticles);
    applyVisibility();
  }
});

applyVisibility();

/* ---------------------------------- resize --------------------------------- */
function resize() {
  const w = mount.clientWidth;
  const h = mount.clientHeight;

  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", resize);

/* ---------------------------------- loop ---------------------------------- */
let t = 0;

function tick() {
  requestAnimationFrame(tick);
  t += 0.01;

  updateMouseTarget();

  // gentle "hover" follow
  group.position.lerp(new THREE.Vector3(target.x * 0.1, target.y * 0.1, 0), 0.08);

  // slow showroom rotation
  group.rotation.y += 0.01;
  group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, mouse.y * 0.18, 0.06);
  group.rotation.z = THREE.MathUtils.lerp(group.rotation.z, -mouse.x * 0.12, 0.06);

  // keep particles aligned with group transforms by baking transform into shader uniforms:
  // simplest: just apply group transform to points (match group)
  currentParticles.position.copy(group.position);
  currentParticles.rotation.copy(group.rotation);

  // push mouse to shader in world coords
  currentParticles.material.uniforms.uTime.value = t;
  currentParticles.material.uniforms.uMouse.value.copy(target);

  // “closer => more scatter” is already distance-based in shader;
  // this global multiplier just sets overall intensity
  currentParticles.material.uniforms.uScatter.value = 1.65;

  renderer.render(scene, camera);
}
tick();

/* ------------------------------ optional cleanup ---------------------------- */
// If you ever fully destroy this scene, call:
// disposeObject3D(currentSolid); // if you created unique objects per swap
// disposePoints(currentParticles);
