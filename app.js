// /app.js
// Self-debugging Three.js GitHub Pages build:
// - Shows an on-screen error overlay (no DevTools needed)
// - Renders a cube first (proves WebGL + canvas + render loop)
// - Then swaps to particle-scatter objects

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js";
import { RoundedBoxGeometry } from "https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/geometries/RoundedBoxGeometry.js";
import { MeshSurfaceSampler } from "https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/math/MeshSurfaceSampler.js";

function makeOverlay() {
  const el = document.createElement("pre");
  el.style.cssText = [
    "position:fixed",
    "left:12px",
    "top:12px",
    "max-width:min(720px, calc(100vw - 24px))",
    "max-height:calc(100vh - 24px)",
    "overflow:auto",
    "padding:10px 12px",
    "margin:0",
    "z-index:999999",
    "background:rgba(10,10,12,0.88)",
    "color:#e5e7eb",
    "border:1px solid rgba(229,231,235,0.22)",
    "border-radius:10px",
    "font:12px/1.35 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    "white-space:pre-wrap",
    "pointer-events:none",
  ].join(";");
  document.body.appendChild(el);
  return el;
}

const overlay = makeOverlay();

function logOverlay(msg) {
  overlay.textContent = `${msg}\n\n${overlay.textContent}`.slice(0, 8000);
}

window.addEventListener("error", (e) => {
  logOverlay(`❌ window.error: ${e.message}\n${e.filename || ""}:${e.lineno || ""}:${e.colno || ""}`);
});
window.addEventListener("unhandledrejection", (e) => {
  logOverlay(`❌ unhandledrejection: ${String(e.reason)}`);
});

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function getStageSize(stage) {
  const w = stage.clientWidth;
  const h = stage.clientHeight;
  return { w, h };
}

function canWebGL() {
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl") || c.getContext("experimental-webgl");
    return !!gl;
  } catch {
    return false;
  }
}

function matPBR(color, rough = 0.55, metal = 0.15) {
  return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
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
    o.material = factory(o.userData.baseColor || new THREE.Color("#0F172A"));
  });
}

/* --------------------------- objects (complex) ---------------------------- */
const ink = new THREE.Color("#0F172A");
const slate = new THREE.Color("#334155");
const cobalt = new THREE.Color("#1E5BEF");
const paper = new THREE.Color("#E5E7EB");
const obsidian = new THREE.Color("#0B1220");
const charcoal = new THREE.Color("#111827");

