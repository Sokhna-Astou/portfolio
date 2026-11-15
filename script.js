// Le conteneur où on va ajouter les pétales
const conteneur = document.querySelector(".petales");

// Combien de pétales on veut
const NOMBRE_PETALES = 25;

// Petite fonction qui donne un nombre au hasard entre min et max
function aleatoire(min, max) {
  return Math.random() * (max - min) + min;
}

// On répète la recette 25 fois
for (let i = 0; i < NOMBRE_PETALES; i++) {
  // 1. On crée un pétale
  const petale = document.createElement("span");
  petale.classList.add("petale");

  // 2. On lui donne une taille au hasard
  const taille = aleatoire(10, 22);
  petale.style.width = taille * 0.7 + "px";
  petale.style.height = taille + "px";

  // 3. Une position, une vitesse et un balancement au hasard
  petale.style.left = aleatoire(0, 100) + "vw";
  petale.style.animationDuration = aleatoire(8, 16) + "s";
  petale.style.animationDelay = aleatoire(-16, 0) + "s";
  petale.style.setProperty("--balancement", aleatoire(-90, 90) + "px");

  // 4. On l'ajoute à la page
  conteneur.appendChild(petale);
}