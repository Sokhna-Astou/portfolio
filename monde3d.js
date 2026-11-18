import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { creerCerisier } from "./cerisier3d.js";

// =====================================================
//  1. LES RÉGLAGES : tu peux tout changer ici
// =====================================================

// Le chemin de la caméra. p = avancement du défilement (0 = haut de la page, 1 = bas).
// pos = où est la caméra [x, y, z], cible = ce qu'elle regarde [x, y, z]. Unités : des mètres.
const KEYFRAMES = [
  { p: 0.0, pos: [0.2, 2.6, 13], cible: [0.2, 3.3, 0] }, // vue large sur le décor
  { p: 0.15, pos: [-0.2, 2.4, 11.5], cible: [-0.6, 3.0, 0] }, // on avance doucement
  { p: 0.4, pos: [-3.0, 1.4, 2.4], cible: [-3.0, 1.25, 0] }, // tout près de l'écran
  { p: 0.48, pos: [-3.0, 1.25, 0.4], cible: [-3.0, 1.25, -2] }, // contre la vitre
  { p: 0.6, pos: [-3.0, 1.25, -2.5], cible: [-3.0, 1.25, -6] }, // on est passée dedans
  { p: 1.0, pos: [-3.0, 1.4, -12], cible: [-3.0, 1.4, -16] }, // on s'enfonce
];

// Les couleurs et la lumière du ciel à chaque étape du coucher de soleil.
// haut / milieu / bas = les trois couleurs du dégradé (bas = l'horizon)
// soleilX / soleilY = position du soleil, loin dans le décor
// force = puissance de la lumière du soleil, ambiance = lumière douce partout, etoiles = de 0 à 1
const ETAPES_CIEL = [
  { p: 0.0, haut: 0x5d5189, milieu: 0xb0709a, bas: 0xf0b59a, soleilX: 55, soleilY: 32, soleil: 0xfff0cd, lumiere: 0xfff0cd, force: 1.6, ambiance: 0.7, etoiles: 0 },
  { p: 0.2, haut: 0x6a4f8a, milieu: 0xd0749a, bas: 0xf6a77a, soleilX: 52, soleilY: 18, soleil: 0xffd696, lumiere: 0xffd0a0, force: 1.4, ambiance: 0.65, etoiles: 0 },
  { p: 0.38, haut: 0x3d2f6b, milieu: 0x8c4a85, bas: 0xe0708a, soleilX: 50, soleilY: 5, soleil: 0xffa082, lumiere: 0xff9a8a, force: 0.9, ambiance: 0.5, etoiles: 0.15 },
  { p: 0.5, haut: 0x1a1226, milieu: 0x2d2050, bas: 0x5a3470, soleilX: 48, soleilY: -14, soleil: 0xff8282, lumiere: 0x8a6fd0, force: 0.35, ambiance: 0.38, etoiles: 1 },
  { p: 1.0, haut: 0x120c1c, milieu: 0x1a1226, bas: 0x2d2050, soleilX: 48, soleilY: -14, soleil: 0xff8282, lumiere: 0x8a6fd0, force: 0.3, ambiance: 0.35, etoiles: 1 },
];

// Les couleurs écrites en 0x... deviennent de vrais objets "couleur" de Three.js
ETAPES_CIEL.forEach((etape) => {
  ["haut", "milieu", "bas", "soleil", "lumiere"].forEach((nom) => {
    etape[nom] = new THREE.Color(etape[nom]);
  });
});

// =====================================================
//  2. LA SCÈNE, LA CAMÉRA ET LE RENDU
// =====================================================
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xf0b59a, 40, 230); // une brume qui efface le lointain

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.05, 500);

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true });
} catch (erreur) {
  document.body.insertAdjacentHTML(
    "afterbegin",
    "<p style='padding:2rem'>Ton navigateur ne peut pas afficher la 3D.</p>"
  );
  throw erreur; // on arrête le programme ici
}

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
document.getElementById("monde").appendChild(renderer.domElement);

