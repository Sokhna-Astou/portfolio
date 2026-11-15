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
  // On considère une section "visible" quand elle passe au milieu de l'écran
  { rootMargin: "-40% 0px -55% 0px" }
);

sections.forEach((section) => observateur.observe(section));