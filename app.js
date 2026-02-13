import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js";

const mount = document.getElementById("stage");

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(mount.clientWidth, mount.clientHeight);
renderer.setClearColor(0x000000, 0);
mount.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, mount.clientWidth / mount.clientHeight, 0.1, 100);
camera.position.z = 3;

scene.add(new THREE.AmbientLight(0xffffff, 1.0));

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1,1,1),
  new THREE.MeshStandardMaterial({ color: 0x1e5bef })
);
scene.add(cube);

function resize(){
  const w = mount.clientWidth, h = mount.clientHeight;
  renderer.setSize(w,h);
  camera.aspect = w/h;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", resize);

function tick(){
  requestAnimationFrame(tick);
  cube.rotation.y += 0.01;
  cube.rotation.x += 0.006;
  renderer.render(scene, camera);
}
tick();