// =====================================================
//  3. LE CIEL : un dôme, un soleil, des étoiles
// =====================================================

// Le dôme : une énorme sphère autour de nous, peinte par un petit programme (un "shader")
// qui choisit la couleur selon la hauteur : horizon en bas, ciel en haut.
const uniformesCiel = {
  haut: { value: new THREE.Color() },
  milieu: { value: new THREE.Color() },
  bas: { value: new THREE.Color() },
};

const dome = new THREE.Mesh(
  new THREE.SphereGeometry(300, 32, 16),
  new THREE.ShaderMaterial({
    uniforms: uniformesCiel,
    side: THREE.BackSide, // on voit la sphère de l'intérieur
    depthWrite: false,
    fog: false,
    vertexShader: `
      varying vec3 vDirection;
      void main() {
        vDirection = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 haut;
      uniform vec3 milieu;
      uniform vec3 bas;
      varying vec3 vDirection;
      void main() {
        float h = vDirection.y; // 0 = horizon, 1 = tout en haut
        vec3 couleur = mix(bas, milieu, smoothstep(0.0, 0.30, h));
        couleur = mix(couleur, haut, smoothstep(0.25, 0.85, h));
        gl_FragColor = vec4(couleur, 1.0);
        #include <colorspace_fragment>
      }
    `,
  })
);
dome.renderOrder = -10;
dome.frustumCulled = false;
scene.add(dome);

