// ---------- 1. LES PÉTALES QUI TOMBENT ----------
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
// Les lettres apparaissent de gauche à droite, à la place de symboles qui scintillent
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
        resultat += texte[i]; // lettre déjà révélée
      } else {
        resultat += SYMBOLES[Math.floor(Math.random() * SYMBOLES.length)]; // symbole au hasard
      }
    }

    element.textContent = resultat;

    if (progres < 1) {
      requestAnimationFrame(image);
    }
  }

  requestAnimationFrame(image);
}

// ---------- 4. L'ÉCRAN D'INTRO : COMPTEUR, FÉE, PUIS FONDU ----------
const DUREE_COMPTE = 8000; // durée du comptage, en millisecondes

const intro = document.getElementById("intro");
const chiffres = document.querySelectorAll("#intro-compteur span");
const labelIntro = document.getElementById("intro-label");
const fee = document.getElementById("intro-fee");

let termine = false;
let animationCompteur;
let animationFee;
let traine;

// Une courbe qui démarre doucement, accélère, puis ralentit à la fin
function facile(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Affiche un nombre sur 3 chiffres (7 devient 007) et règle la lueur rose
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
  if (termine) return; // on ne le fait qu'une seule fois
  termine = true;
  cancelAnimationFrame(animationCompteur);

  afficher(100);
  intro.classList.add("ouverture"); // les textes s'effacent, puis la page s'éclaircit en douceur

  // L'accueil commence à apparaître pendant le fondu
  setTimeout(() => {
    document.body.classList.remove("chargement");
    decoderAccueil();
  }, 900);

  // Une fois le fondu terminé, on retire l'écran (et la fée s'arrête)
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
      setTimeout(ouvrirIntro, 500); // petite pause sur 100, puis fondu
    }
  }

  animationCompteur = requestAnimationFrame(image);

  // --- La fée : un vol au hasard, sans trajectoire fixe ---
  let feeX = -150; // elle entre par la gauche
  let feeY = window.innerHeight * 0.3;
  let vitX = 4;
  let vitY = 0;
  let cibleX = window.innerWidth * 0.3;
  let cibleY = window.innerHeight * 0.3;
  let prochainChangement = 0;

  function voler(maintenant) {
    // De temps en temps, elle choisit une nouvelle destination au hasard
    if (maintenant > prochainChangement) {
      cibleX = aleatoire(window.innerWidth * 0.08, window.innerWidth * 0.85);
      cibleY = aleatoire(window.innerHeight * 0.1, window.innerHeight * 0.75);
      prochainChangement = maintenant + aleatoire(900, 2200);
    }

    // Elle est attirée doucement vers sa destination, avec un petit frémissement
    vitX += (cibleX - feeX) * 0.0006 + aleatoire(-0.05, 0.05);
    vitY += (cibleY - feeY) * 0.0006 + aleatoire(-0.05, 0.05) + Math.sin(maintenant / 160) * 0.04;

    // Frottement de l'air : elle ralentit d'elle-même
    vitX *= 0.975;
    vitY *= 0.975;

    feeX += vitX;
    feeY += vitY;

    // Elle s'incline dans le sens où elle avance
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

  // --- Passer l'intro : un clic ou n'importe quelle touche ---
  intro.addEventListener("click", ouvrirIntro);
  document.addEventListener("keydown", ouvrirIntro, { once: true });
}

// ---------- 5. LES TITRES SE DÉCRYPTENT AU DÉFILEMENT ----------
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

// ---------- 6. FONDU LÉGER POUR CARTES, LIVRES ET PHOTOS ----------
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