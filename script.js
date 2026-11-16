// ---------- 1. LES PÉTALES QUI TOMBENT SUR TOUTE LA PAGE ----------
const conteneur = document.querySelector(".petales");
const NOMBRE_PETALES = 25;

function aleatoire(min, max) {
  return Math.random() * (max - min) + min;
}

for (let i = 0; i < NOMBRE_PETALES; i++) {
  const petale = document.createElement("span");
  petale.classList.add("petale");

  const taille = aleatoire(10, 22);
  petale.style.width = taille * 0.7 + "px";
  petale.style.height = taille + "px";

  petale.style.left = aleatoire(0, 100) + "vw";
  petale.style.animationDuration = aleatoire(8, 16) + "s";
  petale.style.animationDelay = aleatoire(-16, 0) + "s";
  petale.style.setProperty("--balancement", aleatoire(-90, 90) + "px");

  conteneur.appendChild(petale);
}

// ---------- 2. LE LIEN ACTIF DU MENU ----------
const sections = document.querySelectorAll("main section[id]");
const liens = document.querySelectorAll(".menu nav a");

const observateur = new IntersectionObserver(
  (entrees) => {
    entrees.forEach((entree) => {
      if (entree.isIntersecting) {
        liens.forEach((lien) => {
          const cible = "#" + entree.target.id;
          lien.classList.toggle("actif", lien.getAttribute("href") === cible);
        });
      }
    });
  },
  { rootMargin: "-40% 0px -55% 0px" }
);

sections.forEach((section) => observateur.observe(section));

// ---------- 3. L'EFFET "DÉCRYPTAGE" DES LETTRES ----------
const SYMBOLES = "✦✧·+*°◦01";
const reduireMouvement = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function decoder(element, texte, duree) {
  const debut = performance.now();

  function image(maintenant) {
    const progres = Math.min((maintenant - debut) / duree, 1);
    const revele = Math.floor(progres * texte.length);
    let resultat = "";

    for (let i = 0; i < texte.length; i++) {
      if (i < revele || texte[i] === " ") {
        resultat += texte[i];
      } else {
        resultat += SYMBOLES[Math.floor(Math.random() * SYMBOLES.length)];
      }
    }

    element.textContent = resultat;

    if (progres < 1) {
      requestAnimationFrame(image);
    }
  }

  requestAnimationFrame(image);
}

// ---------- 4. LE CONTENU, CONSTRUIT À PARTIR DE donnees.js ----------
function creerElement(balise, classe, texte) {
  const element = document.createElement(balise);
  if (classe) element.className = classe;
  if (texte) element.textContent = texte;
  return element;
}

// --- Les projets ---
const listeProjets = document.getElementById("liste-projets");

PROJETS.forEach((projet) => {
  const carte = creerElement("article", "carte");

  carte.append(creerElement("h3", "", projet.titre));
  carte.append(creerElement("p", "", projet.description));

  const tags = creerElement("ul", "tags");
  projet.tags.forEach((tag) => tags.append(creerElement("li", "", tag)));
  carte.append(tags);

  if (projet.lien) {
    const lien = creerElement("a", "lien-carte", "Voir le projet ↗");
    lien.href = projet.lien;
    lien.target = "_blank";
    lien.rel = "noopener";
    carte.append(lien);
  }

  listeProjets.append(carte);
});

// --- Les livres ---
const listeLivres = document.getElementById("liste-livres");

LIVRES.forEach((livre) => {
  const carte = creerElement("article", "livre");
  const texte = document.createElement("div");

  texte.append(creerElement("h4", "", livre.titre));
  texte.append(creerElement("p", "auteur", livre.auteur));
  texte.append(creerElement("p", "", livre.note));

  carte.append(creerElement("div", "livre-dos"), texte);
  listeLivres.append(carte);
});

// --- Les photos ---
const PHOTOS_VISIBLES = 6;
const galerie = document.getElementById("galerie");
const boutonVoirPlus = document.getElementById("voir-plus");