function makeGadgetCore() {
  const g = new THREE.Group();

  const shell = tagBaseColor(
    new THREE.Mesh(new RoundedBoxGeometry(2.3, 1.35, 1.1, 10, 0.14), matPBR(ink, 0.55, 0.22)),
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

function makeOrbRig() {
  const g = new THREE.Group();

  const orb = tagBaseColor(
    new THREE.Mesh(new THREE.IcosahedronGeometry(1.05, 3), matPBR(ink, 0.45, 0.22)),
    ink
  );

  const inner = tagBaseColor(new THREE.Mesh(new THREE.SphereGeometry(0.74, 48, 30), matGlass(cobalt, 0.13)), cobalt);

  const bands = new THREE.Group();
  for (let i = 0; i < 3; i += 1) {
    const t = tagBaseColor(
      new THREE.Mesh(new THREE.TorusGeometry(1.08, 0.045, 14, 140), matPBR(paper, 0.45, 0.05)),
      paper
    );
    t.rotation.set(i * 0.9, i * 0.55, i * 0.3);
    bands.add(t);
  }

  g.add(orb, inner, bands);
  g.rotation.y = 0.25;
  return g;
}

const objects = [makeGadgetCore(), makeOrbRig()];

/* ------------------------------ particles ------------------------------ */
function collectMeshes(root) {
  const meshes = [];
  root.updateMatrixWorld(true);
  root.traverse((o) => o.isMesh && meshes.push(o));
  return meshes;
}

function makeParticles(root, count = 14000) {
  const meshes = collectMeshes(root);
  assert(meshes.length > 0, "No meshes found to sample for particles.");

  const positions = new Float32Array(count * 3);
  const normals = new Float32Array(count * 3);
  const rand = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const colors = new Float32Array(count * 3);

  const p = new THREE.Vector3();
  const n = new THREE.Vector3();
  const r = new THREE.Vector3();
  const col = new THREE.Color();

  let cursor = 0;
  while (cursor < count) {
    const mesh = meshes[cursor % meshes.length];
    const sampler = new MeshSurfaceSampler(mesh).build();
    const baseColor = mesh.userData.baseColor || ink;

    sampler.sample(p, n);

    const i3 = cursor * 3;
    positions[i3 + 0] = p.x;
    positions[i3 + 1] = p.y;
    positions[i3 + 2] = p.z;

    normals[i3 + 0] = n.x;
    normals[i3 + 1] = n.y;
    normals[i3 + 2] = n.z;

    r.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1)
      .addScaledVector(n, 0.9)
      .normalize()
      .multiplyScalar(0.5 + Math.random() * 1.6);

    rand[i3 + 0] = r.x;
    rand[i3 + 1] = r.y;
    rand[i3 + 2] = r.z;

    seeds[cursor] = Math.random() * 1000;

    col.copy(baseColor).lerp(paper, Math.random() * 0.15);
    colors[i3 + 0] = col.r;
    colors[i3 + 1] = col.g;
    colors[i3 + 2] = col.b;

    cursor += 1;
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geom.setAttribute("aNormal", new THREE.BufferAttribute(normals, 3));
  geom.setAttribute("aRand", new THREE.BufferAttribute(rand, 3));
  geom.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  geom.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uMouseLocal: { value: new THREE.Vector3() },
      uScatter: { value: 1.65 },
      uMinDist: { value: 0.25 },
      uMaxDist: { value: 2.35 },
      uPointSize: { value: 2.2 },
      uAlpha: { value: 0.9 },
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uMouseLocal;
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

      void main() {
        vColor = aColor;

        vec3 base = position;

        float d = length(base - uMouseLocal);
        float influence = 1.0 - smoothstep(uMinDist, uMaxDist, d);
        influence *= influence;

        float t = uTime * 0.9 + aSeed;
        vec3 swirl = vec3(
          sin(t * 1.3) * 0.08,
          cos(t * 1.1) * 0.08,
          sin(t * 0.9) * 0.08
        );

        vec3 scatterDir = normalize(aRand + aNormal * 0.65);
        vec3 scattered = base + scatterDir * (influence * uScatter * 1.35) + swirl * (0.8 + influence * 2.0);
        vec3 idle = base + aNormal * (0.03 * sin(uTime * 1.2 + aSeed));

        vec3 finalPos = mix(idle, scattered, influence);

        vec4 mv = modelViewMatrix * vec4(finalPos, 1.0);
        gl_Position = projectionMatrix * mv;

        float size = uPointSize * (300.0 / -mv.z);
        gl_PointSize = clamp(size, 1.0, 18.0);

        vAlpha = mix(1.0, 0.55, influence);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uAlpha;
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        vec2 uv = gl_PointCoord.xy - 0.5;
        float r = length(uv);
        float a = smoothstep(0.5, 0.12, r);
        a *= uAlpha * vAlpha;
        float core = smoothstep(0.18, 0.0, r) * 0.35;
        gl_FragColor = vec4(vColor + core, a);
      }
    `,
  });

  const pts = new THREE.Points(geom, mat);
  pts.frustumCulled = false;
  return pts;
}

function disposePoints(points) {
  points.geometry?.dispose?.();
  points.material?.dispose?.();
}

/* ------------------------------- bootstrap ------------------------------- */
(async function main() {
  try {
    logOverlay("✅ app.js loaded");

    assert(canWebGL(), "WebGL not available in this browser/device.");

    const stage = mount;
    const { w, h } = getStageSize(stage);
    logOverlay(`📐 stage size: ${w} x ${h}`);
    assert(w > 10 && h > 10, "Stage has near-zero size. Fix CSS: give #stage a real height.");

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 200);
    camera.position.set(0, 1.15, 7.6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    stage.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.35));
    const key = new THREE.DirectionalLight(0xffffff, 1.25);
    key.position.set(6, 8, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xffffff, 0.75);
    rim.position.set(-7, 2, -3);
    scene.add(rim);

    const group = new THREE.Group();
    scene.add(group);

    // SMOKE TEST CUBE (if you don't see this -> not a particle issue)
    const cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    cube.position.y = 0.2;
    group.add(cube);
    logOverlay("🧪 cube smoke test running (you should see a cube)");

    const mouseNDC = new THREE.Vector2(0, 0);
    const targetWorld = new THREE.Vector3(0, 0, 0);
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const ray = new THREE.Raycaster();

    stage.addEventListener(
      "mousemove",
      (e) => {
        const r = stage.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        mouseNDC.x = x * 2 - 1;
        mouseNDC.y = -(y * 2 - 1);
      },
      { passive: true }
    );

    function updateMouseTarget() {
      ray.setFromCamera(mouseNDC, camera);
      ray.ray.intersectPlane(plane, targetWorld);
    }

    function resize() {
      const nw = stage.clientWidth;
      const nh = stage.clientHeight;
      renderer.setSize(nw, nh);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      logOverlay(`🔁 resize: ${nw} x ${nh}`);
    }
    window.addEventListener("resize", resize);

    // After ~1s, swap to particle object (proves sampler/shaders are OK)
    let objectIndex = 0;
    let solidMode = false;
    let currentSolid = null;
    let currentParticles = null;

    function mountObject() {
      if (currentParticles) {
        group.remove(currentParticles);
        disposePoints(currentParticles);
      }
      if (currentSolid) group.remove(currentSolid);

      currentSolid = objects[objectIndex];
      group.add(currentSolid);
      setAllMaterials(currentSolid, (c) => matPBR(c, 0.55, 0.15));

      currentParticles = makeParticles(currentSolid, 14000);
      group.add(currentParticles);

      currentSolid.visible = false;
      currentParticles.visible = true;
      logOverlay(`✨ particles mounted: object #${objectIndex + 1}`);
    }

    stage.addEventListener(
      "click",
      () => {
        objectIndex = (objectIndex + 1) % objects.length;
        mountObject();
      },
      { passive: true }
    );

    window.addEventListener("keydown", (e) => {
      if (e.code === "Space") {
        solidMode = !solidMode;
        if (currentSolid) currentSolid.visible = solidMode;
        if (currentParticles) currentParticles.visible = !solidMode;
        logOverlay(`🎛 mode: ${solidMode ? "SOLID" : "PARTICLES"}`);
      }
    });

    setTimeout(() => {
      group.remove(cube);
      mountObject();
    }, 900);

    const mouseLocal = new THREE.Vector3();
    let t = 0;

    function tick() {
      requestAnimationFrame(tick);
      t += 0.01;

      updateMouseTarget();

      group.rotation.y += 0.01;
      group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, mouseNDC.y * 0.18, 0.06);
      group.rotation.z = THREE.MathUtils.lerp(group.rotation.z, -mouseNDC.x * 0.12, 0.06);

      if (currentParticles?.material?.uniforms) {
        group.worldToLocal(mouseLocal.copy(targetWorld));
        currentParticles.material.uniforms.uTime.value = t;
        currentParticles.material.uniforms.uMouseLocal.value.copy(mouseLocal);
      }

      renderer.render(scene, camera);
    }

    tick();
    logOverlay("✅ render loop started");
  } catch (err) {
    logOverlay(`❌ BOOT FAILED:\n${err?.stack || String(err)}`);
    throw err;
  }
})();
