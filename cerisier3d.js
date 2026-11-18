import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

// =====================================================
//  LE CERISIER : tronc, racines, branches, fleurs et pétales
// =====================================================

// Où se trouve le pied de l'arbre dans le monde (en mètres)
const X_ARBRE = 4.2;
const Z_ARBRE = -1;

// Un hasard "répétable" : avec la même graine, on obtient toujours le même arbre
function hasardGraine(graine) {
  let a = graine;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// options.graine : change ce nombre pour obtenir un autre arbre
// options.densite : 1 = normal, 0.5 = deux fois moins de fleurs et de pétales (pour un ordinateur lent)
export function creerCerisier(scene, options = {}) {
  const GRAINE = options.graine ?? 7;
  const DENSITE = options.densite ?? 1;

  // ----- Tes boutons de réglage -----
  const PROFONDEUR = 4; // nombre d'étages de branches (plus = plus fourni, mais plus lourd)
  const HAUTEUR_TRONC = 3.4;
  const NB_RACINES = 7;
  const NB_FLEURS_PLAFOND = Math.round(450 * DENSITE); // le plafond de fleurs en haut
  const NB_PETALES_QUI_TOMBENT = Math.round(110 * DENSITE);
  const NB_PETALES_AU_SOL = Math.round(260 * DENSITE);

  const hasard = hasardGraine(GRAINE);
  const entre = (min, max) => hasard() * (max - min) + min;

  // Tout l'arbre est dans un groupe : on le déplace d'un coup
  const groupe = new THREE.Group();
  groupe.position.set(X_ARBRE, 0, Z_ARBRE);
  scene.add(groupe);

  const bois = new THREE.MeshStandardMaterial({ color: 0x6b4a5e, flatShading: true });

  // ---------------------------------------------------
  //  1. LE TRONC : une forme "tournée", large à la base
  // ---------------------------------------------------
  // Chaque couple = [rayon, hauteur]. On fait tourner ce profil autour de l'axe.
  const profil = [
    [1.9, 0],
    [1.4, 0.3],
    [1.0, 0.8],
    [0.82, 1.7],
    [0.72, 2.8],
    [0.64, HAUTEUR_TRONC],
  ].map(([rayon, hauteur]) => new THREE.Vector2(rayon, hauteur));

  groupe.add(new THREE.Mesh(new THREE.LatheGeometry(profil, 9), bois));

  // ---------------------------------------------------
  //  2. LES SEGMENTS DE BOIS : un seul objet qui dessine des centaines de morceaux
  // ---------------------------------------------------
  // Un segment = un petit cône (plus fin en haut). On en place des centaines d'un coup
  // grâce à un "InstancedMesh" : c'est beaucoup plus rapide qu'un objet par morceau.
  const NB_SEGMENTS_MAX = 1200;
  const geometrieSegment = new THREE.CylinderGeometry(0.7, 1, 1, 6);
  geometrieSegment.translate(0, 0.5, 0); // le pied du segment est à l'origine

  const segmentsBois = new THREE.InstancedMesh(geometrieSegment, bois, NB_SEGMENTS_MAX);
  segmentsBois.frustumCulled = false;
  groupe.add(segmentsBois);

  let nbSegments = 0;
  const HAUT = new THREE.Vector3(0, 1, 0);
  const matrice = new THREE.Matrix4();
  const quaternion = new THREE.Quaternion();
  const echelle = new THREE.Vector3();

  // Place un segment entre deux points : on l'oriente, on l'allonge, on l'épaissit
  function ajouterSegment(debut, fin, rayon) {
    if (nbSegments >= NB_SEGMENTS_MAX) return;

    const direction = new THREE.Vector3().subVectors(fin, debut);
    const longueur = direction.length();
    quaternion.setFromUnitVectors(HAUT, direction.normalize()); // tourne le segment dans la bonne direction
    echelle.set(rayon, longueur, rayon);

    matrice.compose(debut, quaternion, echelle);
    segmentsBois.setMatrixAt(nbSegments, matrice);
    nbSegments++;
  }

  // ---------------------------------------------------
  //  3. LES RACINES : elles s'étalent et plongent dans le sol
  // ---------------------------------------------------
  for (let i = 0; i < NB_RACINES; i++) {
    const angle = (i / NB_RACINES) * Math.PI * 2 + entre(-0.25, 0.25);
    let point = new THREE.Vector3(Math.cos(angle) * 0.9, 0.5, Math.sin(angle) * 0.9);
    let rayon = entre(0.55, 0.75);
    let cap = angle; // la direction dans laquelle la racine avance

    for (let etape = 0; etape < 5; etape++) {
      cap += entre(-0.25, 0.25); // elle serpente un peu
      const pas = entre(0.8, 1.2);

      const suivant = new THREE.Vector3(
        point.x + Math.cos(cap) * pas,
        Math.max(point.y - entre(0.05, 0.14), -0.05), // elle descend vers le sol
        point.z + Math.sin(cap) * pas
      );

      ajouterSegment(point, suivant, rayon);
      point = suivant;
      rayon *= 0.7; // chaque morceau est plus fin que le précédent
    }
  }

  // ---------------------------------------------------
  //  4. LES BRANCHES : la même idée que ton cerisier 2D, mais en 3D
  // ---------------------------------------------------
  const boutsDeBranches = []; // les extrémités : c'est là qu'on mettra les fleurs

  // Trouve une direction perpendiculaire à une autre
  function perpendiculaire(direction) {
    const autre = Math.abs(direction.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
    return new THREE.Vector3().crossVectors(direction, autre).normalize();
  }

  // LA FONCTION CLÉ : elle dessine une branche, puis s'appelle elle-même pour les suivantes
  function brancher(debut, direction, longueur, rayon, niveau) {
    const fin = debut.clone().addScaledVector(direction, longueur);
    ajouterSegment(debut, fin, rayon);

    if (niveau >= PROFONDEUR) {
      boutsDeBranches.push(fin);
      return;
    }

    const nbEnfants = hasard() < 0.25 ? 3 : 2;
    const axeDeBase = perpendiculaire(direction);
    const azimutDepart = entre(0, Math.PI * 2);

    for (let i = 0; i < nbEnfants; i++) {
      // On répartit les enfants autour de la branche mère
      const azimut = azimutDepart + (i / nbEnfants) * Math.PI * 2 + entre(-0.4, 0.4);
      const axe = axeDeBase.clone().applyAxisAngle(direction, azimut);

      // On incline la direction de l'enfant par rapport à celle de la mère
      const nouvelleDirection = direction.clone().applyAxisAngle(axe, entre(0.35, 0.75));
      nouvelleDirection.y += 0.12; // les branches ont tendance à remonter un peu
      nouvelleDirection.normalize();

      brancher(fin, nouvelleDirection, longueur * entre(0.72, 0.86), rayon * 0.7, niveau + 1);
    }
  }

  // Les grandes branches qui partent du haut du tronc.
  // az = direction horizontale (0 = droite, π = vers la gauche, donc vers le bureau)
  // incl = inclinaison par rapport à la verticale (0 = tout droit vers le haut)
  const BRANCHES_PRINCIPALES = [
    { az: Math.PI, incl: 1.05, longueur: 4.6 },
    { az: Math.PI * 0.85, incl: 0.8, longueur: 4.0 },
    { az: Math.PI * 1.15, incl: 0.75, longueur: 4.0 },
    { az: Math.PI * 0.5, incl: 0.55, longueur: 2.8 },
    { az: Math.PI * 1.5, incl: 0.55, longueur: 2.8 },
    { az: 0, incl: 0.7, longueur: 2.8 },
    { az: 0, incl: 0.1, longueur: 2.9 },
  ];

  BRANCHES_PRINCIPALES.forEach((b) => {
    const direction = new THREE.Vector3(
      Math.sin(b.incl) * Math.cos(b.az),
      Math.cos(b.incl),
      Math.sin(b.incl) * Math.sin(b.az)
    );
    brancher(new THREE.Vector3(0, HAUTEUR_TRONC - 0.1, 0), direction, b.longueur, 0.5, 0);
  });

  segmentsBois.count = nbSegments; // on n'affiche que les segments utilisés
  segmentsBois.instanceMatrix.needsUpdate = true;

  // ---------------------------------------------------
  //  5. LES FLEURS : des petits cristaux roses, par centaines
  // ---------------------------------------------------
  const NB_FLEURS_MAX = 2200;
  const fleurs = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(1, 0),
    new THREE.MeshStandardMaterial({
      color: 0xffffff, // la vraie couleur est donnée fleur par fleur
      flatShading: true,
      emissive: 0xff9fb8, // les fleurs brillent un peu d'elles-mêmes
      emissiveIntensity: 0.35,
    }),
    NB_FLEURS_MAX
  );
  fleurs.frustumCulled = false;
  groupe.add(fleurs);

  const COULEURS_FLEURS = [0xffd6e0, 0xffb7c5, 0xffe4ec, 0xf7a8bd].map((c) => new THREE.Color(c));
  const position = new THREE.Vector3();
  const rotation = new THREE.Euler();
  let nbFleurs = 0;

  function ajouterFleur(x, y, z, taille) {
    if (nbFleurs >= NB_FLEURS_MAX) return;

    position.set(x, y, z);
    rotation.set(hasard() * 6, hasard() * 6, hasard() * 6);
    quaternion.setFromEuler(rotation);
    echelle.set(taille, taille, taille);

    matrice.compose(position, quaternion, echelle);
    fleurs.setMatrixAt(nbFleurs, matrice);
    fleurs.setColorAt(nbFleurs, COULEURS_FLEURS[Math.floor(hasard() * COULEURS_FLEURS.length)]);
    nbFleurs++;
  }

  // Un bouquet au bout de chaque branche
  boutsDeBranches.forEach((bout) => {
    for (let i = 0; i < 4; i++) {
      ajouterFleur(
        bout.x + entre(-0.6, 0.6),
        bout.y + entre(-0.5, 0.6),
        bout.z + entre(-0.6, 0.6),
        entre(0.28, 0.55)
      );
    }
  });

  // Le plafond de fleurs : mince et haut au loin (à gauche), épais près de l'arbre
  for (let i = 0; i < NB_FLEURS_PLAFOND; i++) {
    const x = entre(-13, 4.8);
    const epaisseur = THREE.MathUtils.smoothstep(x, -9, 0); // 0 loin de l'arbre, 1 tout près
    const bas = 8.6 - 3.4 * epaisseur; // le bord inférieur du plafond monte quand on s'éloigne
    ajouterFleur(x, entre(bas, 9.9), entre(-3.2, 1.6), entre(0.3, 0.65));
  }

  fleurs.count = nbFleurs;
  fleurs.instanceMatrix.needsUpdate = true;
  if (fleurs.instanceColor) fleurs.instanceColor.needsUpdate = true;

  // ---------------------------------------------------
  //  6. LE TAPIS DE PÉTALES SUR LE SOL
  // ---------------------------------------------------
  const tapis = new THREE.InstancedMesh(
    new THREE.CircleGeometry(1, 6),
    new THREE.MeshBasicMaterial({ color: 0xffffff }),
    Math.max(NB_PETALES_AU_SOL, 1)
  );
  tapis.frustumCulled = false;
  groupe.add(tapis);

  for (let i = 0; i < NB_PETALES_AU_SOL; i++) {
    // Six pétales sur dix tombent près de l'arbre
    const x = hasard() < 0.6 ? entre(-4, 6.5) : entre(-13, 6.5);

    position.set(x, 0.015, entre(-3, 4.5));
    rotation.set(-Math.PI / 2, 0, hasard() * Math.PI * 2); // couché à plat, orienté au hasard
    quaternion.setFromEuler(rotation);
    echelle.set(entre(0.06, 0.14), entre(0.04, 0.09), 1);

    matrice.compose(position, quaternion, echelle);
    tapis.setMatrixAt(i, matrice);
    tapis.setColorAt(i, COULEURS_FLEURS[Math.floor(hasard() * COULEURS_FLEURS.length)]);
  }

  tapis.instanceMatrix.needsUpdate = true;
  if (tapis.instanceColor) tapis.instanceColor.needsUpdate = true;

  // ---------------------------------------------------
  //  7. LES PÉTALES QUI TOMBENT (animés à chaque image)
  // ---------------------------------------------------
  const alea = (min, max) => Math.random() * (max - min) + min; // un vrai hasard : les pétales ne se répètent pas

  const petales = new THREE.InstancedMesh(
    new THREE.PlaneGeometry(0.16, 0.24),
    new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }),
    Math.max(NB_PETALES_QUI_TOMBENT, 1)
  );
  petales.frustumCulled = false;
  groupe.add(petales);

  const donnees = [];

  // Fait (re)partir un pétale depuis le feuillage
  function lancerPetale(d, nimporteOu) {
    d.x = alea(-12, 4);
    d.y = nimporteOu ? alea(0.2, 9.5) : alea(6, 9.5);
    d.z = alea(-3, 1.6);
    d.chute = alea(0.35, 0.75); // vitesse de chute, en mètres par seconde
    d.derive = alea(0.25, 0.6); // à quel point il se balance
    d.frequence = alea(0.8, 1.6);
    d.phase = alea(0, 6.28);
    d.tourneX = alea(0.5, 2);
    d.tourneY = alea(0.5, 2);
    d.tourneZ = alea(0.5, 2);
  }

  for (let i = 0; i < NB_PETALES_QUI_TOMBENT; i++) {
    const d = {};
    lancerPetale(d, true);
    donnees.push(d);
    petales.setColorAt(i, COULEURS_FLEURS[Math.floor(hasard() * COULEURS_FLEURS.length)]);
  }

  if (petales.instanceColor) petales.instanceColor.needsUpdate = true;

  const unite = new THREE.Vector3(1, 1, 1);
  let dernierTemps = 0;

  // À appeler à chaque image, avec le temps en secondes
  function animer(temps) {
    const dt = Math.min(temps - dernierTemps, 0.05);
    dernierTemps = temps;

    for (let i = 0; i < donnees.length; i++) {
      const d = donnees[i];

      d.y -= d.chute * dt;
      d.x += Math.sin(temps * d.frequence + d.phase) * d.derive * dt;
      d.z += Math.cos(temps * d.frequence * 0.8 + d.phase) * d.derive * 0.6 * dt;

      if (d.y < 0.03) lancerPetale(d, false); // arrivé au sol : un nouveau pétale repart du haut

      position.set(d.x, d.y, d.z);
      rotation.set(temps * d.tourneX + d.phase, temps * d.tourneY, temps * d.tourneZ);
      quaternion.setFromEuler(rotation);

      matrice.compose(position, quaternion, unite);
      petales.setMatrixAt(i, matrice);
    }

    petales.instanceMatrix.needsUpdate = true;
  }

  return { groupe: groupe, animer: animer };
}