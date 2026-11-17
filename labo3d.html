import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

// 1. LA SCÈNE : le plateau
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1226);

// 2. LA CAMÉRA : angle de vue 50°, format de l'écran, ce qui est trop proche ou trop loin n'est pas dessiné
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(2.5, 2, 4); // où elle se trouve
camera.lookAt(0, 0.5, 0); // où elle regarde

// 3. LE RENDU : le photographe, qui dessine dans la page
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // net, mais sans exagérer
document.body.appendChild(renderer.domElement);

// 4. LES LUMIÈRES : une lueur douce partout, et un "soleil" qui éclaire d'un côté
scene.add(new THREE.AmbientLight(0xffd6e0, 0.6));

const soleil = new THREE.DirectionalLight(0xfff0cd, 1.4);
soleil.position.set(3, 5, 2);
scene.add(soleil);

// 5. UN OBJET : un cube rose (forme + peau)
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshStandardMaterial({ color: 0xffb7c5 })
);
cube.position.y = 0.5; // posé sur le sol
scene.add(cube);

// 6. UN SOL : un grand carré violet, couché à plat
const sol = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshStandardMaterial({ color: 0x5b4180 })
);
sol.rotation.x = -Math.PI / 2;
scene.add(sol);

// 7. L'ANIMATION : à chaque image, on fait tourner le cube un tout petit peu, puis on "prend la photo"
function animer() {
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
  requestAnimationFrame(animer);
}
animer();

// 8. Si on change la taille de la fenêtre, tout s'adapte
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});