const photosAffichees =
  PHOTOS.length > 0
    ? PHOTOS
    : [{ legende: "Titre de la photo" }, { legende: "Titre de la photo" }, { legende: "Titre de la photo" }];

photosAffichees.forEach((photo, index) => {
  const figure = creerElement("figure", "photo");
  let visuel;

  if (photo.fichier) {
    visuel = document.createElement("img");
    visuel.src = photo.fichier;
    visuel.alt = photo.description || photo.legende || "";
    visuel.loading = "lazy";
    visuel.decoding = "async";

    figure.classList.add("cliquable");
    figure.tabIndex = 0;
    figure.setAttribute("role", "button");
    figure.setAttribute("aria-label", "Agrandir : " + (photo.legende || "photo"));
    figure.addEventListener("click", () => ouvrirLightbox(index));
    figure.addEventListener("keydown", (evenement) => {
      if (evenement.key === "Enter") ouvrirLightbox(index);
    });
  } else {
    visuel = creerElement("div", "photo-vide", "📸");
  }

  figure.append(visuel, creerElement("figcaption", "", photo.legende || ""));

  if (index >= PHOTOS_VISIBLES) figure.classList.add("cachee");

  galerie.append(figure);
});

if (photosAffichees.length > PHOTOS_VISIBLES) {
  let toutAffiche = false;
  boutonVoirPlus.parentElement.hidden = false;

  function majBouton() {
    boutonVoirPlus.textContent = toutAffiche
      ? "Voir moins"
      : "Voir toutes les photos (" + photosAffichees.length + ")";
  }

  majBouton();

  boutonVoirPlus.addEventListener("click", () => {
    toutAffiche = !toutAffiche;
    galerie.querySelectorAll(".photo").forEach((figure, index) => {
      if (index >= PHOTOS_VISIBLES) figure.classList.toggle("cachee", !toutAffiche);
    });
    majBouton();
  });
}

// --- L'agrandissement des photos (lightbox) ---
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxLegende = document.getElementById("lightbox-legende");
let photoCourante = 0;

function montrerPhoto(index) {
  photoCourante = (index + PHOTOS.length) % PHOTOS.length;
  const photo = PHOTOS[photoCourante];

  lightboxImage.src = photo.fichier;
  lightboxImage.alt = photo.description || photo.legende || "";
  lightboxLegende.textContent = photo.legende || "";
}

function ouvrirLightbox(index) {
  montrerPhoto(index);
  lightbox.hidden = false;
  document.body.classList.add("fige");
}

function fermerLightbox() {
  lightbox.hidden = true;
  document.body.classList.remove("fige");
  lightboxImage.removeAttribute("src");
}

document.getElementById("lightbox-fermer").addEventListener("click", fermerLightbox);
document.getElementById("lightbox-prec").addEventListener("click", () => montrerPhoto(photoCourante - 1));
document.getElementById("lightbox-suiv").addEventListener("click", () => montrerPhoto(photoCourante + 1));

lightbox.addEventListener("click", (evenement) => {
  if (evenement.target === lightbox) fermerLightbox();
});

document.addEventListener("keydown", (evenement) => {
  if (lightbox.hidden) return;
  if (evenement.key === "Escape") fermerLightbox();
  if (evenement.key === "ArrowLeft") montrerPhoto(photoCourante - 1);
  if (evenement.key === "ArrowRight") montrerPhoto(photoCourante + 1);
});

// ---------- 5. L'ÉCRAN D'INTRO : COMPTEUR, FÉE, PUIS FONDU ----------
const DUREE_COMPTE = 8000; // durée du comptage, en millisecondes

const intro = document.getElementById("intro");
const chiffres = document.querySelectorAll("#intro-compteur span");
const labelIntro = document.getElementById("intro-label");
const fee = document.getElementById("intro-fee");

let termine = false;
let animationCompteur;
let animationFee;
let traine;