// Une lueur ronde, dessinée une fois pour toutes dans un petit canevas
function creerTextureLueur() {
  const canevas = document.createElement("canvas");
  canevas.width = 256;
  canevas.height = 256;
  const ctx = canevas.getContext("2d");

  const degrade = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  degrade.addColorStop(0, "rgba(255,255,255,1)");
  degrade.addColorStop(0.25, "rgba(255,255,255,0.5)");
  degrade.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = degrade;
  ctx.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canevas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Le soleil : un disque clair, avec une grande lueur autour
const lueurSoleil = new THREE.Sprite(
  new THREE.SpriteMaterial({
    map: creerTextureLueur(),
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
    fog: false,
  })
);
lueurSoleil.scale.set(55, 55, 1);
lueurSoleil.renderOrder = -5;
scene.add(lueurSoleil);

const disqueSoleil = new THREE.Mesh(
  new THREE.CircleGeometry(4.5, 48),
  new THREE.MeshBasicMaterial({ fog: false })
);
scene.add(disqueSoleil);

// Les étoiles : 400 petits points au hasard sur le ciel du haut
const NOMBRE_ETOILES = 400;
const positionsEtoiles = new Float32Array(NOMBRE_ETOILES * 3);

for (let i = 0; i < NOMBRE_ETOILES; i++) {
  const angle = Math.random() * Math.PI * 2;
  const hauteur = 0.08 + Math.random() * 0.92; // 0 = horizon, 1 = zénith
  const rayon = Math.sqrt(1 - hauteur * hauteur);

  positionsEtoiles[i * 3] = Math.cos(angle) * rayon * 250;
  positionsEtoiles[i * 3 + 1] = hauteur * 250;
  positionsEtoiles[i * 3 + 2] = Math.sin(angle) * rayon * 250;
}

const geometrieEtoiles = new THREE.BufferGeometry();
geometrieEtoiles.setAttribute("position", new THREE.BufferAttribute(positionsEtoiles, 3));

const materiauEtoiles = new THREE.PointsMaterial({
  color: 0xfff0f5,
  size: 2,
  sizeAttenuation: false, // toutes de la même taille à l'écran
  transparent: true,
  opacity: 0,
  depthWrite: false,
  fog: false,
});

const etoiles = new THREE.Points(geometrieEtoiles, materiauEtoiles);
etoiles.frustumCulled = false;
scene.add(etoiles);

// =====================================================
//  4. LES LUMIÈRES
// =====================================================
const ambiante = new THREE.AmbientLight(0xffd6e0, 0.7); // une lueur douce partout
scene.add(ambiante);

const lumiereSoleil = new THREE.DirectionalLight(0xfff0cd, 1.5); // le soleil, loin derrière le décor
scene.add(lumiereSoleil);

const lumiereFace = new THREE.DirectionalLight(0xffe6ee, 0.7); // un petit éclairage de face, pour voir les objets
lumiereFace.position.set(-5, 6, 12);
scene.add(lumiereFace);

// =====================================================
//  5. LES MAQUETTES : des formes simples, à remplacer aux étapes suivantes
// =====================================================
function ajouter(geometrie, couleur, x, y, z) {
  const maillage = new THREE.Mesh(
    geometrie,
    new THREE.MeshStandardMaterial({ color: couleur, flatShading: true })
  );
  maillage.position.set(x, y, z);
  scene.add(maillage);
  return maillage;
}

// Le sol : un grand carré violet, couché à plat
ajouter(new THREE.PlaneGeometry(400, 400), 0x5b4180, 0, 0, 0).rotation.x = -Math.PI / 2;

// Le vrai cerisier (dans son propre fichier)
const cerisier = creerCerisier(scene, { graine: 7, densite: 1 });
// La bibliothèque (à gauche)
ajouter(new THREE.BoxGeometry(1.45, 2, 0.4), 0x4a3345, -6.2, 1, -0.5);

// Le bureau blanc : un plateau et deux pieds
ajouter(new THREE.BoxGeometry(2.4, 0.06, 0.8), 0xfff8f4, -3, 0.75, 0);
ajouter(new THREE.BoxGeometry(0.06, 0.72, 0.7), 0xf3e6ea, -4.1, 0.36, 0);
ajouter(new THREE.BoxGeometry(0.06, 0.72, 0.7), 0xf3e6ea, -1.9, 0.36, 0);

// Les écrans : des plans qui brillent d'eux-mêmes (pas besoin de lumière)
function ecran(largeur, hauteur, couleur, x, y, z, rotationY) {
  const plan = new THREE.Mesh(
    new THREE.PlaneGeometry(largeur, hauteur),
    new THREE.MeshBasicMaterial({ color: couleur })
  );
  plan.position.set(x, y, z);
  plan.rotation.y = rotationY;
  scene.add(plan);
}

ecran(0.92, 0.52, 0xffd6e0, -3.0, 1.18, -0.1, 0); // l'écran du milieu : celui où on va entrer
ecran(0.6, 0.42, 0xcdb4db, -3.75, 1.12, -0.05, 0.35);
ecran(0.6, 0.42, 0xe5d4ee, -2.25, 1.12, -0.05, -0.35);

// =====================================================
//  6. LES OUTILS POUR SUIVRE LE DÉFILEMENT
// =====================================================

// Dans une liste d'étapes (avec un "p"), trouve entre quelles deux étapes on se trouve
function segment(liste, p) {
  let i = 0;
  while (i < liste.length - 2 && p > liste[i + 1].p) i++;
  const t = Math.min(Math.max((p - liste[i].p) / (liste[i + 1].p - liste[i].p), 0), 1);
  return { i: i, t: t };
}

// Une courbe lisse qui passe par b (t = 0) et c (t = 1), en tenant compte de a et d :
// c'est ce qui évite que la caméra s'arrête à chaque étape (courbe "Catmull-Rom")
function catmull(a, b, c, d, t) {
  return (
    0.5 *
    (2 * b +
      (-a + c) * t +
      (2 * a - 5 * b + 4 * c - d) * t * t +
      (-a + 3 * b - 3 * c + d) * t * t * t)
  );
}

// Calcule la position (champ = "pos") ou la cible (champ = "cible") de la caméra pour un avancement p
function pointSurChemin(champ, p) {
  const { i, t } = segment(KEYFRAMES, p);
  const a = KEYFRAMES[Math.max(i - 1, 0)][champ];
  const b = KEYFRAMES[i][champ];
  const c = KEYFRAMES[i + 1][champ];
  const d = KEYFRAMES[Math.min(i + 2, KEYFRAMES.length - 1)][champ];

  return [0, 1, 2].map((k) => catmull(a[k], b[k], c[k], d[k], t));
}

function majCamera(p) {
  const pos = pointSurChemin("pos", p);
  const cible = pointSurChemin("cible", p);
  camera.position.set(pos[0], pos[1], pos[2]);
  camera.lookAt(cible[0], cible[1], cible[2]);
}

const positionSoleil = new THREE.Vector3();
const BLANC = new THREE.Color(0xffffff);

function majCiel(p) {
  const { i, t } = segment(ETAPES_CIEL, p);
  const a = ETAPES_CIEL[i];
  const b = ETAPES_CIEL[i + 1];

  // Mélange de deux couleurs, ou de deux nombres, selon l'avancement t
  const melangeCouleur = (nom) => a[nom].clone().lerp(b[nom], t);
  const melangeNombre = (nom) => a[nom] + (b[nom] - a[nom]) * t;

  uniformesCiel.haut.value.copy(melangeCouleur("haut"));
  uniformesCiel.milieu.value.copy(melangeCouleur("milieu"));
  uniformesCiel.bas.value.copy(melangeCouleur("bas"));
  scene.fog.color.copy(uniformesCiel.bas.value); // la brume prend la couleur de l'horizon

  // Le soleil descend derrière l'horizon
  positionSoleil.set(melangeNombre("soleilX"), melangeNombre("soleilY"), -100);
  lueurSoleil.position.copy(positionSoleil);
  disqueSoleil.position.copy(positionSoleil);
  disqueSoleil.lookAt(camera.position); // le disque regarde toujours la caméra

  const couleurSoleil = melangeCouleur("soleil");
  lueurSoleil.material.color.copy(couleurSoleil);
  disqueSoleil.material.color.copy(couleurSoleil).lerp(BLANC, 0.55);

  // La lumière change avec le soleil
  lumiereSoleil.position.copy(positionSoleil);
  lumiereSoleil.color.copy(melangeCouleur("lumiere"));
  lumiereSoleil.intensity = melangeNombre("force");
  ambiante.intensity = melangeNombre("ambiance");

  materiauEtoiles.opacity = melangeNombre("etoiles");
}

// =====================================================
//  7. LE DÉFILEMENT ET L'ANIMATION
// =====================================================
const hud = document.getElementById("hud");
let progres = 0; // l'avancement réel, de 0 à 1
let progresLisse = 0; // l'avancement "adouci", que la caméra suit avec un peu d'inertie

function lireDefilement() {
  const defilable = document.documentElement.scrollHeight - window.innerHeight;
  progres = defilable > 0 ? Math.min(Math.max(window.scrollY / defilable, 0), 1) : 0;
}

window.addEventListener("scroll", lireDefilement, { passive: true });
lireDefilement();
progresLisse = progres;

function animer() {
  // La caméra rattrape doucement le défilement (8 % de l'écart à chaque image)
  progresLisse += (progres - progresLisse) * 0.08;

  majCamera(progresLisse);
  majCiel(progresLisse);

  // Le dôme et les étoiles suivent la caméra : on ne peut jamais s'en approcher
  dome.position.copy(camera.position);
  etoiles.position.copy(camera.position);
  cerisier.animer(performance.now() / 1000); // les pétales qui tombent
  renderer.render(scene, camera);

  // Le compteur de réglage
  const p = camera.position;
  hud.textContent =
    "défilement " + Math.round(progres * 100) + " %  |  caméra x " +
    p.x.toFixed(1) + "  y " + p.y.toFixed(1) + "  z " + p.z.toFixed(1);

  requestAnimationFrame(animer);
}

animer();

// Si on change la taille de la fenêtre, tout s'adapte
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});