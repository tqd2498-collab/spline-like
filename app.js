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
  return new THREE.Mes