function facile(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function afficher(valeur) {
  const texte = String(valeur).padStart(3, "0");
  chiffres.forEach((chiffre, i) => {
    chiffre.textContent = texte[i];
  });
  intro.style.setProperty("--progres", valeur / 100);
}

function decoderAccueil() {
  if (reduireMouvement) return;
  const etiquette = document.querySelector(".etiquette");
  decoder(etiquette, etiquette.textContent.trim(), 1600);
}

function ouvrirIntro() {
  if (termine) return;
  termine = true;
  cancelAnimationFrame(animationCompteur);

  afficher(100);
  intro.classList.add("ouverture");

  setTimeout(() => {
    document.body.classList.remove("chargement");
    decoderAccueil();
  }, 900);

  setTimeout(() => {
    cancelAnimationFrame(animationFee);
    clearInterval(traine);
    intro.remove();
  }, 3200);
}

if (reduireMouvement) {
  ouvrirIntro();
} else {
  document.body.classList.add("chargement");

  decoder(labelIntro, "ASTOU · ÉCLOSION", 1800);

  // --- Le comptage de 000 à 100 ---
  const debut = performance.now();

  function image(maintenant) {
    const t = Math.min((maintenant - debut) / DUREE_COMPTE, 1);
    afficher(Math.round(facile(t) * 100));

    if (t < 1) {
      animationCompteur = requestAnimationFrame(image);
    } else {
      setTimeout(ouvrirIntro, 500);
    }
  }

  animationCompteur = requestAnimationFrame(image);

  // --- La fée : un vol au hasard, sans trajectoire fixe ---
  let feeX = -150;
  let feeY = window.innerHeight * 0.3;
  let vitX = 4;
  let vitY = 0;
  let cibleX = window.innerWidth * 0.3;
  let cibleY = window.innerHeight * 0.3;
  let prochainChangement = 0;

  function voler(maintenant) {
    if (maintenant > prochainChangement) {
      cibleX = aleatoire(window.innerWidth * 0.08, window.innerWidth * 0.85);
      cibleY = aleatoire(window.innerHeight * 0.1, window.innerHeight * 0.75);
      prochainChangement = maintenant + aleatoire(900, 2200);
    }

    vitX += (cibleX - feeX) * 0.0006 + aleatoire(-0.05, 0.05);
    vitY += (cibleY - feeY) * 0.0006 + aleatoire(-0.05, 0.05) + Math.sin(maintenant / 160) * 0.04;

    vitX *= 0.975;
    vitY *= 0.975;

    feeX += vitX;
    feeY += vitY;

    const inclinaison = Math.max(-20, Math.min(20, vitX * 4));
    fee.style.transform =
      "translate(" + feeX + "px, " + feeY + "px) rotate(" + inclinaison + "deg)";

    animationFee = requestAnimationFrame(voler);
  }

  animationFee = requestAnimationFrame(voler);

  // --- Les étincelles qu'elle laisse derrière elle ---
  traine = setInterval(() => {
    const largeur = fee.offsetWidth;

    const etincelle = document.createElement("span");
    etincelle.className = "etincelle";
    etincelle.textContent = Math.random() > 0.5 ? "✦" : "✧";
    etincelle.style.left = feeX + largeur * 0.5 + aleatoire(-12, 12) + "px";
    etincelle.style.top = feeY + largeur * 0.9 + aleatoire(-15, 15) + "px";
    etincelle.style.fontSize = aleatoire(7, 15) + "px";
    etincelle.style.setProperty("--dx", aleatoire(-25, 25) + "px");
    etincelle.style.setProperty("--dy", aleatoire(20, 60) + "px");

    intro.appendChild(etincelle);
    setTimeout(() => etincelle.remove(), 1100);
  }, 110);

  intro.addEventListener("click", ouvrirIntro);
  document.addEventListener("keydown", ouvrirIntro, { once: true });
}

// ---------- 6. LES TITRES SE DÉCRYPTENT AU DÉFILEMENT ----------
const titres = document.querySelectorAll(".surtitre, .titre-section");

titres.forEach((titre) => {
  titre.dataset.texte = titre.textContent.trim();
  if (!reduireMouvement) titre.classList.add("attente");
});

const decrypteur = new IntersectionObserver(
  (entrees, observateurActuel) => {
    entrees.forEach((entree) => {
      if (entree.isIntersecting) {
        const titre = entree.target;
        titre.classList.remove("attente");
        decoder(titre, titre.dataset.texte, 1200);
        observateurActuel.unobserve(titre);
      }
    });
  },
  { threshold: 0.6 }
);

titres.forEach((titre) => decrypteur.observe(titre));

// ---------- 7. FONDU LÉGER POUR CARTES, LIVRES ET PHOTOS ----------
const elementsAnimes = document.querySelectorAll(
  ".texte-principal, .bloc-titre, .bloc-texte, .carte, .livre, .photo, .email, #contact .boutons"
);

elementsAnimes.forEach((element) => {
  element.classList.add("apparait");

  const position = Array.from(element.parentElement.children).indexOf(element);
  element.style.setProperty("--delai", Math.min(position, 4) * 0.12 + "s");
});

const revelateur = new IntersectionObserver(
  (entrees, observateurActuel) => {
    entrees.forEach((entree) => {
      if (entree.isIntersecting) {
        entree.target.classList.add("visible");
        observateurActuel.unobserve(entree.target);
      }
    });
  },
  { threshold: 0.15 }
);

elementsAnimes.forEach((element) => revelateur.observe(element));

// ---------- 8. LE CIEL : DU JOUR AU CRÉPUSCULE, SELON LE DÉFILEMENT ----------
const ciel = document.getElementById("ciel");
const etoilesConteneur = document.getElementById("ciel-etoiles");

// Les étapes du ciel (p = avancement dans la page, de 0 à 1). Les couleurs sont en [rouge, vert, bleu].
const ETAPES_CIEL = [
  { p: 0, haut: [93, 81, 137], milieu: [176, 112, 154], bas: [240, 181, 154], soleilX: 82, soleilY: 14, soleil: [255, 240, 205], etoiles: 0 },
  { p: 0.35, haut: [106, 79, 138], milieu: [208, 116, 154], bas: [246, 167, 122], soleilX: 78, soleilY: 38, soleil: [255, 214, 150], etoiles: 0 },
  { p: 0.7, haut: [61, 47, 107], milieu: [140, 74, 133], bas: [224, 112, 138], soleilX: 72, soleilY: 72, soleil: [255, 160, 130], etoiles: 0.15 },
  { p: 1, haut: [26, 18, 38], milieu: [45, 32, 80], bas: [90, 52, 112], soleilX: 66, soleilY: 108, soleil: [255, 130, 130], etoiles: 1 },
];

// Mélange deux couleurs : t = 0 donne la première, t = 1 la seconde
function melanger(a, b, t) {
  return a.map((valeur, i) => Math.round(valeur + (b[i] - valeur) * t));
}

function enCouleur(rvb) {
  return "rgb(" + rvb.join(",") + ")";
}

function majCiel() {
  const defilable = document.documentElement.scrollHeight - window.innerHeight;
  const p = defilable > 0 ? Math.min(Math.max(window.scrollY / defilable, 0), 1) : 0;

  // On cherche entre quelles deux étapes on se trouve
  let i = 0;
  while (i < ETAPES_CIEL.length - 2 && p > ETAPES_CIEL[i + 1].p) i++;

  const a = ETAPES_CIEL[i];
  const b = ETAPES_CIEL[i + 1];
  const t = Math.min(Math.max((p - a.p) / (b.p - a.p), 0), 1);

  ciel.style.setProperty("--ciel-haut", enCouleur(melanger(a.haut, b.haut, t)));
  ciel.style.setProperty("--ciel-milieu", enCouleur(melanger(a.milieu, b.milieu, t)));
  ciel.style.setProperty("--ciel-bas", enCouleur(melanger(a.bas, b.bas, t)));
  ciel.style.setProperty("--soleil-couleur", enCouleur(melanger(a.soleil, b.soleil, t)));
  ciel.style.setProperty("--soleil-y", a.soleilY + (b.soleilY - a.soleilY) * t + "%");
 ciel.style.setProperty("--soleil-x", a.soleilX + (b.soleilX - a.soleilX) * t + "%");
  ciel.style.setProperty("--etoiles", a.etoiles + (b.etoiles - a.etoiles) * t);
}

// Les étoiles
for (let i = 0; i < 90; i++) {
  const etoile = document.createElement("span");
  const taille = aleatoire(1, 2.8);

  etoile.className = "etoile";
  etoile.style.left = aleatoire(0, 100) + "%";
  etoile.style.top = aleatoire(0, 100) + "%";
  etoile.style.width = taille + "px";
  etoile.style.height = taille + "px";
  etoile.style.animationDelay = aleatoire(0, 3) + "s";
  etoile.style.animationDuration = aleatoire(2, 5) + "s";

  etoilesConteneur.appendChild(etoile);
}

// On met à jour le ciel au défilement, mais au maximum une fois par image affichée
let majEnAttente = false;

window.addEventListener(
  "scroll",
  () => {
    if (majEnAttente) return;
    majEnAttente = true;
    requestAnimationFrame(() => {
      majCiel();
      majEnAttente = false;
    });
  },
  { passive: true }
);

window.addEventListener("resize", majCiel);
majCiel();

// ---------- 9. LA SCÈNE : CERISIER, RACINES, FEUILLAGE ET LIVRES ----------
const NS_SVG = "http://www.w3.org/2000/svg";

// Crée un élément SVG avec ses attributs
function creerSvg(nom, attributs) {
  const element = document.createElementNS(NS_SVG, nom);
  for (const cle in attributs) {
    element.setAttribute(cle, attributs[cle]);
  }
  return element;
}

// Un hasard "répétable" : avec la même graine, on obtient toujours le même résultat
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

const scene = document.getElementById("scene");
const groupeArbre = document.getElementById("arbre");
const groupeCanopee = document.getElementById("canopee");
const groupeLivres = document.getElementById("bibliotheque-livres");

if (scene && groupeArbre && groupeCanopee) {
  const GRAINE = 7; // change ce nombre pour obtenir un autre arbre !
  const PETIT_ECRAN = window.innerWidth < 900;
  const PROFONDEUR = PETIT_ECRAN ? 5 : 6; // nombre d'étages de branches (plus = plus fourni, mais plus lourd)
  const NIVEAUX_ANIMES = PETIT_ECRAN ? 0 : 1; // étages qui se balancent (0 = rien ne bouge)
  const NOMBRE_FLEURS_CANOPEE = PETIT_ECRAN ? 280 : 620; // densité du plafond de fleurs
  const TRONC_X = 1250;
  const FOURCHE_Y = 690;
  const COULEUR_BOIS = "#5a3d4f";
  const COULEURS_FLEURS = ["#ffd6e0", "#ffb7c5", "#ffe4ec", "#f7a8bd"];

  const hasard = hasardGraine(GRAINE);

  function entre(min, max) {
    return hasard() * (max - min) + min;
  }

  const positionsFleurs = []; // pour faire tomber les pétales depuis le feuillage

  // Un petit bouquet de fleurs autour d'un point
  function ajouterFleurs(cible, x, y, nombre, etalement) {
    for (let i = 0; i < nombre; i++) {
      const px = x + entre(-etalement, etalement);
      const py = y + entre(-etalement, etalement);
      const couleur = COULEURS_FLEURS[Math.floor(hasard() * COULEURS_FLEURS.length)];

      cible.appendChild(
        creerSvg("circle", { cx: px, cy: py, r: entre(4, 9), fill: couleur, opacity: entre(0.65, 0.95) })
      );

      if (hasard() < 0.06 && px > 0 && px < 1600 && py > 0) positionsFleurs.push({ x: px, y: py });
    }
  }

  // --- Les racines : des courbes qui s'affinent ---
  function racine(x0, y0, cx, cy, x1, y1, largeurDebut, largeurFin) {
    const segments = 14;
    let precedent = [x0, y0];

    for (let i = 1; i <= segments; i++) {
      const t = i / segments;
      const x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cx + t * t * x1;
      const y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * cy + t * t * y1;

      groupeArbre.appendChild(
        creerSvg("line", {
          x1: precedent[0],
          y1: precedent[1],
          x2: x,
          y2: y,
          stroke: COULEUR_BOIS,
          "stroke-width": largeurDebut + (largeurFin - largeurDebut) * t,
          "stroke-linecap": "round",
        })
      );

      precedent = [x, y];
    }
  }

  racine(1185, 1120, 1120, 1190, 1005, 1198, 48, 5);
  racine(1170, 1160, 1100, 1205, 1040, 1222, 38, 4);
  racine(1215, 1090, 1190, 1165, 1135, 1182, 30, 4);
  racine(1315, 1120, 1380, 1190, 1495, 1198, 48, 5);
  racine(1330, 1160, 1400, 1205, 1460, 1222, 38, 4);
  racine(1285, 1090, 1310, 1165, 1365, 1182, 30, 4);

  // --- Le gros tronc, évasé à la base ---
  groupeArbre.appendChild(
    creerSvg("path", {
      d: "M1150 1192 C1195 1170 1205 1100 1210 1000 C1213 900 1217 790 1220 700 L1280 700 C1283 790 1287 900 1290 1000 C1295 1100 1305 1170 1350 1192 Z",
      fill: "url(#sc-ecorce)",
    })
  );

  // L'écorce : quelques lignes sombres et claires
  [
    "M1236 1140 C1233 1000 1238 860 1237 720",
    "M1262 1120 C1266 980 1260 850 1263 730",
    "M1224 1060 C1224 960 1228 860 1229 760",
  ].forEach((d) => {
    groupeArbre.appendChild(
      creerSvg("path", { d: d, stroke: "rgba(18,12,28,0.3)", "stroke-width": 2.5, "stroke-linecap": "round", fill: "none" })
    );
  });

  groupeArbre.appendChild(
    creerSvg("path", {
      d: "M1246 1150 C1244 1000 1249 860 1248 725",
      stroke: "rgba(255,183,197,0.14)",
      "stroke-width": 2,
      "stroke-linecap": "round",
      fill: "none",
    })
  );

  // --- LA FONCTION CLÉ : une branche qui s'appelle elle-même pour dessiner les suivantes ---
  function brancher(parent, x, y, longueur, angle, epaisseur, niveau) {
    const x2 = x + Math.sin(angle) * longueur;
    const y2 = y - Math.cos(angle) * longueur;

    // Les premiers étages sont dans un groupe qui se balance doucement
    let conteneurBranche = parent;
    if (niveau < NIVEAUX_ANIMES) {
      conteneurBranche = creerSvg("g", { class: "branche-balance" });
      conteneurBranche.style.transformOrigin = x + "px " + y + "px";
      conteneurBranche.style.setProperty("--amplitude", entre(0.3, 0.8) + "deg");
      conteneurBranche.style.animationDuration = entre(6, 10) + "s";
      conteneurBranche.style.animationDelay = -entre(0, 8) + "s";
      parent.appendChild(conteneurBranche);
    }

    const cx = (x + x2) / 2 + entre(-0.08, 0.08) * longueur;
    const cy = (y + y2) / 2 + entre(-0.08, 0.08) * longueur;

    conteneurBranche.appendChild(
      creerSvg("path", {
        d: "M" + x + " " + y + " Q" + cx + " " + cy + " " + x2 + " " + y2,
        stroke: COULEUR_BOIS,
        "stroke-width": Math.max(epaisseur, 1.1),
        "stroke-linecap": "round",
        fill: "none",
      })
    );

    // Un peu de fleurs sur les derniers étages
    if (niveau >= PROFONDEUR - 2 && hasard() < 0.5) {
      ajouterFleurs(conteneurBranche, x2, y2, 1, 12);
    }

    // Au bout des branches : un bouquet, avec parfois un "nuage" rose doux
    if (niveau >= PROFONDEUR) {
      ajouterFleurs(conteneurBranche, x2, y2, 2, 14);
      if (hasard() < 0.4) {
        conteneurBranche.appendChild(
          creerSvg("circle", { cx: x2, cy: y2, r: entre(20, 34), fill: "#ffb7c5", opacity: entre(0.08, 0.14) })
        );
      }
      return;
    }

    const enfants = niveau > 1 && hasard() < 0.2 ? 3 : 2;

    for (let i = 0; i < enfants; i++) {
      const ecart =
        enfants === 3
          ? (i - 1) * entre(0.35, 0.6)
          : (i === 0 ? -1 : 1) * entre(0.22, 0.6);

      brancher(
        conteneurBranche,
        x2,
        y2,
        longueur * entre(0.74, 0.84),
        angle + ecart + entre(-0.08, 0.08),
        epaisseur * 0.7,
        niveau + 1
      );
    }
  }

  // Les grandes branches qui partent du haut du tronc : celles de gauche vont loin sous le plafond de fleurs
  const BRANCHES_MAITRESSES = [
    { angle: -1.25, longueur: 285 },
    { angle: -0.9, longueur: 235 },
    { angle: -0.5, longueur: 195 },
    { angle: -0.12, longueur: 175 },
    { angle: 0.3, longueur: 180 },
    { angle: 0.75, longueur: 150 },
    { angle: 1.2, longueur: 105 },
  ];

  BRANCHES_MAITRESSES.forEach((b) => {
    brancher(groupeArbre, TRONC_X + entre(-10, 10), FOURCHE_Y + entre(-8, 8), b.longueur, b.angle, 36, 0);
  });

  // --- Le plafond de fleurs : mince au-dessus du texte, épais au-dessus de l'arbre ---
  function bordCanopee(x) {
    // Mince et haut au-dessus du texte, puis de plus en plus épais au-dessus de l'arbre
    const t = Math.min(Math.max((x - 800) / 520, 0), 1);
    const douce = t * t * (3 - 2 * t);
    return 95 + 350 * douce + 22 * Math.sin(x / 95);
  }

  for (let i = 0; i < NOMBRE_FLEURS_CANOPEE; i++) {
    const x = entre(-20, 1620);
    const bord = bordCanopee(x);
    const y = -30 + (bord + 30) * Math.pow(hasard(), 0.6); // plus dense près du bord inférieur
    const couleur = COULEURS_FLEURS[Math.floor(hasard() * COULEURS_FLEURS.length)];

    groupeCanopee.appendChild(
      creerSvg("circle", { cx: x, cy: y, r: entre(7, 17), fill: couleur, opacity: entre(0.55, 0.95) })
    );

    if (hasard() < 0.25) {
      groupeCanopee.appendChild(
        creerSvg("circle", { cx: x, cy: y, r: entre(26, 42), fill: "#ffb7c5", opacity: entre(0.06, 0.12) })
      );
    }

    if (y > bord * 0.6 && hasard() < 0.15 && x > 0 && x < 1600) {
      positionsFleurs.push({ x: x, y: y });
    }
  }

  // --- Les pétales qui se détachent du feuillage ---
  if (!reduireMouvement && positionsFleurs.length > 0) {
    const NOMBRE_PETALES_ARBRE = PETIT_ECRAN ? 14 : 28;

    for (let i = 0; i < NOMBRE_PETALES_ARBRE; i++) {
      const fleur = positionsFleurs[Math.floor(Math.random() * positionsFleurs.length)];
      const petale = document.createElement("span");
      const taille = aleatoire(8, 16);

      petale.className = "petale-arbre";
      petale.style.width = taille * 0.7 + "px";
      petale.style.height = taille + "px";
      petale.style.left = (fleur.x / 1600) * 100 + "%";
      petale.style.setProperty("--depart", (fleur.y / 1250) * 100 + "%");
      petale.style.setProperty("--derive", aleatoire(-140, 140) + "px");
      petale.style.animationDuration = aleatoire(8, 15) + "s, " + aleatoire(2.5, 4) + "s";
      petale.style.animationDelay = -aleatoire(0, 15) + "s, 0s";

      scene.appendChild(petale);
    }
  }

  // --- On met tout en pause quand l'accueil n'est plus visible ---
  new IntersectionObserver((entrees) => {
    entrees.forEach((entree) => {
      scene.classList.toggle("en-pause", !entree.isIntersecting);
    });
  }).observe(scene);
}

// --- Les livres de la bibliothèque : tous différents, mais toujours le même rangement ---
if (groupeLivres) {
  const hasardLivres = hasardGraine(7 + 100);

  function entreLivres(min, max) {
    return hasardLivres() * (max - min) + min;
  }

  const COULEURS_LIVRES = ["#ffd6e0", "#ffb7c5", "#cdb4db", "#fff0f5", "#f2d7a0", "#e8a0b4", "#b9a3d0", "#9a7bb5", "#d9829f"];

  // "base" = la hauteur de l'étagère, "haut" = la hauteur maximale d'un livre
  const RANGEES = [
    { base: 880, haut: 60 },
    { base: 948, haut: 54 },
    { base: 1016, haut: 54 },
    { base: 1084, haut: 54 },
    { base: 1152, haut: 54 },
  ];

  const X_GAUCHE = 45;
  const X_DROITE = 286;

  function dessinerLivre(x, largeur, base, hauteur) {
    const couleur = COULEURS_LIVRES[Math.floor(hasardLivres() * COULEURS_LIVRES.length)];

    groupeLivres.appendChild(
      creerSvg("rect", { x: x, y: base - hauteur, width: largeur, height: hauteur, rx: 1.5, fill: couleur })
    );
    // une bande en haut du dos
    groupeLivres.appendChild(
      creerSvg("rect", {
        x: x,
        y: base - hauteur + 6,
        width: largeur,
        height: 2.2,
        fill: hasardLivres() < 0.4 ? "#f2d7a0" : "rgba(255,255,255,0.5)",
      })
    );
    // l'étiquette du titre
    groupeLivres.appendChild(
      creerSvg("rect", {
        x: x + largeur * 0.25,
        y: base - hauteur * 0.55,
        width: largeur * 0.5,
        height: 7,
        rx: 1,
        fill: "rgba(26,18,38,0.28)",
      })
    );
  }

  RANGEES.forEach((rangee) => {
    let x = X_GAUCHE;

    while (true) {
      const largeur = entreLivres(8, 17);
      if (x + largeur > X_DROITE) break;

      dessinerLivre(x, largeur, rangee.base, entreLivres(rangee.haut * 0.7, rangee.haut));
      x += largeur + entreLivres(0.4, 1.2);
    }

    // Un dernier livre pour remplir le bout de l'étagère : elle est pleine
    const reste = X_DROITE - x;
    if (reste > 5) {
      dessinerLivre(x, Math.min(reste, 20), rangee.base, entreLivres(rangee.haut * 0.7, rangee.haut));
    }
  });
}
// --- Le tapis de pétales tombés sur le sol ---
const groupeSol = document.getElementById("sol-petales");

if (groupeSol) {
  const hasardSol = hasardGraine(7 + 200);

  function entreSol(min, max) {
    return hasardSol() * (max - min) + min;
  }

  const COULEURS_SOL = ["#ffd6e0", "#ffb7c5", "#ffe4ec", "#f7a8bd", "#e8b9d6"];
  const NOMBRE_PETALES_SOL = window.innerWidth < 900 ? 90 : 190;

  for (let i = 0; i < NOMBRE_PETALES_SOL; i++) {
    // Six pétales sur dix tombent près de l'arbre, les autres un peu partout
    const x = hasardSol() < 0.6 ? entreSol(950, 1550) : entreSol(0, 1600);
    const y = entreSol(1196, 1244);

    groupeSol.appendChild(
      creerSvg("ellipse", {
        cx: x,
        cy: y,
        rx: entreSol(4, 8),
        ry: entreSol(2, 3.6),
        transform: "rotate(" + entreSol(-40, 40) + " " + x + " " + y + ")",
        fill: COULEURS_SOL[Math.floor(hasardSol() * COULEURS_SOL.length)],
        opacity: entreSol(0.6, 0.95),
      })
    );
  }
}