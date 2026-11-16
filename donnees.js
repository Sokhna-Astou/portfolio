// =====================================================
//  TOUT TON CONTENU EST ICI
//  Pour ajouter quelque chose : copie une ligne et modifie-la.
//  Attention : garde les guillemets "..." et les virgules entre les éléments.
// =====================================================
// ---------- TES LIENS ----------
// Laisse "" tant que tu n'as pas le lien : le bouton ne s'affiche pas.
const LIENS = {
  email: "binthussein2801@gmail.com",
  linkedin: "", // exemple : "https://www.linkedin.com/in/ton-profil"
  cv: "", // exemple : "cv/CV-Sokhna-Astou-Diagne.pdf"
  github: "https://github.com/Sokhna-Astou",
};

// ---------- FORMATION (du plus récent au plus ancien) ----------
// lieu et detail sont facultatifs : laisse "" pour ne rien afficher
const FORMATIONS = [
  {
    titre: "Master 1 MIAGE",
    lieu: "UFR SEG, Université Gaston Berger (Saint-Louis)",
    periode: "En cours",
    detail: "Méthodes informatiques appliquées à la gestion des entreprises",
  },
  {
    titre: "Licence MIAGE",
    lieu: "UFR SAT, Université Gaston Berger (Saint-Louis)",
    periode: "Diplôme obtenu", // À MODIFIER : mets les années, par exemple "2023 – 2026"
    detail: "Méthodes informatiques appliquées à la gestion des entreprises",
  },
  {
    titre: "Baccalauréat, série S2 (sciences expérimentales)",
    lieu: "",
    periode: "2023", // À VÉRIFIER
    detail: "",
  },
];

// ---------- COMPÉTENCES ----------
// Garde uniquement ce que tu maîtrises vraiment. Chaque catégorie peut avoir autant de pastilles que tu veux.
const COMPETENCES = [
  { categorie: "Langages", items: ["Java", "C++", "SQL", "PL/SQL", "R", "HTML / CSS / JavaScript"] },
  { categorie: "Bases de données", items: ["Oracle", "MySQL", "PostgreSQL", "MS Access"] },
  { categorie: "Développement", items: ["Java Swing / JavaFX", "JDBC", "Oracle APEX"] },
  { categorie: "Conception", items: ["UML", "Merise", "PlantUML", "Cahier des charges"] },
  { categorie: "Outils", items: ["Git, GitHub", "VS Code"] },
  { categorie: "Gestion de projet", items: ["Cadre logique", "Planification", "Budget prévisionnel", "Feuille de route"] },
  { categorie: "Organisation et leadership", items: ["Organisation d'événements", "Coordination d'équipe", "Communication", "Gestion du temps"] },
  { categorie: "Analyse et décision", items: ["Analyse de données (R, ACP)", "Recherche opérationnelle", "Gestion des ressources humaines"] },
];

// Ta ligne de langues, par exemple : "Français (courant) · Anglais (intermédiaire)"
// Laisse "" pour ne rien afficher.
const LANGUES = "";

// ---------- PROJETS ----------
// lien : l'adresse GitHub du projet. Laisse "" s'il n'y en a pas encore (le lien ne s'affiche pas).
const PROJETS = [
  {
    titre: "Gestion des thèses et mémoires",
    description: "Application pour gérer les thèses et mémoires d'un centre de documentation.",
    tags: ["Java", "MySQL", "JDBC"],
    lien: "",
  },
  {
    titre: "Business Management",
    description: "Application de gestion d'entreprise avec une base de données et des règles métier.",
    tags: ["Oracle", "APEX", "PL/SQL"],
    lien: "",
  },
  {
    titre: "Plateforme de signalement",
    description: "Conception d'une plateforme pour un environnement universitaire sûr et inclusif.",
    tags: ["UML", "Génie logiciel", "Cahier des charges"],
    lien: "",
  },
];

// ---------- ENGAGEMENT ----------
// À MODIFIER : décris ce que tu fais vraiment, avec tes mots
const ENGAGEMENTS = [
  {
    icone: "★",
    role: "Présidente de la commission d'organisation",
    structure: "Club MIAGE",
    periode: "En cours",
    description:
      "Je pilote la commission qui organise les activités et les événements du club : planification, répartition des tâches entre les membres, suivi de la logistique et du budget.",
    tags: ["Leadership", "Organisation d'événements", "Coordination d'équipe"],
  },
  {
    icone: "✦",
    role: "Adjointe de la commission d'organisation",
    structure: "Club MASS",
    periode: "Mandat précédent",
    description:
      "J'ai accompagné la responsable de la commission dans l'organisation des événements du club, en coordonnant les membres et en suivant les préparatifs.",
    tags: ["Organisation", "Travail en équipe"],
  },
];

// ---------- PASSIONS (les cartes) ----------
// "chiffres" est facultatif : des petites tuiles avec un chiffre (laisse [] pour ne rien afficher).
// Exemple : chiffres: [{ valeur: "12", legende: "livres lus cette année" }]
const PASSIONS = [
  {
    icone: "📖",
    titre: "Lecture",
    // À MODIFIER : pourquoi tu aimes lire, ce que ça t'apporte, ce que tu aimes lire
    texte:
      "Lire m'aide à prendre du recul, à nourrir ma curiosité et à trouver des idées, pour mes études comme pour mes projets.",
    chiffres: [],
  },
  {
    icone: "📸",
    titre: "Photographie",
    texte:
      "Pas besoin d'un gros appareil : mon téléphone et un regard attentif suffisent pour garder les petits instants qui me touchent.",
    chiffres: [],
  },
];

// ---------- PHOTOS ----------
// 1. Réduis ta photo (squoosh.app, moins de 400 Ko) et mets-la dans le dossier "images"
// 2. Ajoute une ligne comme les exemples ci-dessous (enlève les // devant)
//    - fichier : le chemin de la photo
//    - legende : le petit titre sous la photo
//    - description : décris ce qu'on voit (pour les personnes qui ne voient pas l'image)
const PHOTOS = [
  // { fichier: "images/photo-1.jpg", legende: "Titre court", description: "Décris ce qu'on voit" },
  // { fichier: "images/photo-2.jpg", legende: "Titre court", description: "Décris ce qu'on voit" },
  // { fichier: "images/photo-3.jpg", legende: "Titre court", description: "Décris ce qu'on voit" },
];