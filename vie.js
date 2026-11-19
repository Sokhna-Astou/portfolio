// =====================================================
//  UN DÉCOR VIVANT : écrans animés, objets cliquables,
//  profondeur à la souris, lucioles et nuages.
//  Ce fichier s'ajoute à script.js : il ne le remplace pas.
// =====================================================
(function () {
  "use strict";

  const svg = document.getElementById("scene-svg");
  const scene = document.getElementById("scene");
  if (!svg || !scene) return;

  const NS = "http://www.w3.org/2000/svg";
  const reduireMouvement = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const avecSouris = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // =====================================================
  //  1. TES RÉGLAGES
  // =====================================================

  // Les objets sur lesquels on peut cliquer.
  //   id      : le nom de l'objet dans le dessin
  //   section : la section vers laquelle on glisse (formation, competences, projets, engagement, passions, contact)
  const OBJETS_CLIQUABLES = [
    { id: "bibliotheque", section: "passions", icone: "📖", titre: "Passions", texte: "Lecture et photographie" },
    { id: "ecran-code", section: "competences", icone: "💻", titre: "Compétences", texte: "Code et gestion" },
    { id: "ecran-mode", section: "projets", icone: "👗", titre: "Projets", texte: "Ce que j'ai construit" },
    { id: "ecran-palette", section: "competences", icone: "🎨", titre: "Compétences", texte: "Design et créativité" },
    { id: "accessoires", section: "contact", icone: "☕", titre: "Contact", texte: "Un café et on discute ?" },
    { id: "vie-arbre-zone", section: "formation", icone: "🌸", titre: "Formation", texte: "Mon parcours" },
  ];

  // L'effet de profondeur à la souris : de combien chaque couche bouge [horizontal, vertical], en unités du dessin
  const PROFONDEUR = {
    loin: [8, 4], // l'arbre
    biblio: [15, 7], // la bibliothèque
    objets: [22, 9], // le bureau et les écrans
    sol: [30, 12], // les pétales au sol
  };

  const VITESSE_CODE = 28; // caractères tapés par seconde
  const PAUSE_CODE = 4000; // pause avant de recommencer, en millisecondes
  const NB_LUCIOLES = 16;
  const NB_NUAGES = 4;

  // =====================================================
  //  2. LES OUTILS
  // =====================================================
  const aleatoire = (min, max) => Math.random() * (max - min) + min;

  // Crée un élément SVG avec ses attributs
  function creer(nom, attributs, parent) {
    const element = document.createElementNS(NS, nom);
    for (const cle in attributs) element.setAttribute(cle, attributs[cle]);
    if (parent) parent.appendChild(element);
    return element;
  }

  // Savoir si le décor est à l'écran, pour ne pas animer pour rien
  let sceneVisible = true;
  new IntersectionObserver((entrees) => {
    sceneVisible = entrees[0].isIntersecting;
  }).observe(scene);

  // =====================================================
  //  3. LES COUCHES DE PROFONDEUR
  // =====================================================
  // On range les éléments du dessin dans des "couches" qu'on fait bouger à des vitesses différentes.
  function envelopper(elements, id) {
    const presents = elements.filter(Boolean);
    if (presents.length === 0) return null;

    const groupe = creer("g", { id: id });
    presents[0].parentNode.insertBefore(groupe, presents[0]);
    presents.forEach((element) => groupe.appendChild(element));
    return groupe;
  }

  const enfants = Array.from(svg.children);
  const rangCanopee = enfants.findIndex((e) => e.id === "canopee");
  const rangBiblio = enfants.findIndex((e) => e.id === "bibliotheque");

  let coucheLoin = null;
  let coucheObjets = null;
  let coucheBiblio = null;
  let coucheSol = null;

  if (rangCanopee >= 0 && rangBiblio > rangCanopee) {
    const objets = enfants.slice(rangCanopee + 1, rangBiblio);

    coucheLoin = envelopper([document.getElementById("arbre"), document.getElementById("canopee")], "vie-loin");
    coucheObjets = envelopper(objets, "vie-objets");
    coucheBiblio = envelopper([document.getElementById("bibliotheque")], "vie-biblio");
    coucheSol = envelopper([document.getElementById("sol-petales")], "vie-sol");
  }

  // =====================================================
  //  4. L'ARBRE : une zone invisible sur le tronc, et un halo
  // =====================================================
  const groupeArbre = document.getElementById("arbre");
  let haloArbre = null;

  if (groupeArbre) {
    haloArbre = creer("ellipse", {
      id: "vie-arbre-halo",
      cx: 1250,
      cy: 950,
      rx: 200,
      ry: 300,
      fill: "url(#sc-lueur)",
    });
    groupeArbre.insertBefore(haloArbre, groupeArbre.firstChild); // derrière le tronc

    creer("rect", { id: "vie-arbre-zone", x: 1120, y: 690, width: 260, height: 520, fill: "transparent" }, groupeArbre);
  }

  // =====================================================
  //  5. LES OBJETS CLIQUABLES ET LEUR ÉTIQUETTE
  // =====================================================
  const info = document.createElement("div");
  info.className = "info-objet";
  info.setAttribute("aria-hidden", "true");
  info.innerHTML = "<strong></strong><span></span>";
  document.body.appendChild(info);

  const titreInfo = info.querySelector("strong");
  const texteInfo = info.querySelector("span");

  function deplacerInfo(x, y) {
    const largeur = info.offsetWidth;
    const gauche = Math.min(x + 16, window.innerWidth - largeur - 10);
    info.style.transform = "translate(" + Math.max(gauche, 10) + "px, " + (y + 18) + "px)";
  }

  function montrerInfo(objet, x, y) {
    titreInfo.textContent = objet.icone + "  " + objet.titre;
    texteInfo.textContent = objet.texte;
    info.classList.add("visible");
    deplacerInfo(x, y);

    if (objet.id === "vie-arbre-zone" && haloArbre) haloArbre.style.opacity = "0.85";
  }

  function cacherInfo(objet) {
    info.classList.remove("visible");
    if (objet.id === "vie-arbre-zone" && haloArbre) haloArbre.style.opacity = "0";
  }

  // Un clic : on glisse vers la section
  function activer(objet) {
    const cible = document.getElementById(objet.section);
    if (cible) cible.scrollIntoView({ behavior: reduireMouvement ? "auto" : "smooth", block: "start" });
  }

  OBJETS_CLIQUABLES.forEach((objet) => {
    const element = document.getElementById(objet.id);
    if (!element) return;

    element.classList.add("objet-cliquable");
    element.setAttribute("tabindex", "0");
    element.setAttribute("role", "link");
    element.setAttribute("aria-label", objet.titre + " : " + objet.texte);

    element.addEventListener("pointerenter", (e) => montrerInfo(objet, e.clientX, e.clientY));
    element.addEventListener("pointermove", (e) => deplacerInfo(e.clientX, e.clientY));
    element.addEventListener("pointerleave", () => cacherInfo(objet));

    // Au clavier
    element.addEventListener("focus", () => {
      const zone = element.getBoundingClientRect();
      montrerInfo(objet, zone.left + zone.width / 2, zone.top);
    });
    element.addEventListener("blur", () => cacherInfo(objet));
    element.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        activer(objet);
      }
    });

    element.addEventListener("click", () => activer(objet));
  });

  // =====================================================
  //  6. LE CODE QUI SE TAPE TOUT SEUL (écran de gauche)
  // =====================================================
  function machineAEcrire() {
    const groupe = document.getElementById("ecran-code");
    if (!groupe) return;

    const curseur = groupe.querySelector(".curseur");

    // Chaque ligne de code est découpée en morceaux de couleur (les "tspan")
    const lignes = Array.from(groupe.querySelectorAll('text[x="361"]')).map((texte) => {
      const morceauxCouleur = Array.from(texte.querySelectorAll("tspan"));
      const morceaux = (morceauxCouleur.length > 0 ? morceauxCouleur : [texte]).map((element) => ({
        element: element,
        complet: element.textContent,
      }));

      return {
        texte: texte,
        morceaux: morceaux,
        longueur: morceaux.reduce((somme, m) => somme + m.complet.length, 0),
        y: parseFloat(texte.getAttribute("y")),
      };
    });

    if (lignes.length === 0 || !curseur) return;

    const total = lignes.reduce((somme, ligne) => somme + ligne.longueur, 0);
    let dernierAffiche = -1;

    // Affiche les n premiers caractères du code, ligne après ligne
    function rendre(n) {
      if (n === dernierAffiche) return;
      dernierAffiche = n;

      let restant = n;
      let ligneActive = 0;

      lignes.forEach((ligne, index) => {
        let pourCetteLigne = Math.max(0, Math.min(restant, ligne.longueur));
        if (pourCetteLigne > 0) ligneActive = index;
        restant -= ligne.longueur;

        ligne.morceaux.forEach((morceau) => {
          const nb = Math.min(pourCetteLigne, morceau.complet.length);
          morceau.element.textContent = morceau.complet.slice(0, nb);
          pourCetteLigne -= nb;
        });
      });

      // Le curseur suit la fin de la ligne qu'on est en train de taper
      const ligne = lignes[ligneActive];
      let xFin = 361;
      const nbCaracteres = ligne.texte.getNumberOfChars();
      if (nbCaracteres > 0) {
        try {
          xFin = ligne.texte.getEndPositionOfChar(nbCaracteres - 1).x;
        } catch (erreur) {
          // on garde la position de départ
        }
      }
      curseur.setAttribute("x", xFin + 1);
      curseur.setAttribute("y", ligne.y - 5.6);
    }

    if (reduireMouvement) {
      rendre(total);
      return;
    }

    let debut = performance.now();
    const dureeFrappe = (total / VITESSE_CODE) * 1000;
    const PAUSE_DEPART = 700;

    function image(maintenant) {
      if (sceneVisible) {
        const ecoule = maintenant - debut;

        if (ecoule < PAUSE_DEPART) {
          rendre(0);
        } else if (ecoule < PAUSE_DEPART + dureeFrappe) {
          rendre(Math.floor(((ecoule - PAUSE_DEPART) / 1000) * VITESSE_CODE));
        } else if (ecoule < PAUSE_DEPART + dureeFrappe + PAUSE_CODE) {
          rendre(total);
        } else {
          debut = maintenant; // on recommence
        }
      }
      requestAnimationFrame(image);
    }

    requestAnimationFrame(image);
  }

  machineAEcrire();

  // =====================================================
  //  7. LA PROFONDEUR À LA SOURIS
  // =====================================================
  const couches = [
    { element: coucheLoin, amplitude: PROFONDEUR.loin },
    { element: coucheBiblio, amplitude: PROFONDEUR.biblio },
    { element: coucheObjets, amplitude: PROFONDEUR.objets },
    { element: coucheSol, amplitude: PROFONDEUR.sol },
  ].filter((couche) => couche.element);

  let cibleX = 0;
  let cibleY = 0;
  let positionX = 0;
  let positionY = 0;
  let boucleActive = false;

  function animerProfondeur() {
    // On rattrape doucement la position de la souris
    positionX += (cibleX - positionX) * 0.08;
    positionY += (cibleY - positionY) * 0.08;

    couches.forEach((couche) => {
      const dx = -positionX * couche.amplitude[0];
      const dy = -positionY * couche.amplitude[1];
      couche.element.style.transform = "translate(" + dx.toFixed(2) + "px, " + dy.toFixed(2) + "px)";
    });

    if (Math.abs(cibleX - positionX) > 0.001 || Math.abs(cibleY - positionY) > 0.001) {
      requestAnimationFrame(animerProfondeur);
    } else {
      boucleActive = false;
    }
  }

  if (avecSouris && !reduireMouvement && couches.length > 0) {
    window.addEventListener(
      "pointermove",
      (evenement) => {
        if (!sceneVisible) return;
        cibleX = (evenement.clientX / window.innerWidth) * 2 - 1; // de -1 (gauche) à 1 (droite)
        cibleY = (evenement.clientY / window.innerHeight) * 2 - 1;

        if (!boucleActive) {
          boucleActive = true;
          requestAnimationFrame(animerProfondeur);
        }
      },
      { passive: true }
    );
  }

  // =====================================================
  //  8. LES LUCIOLES, LES NUAGES ET LA PETITE ASTUCE
  // =====================================================
  if (!reduireMouvement) {
    for (let i = 0; i < NB_LUCIOLES; i++) {
      const luciole = document.createElement("span");
      luciole.className = "luciole";
      luciole.style.left = aleatoire(6, 96) + "%";
      luciole.style.top = aleatoire(55, 94) + "%";
      luciole.style.setProperty("--dx", aleatoire(-45, 45) + "px");
      luciole.style.setProperty("--dy", aleatoire(-70, -10) + "px");
      luciole.style.setProperty("--duree", aleatoire(8, 14) + "s");
      luciole.style.setProperty("--delai", -aleatoire(0, 12) + "s");
      scene.appendChild(luciole);
    }

    const ciel = document.getElementById("ciel");
    if (ciel) {
      for (let i = 0; i < NB_NUAGES; i++) {
        const nuage = document.createElement("div");
        const duree = aleatoire(150, 260);

        nuage.className = "nuage";
        nuage.style.width = aleatoire(26, 42) + "vw";
        nuage.style.height = aleatoire(5, 9) + "vw";
        nuage.style.top = aleatoire(6, 46) + "%";
        nuage.style.setProperty("--duree", duree + "s");
        nuage.style.setProperty("--delai", -aleatoire(0, duree) + "s");
        ciel.appendChild(nuage);
      }
    }
  }

  // Un petit mot sous le bouton, pour inviter à explorer
  const colonneTexte = document.querySelector(".hero-texte");
  if (colonneTexte) {
    const astuce = document.createElement("p");
    astuce.className = "astuce";
    astuce.textContent = avecSouris ? "✦ Survole les objets du décor" : "✦ Touche les objets du décor";
    colonneTexte.appendChild(astuce);
  }

  // L'anneau qui désigne la couleur choisie, sur l'écran du milieu
  const ecranMode = document.getElementById("ecran-mode");
  if (ecranMode) {
    creer(
      "circle",
      { class: "anneau-couleur", cx: 568, cy: 872, r: 5.4, fill: "none", stroke: "#5a3d4f", "stroke-width": 0.9 },
      ecranMode
    );
  }
})();