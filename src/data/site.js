import service1 from "../assets/Services/service1.jpg";
import service2 from "../assets/Services/service2.jpg";
import service3 from "../assets/Services/service3.jpg";
import service4 from "../assets/Services/service4.jpg";
import bsustain from "../assets/Works/pic1.png";
import gimmi from "../assets/Works/pic2.png";
import invariant from "../assets/Works/pic3.png";
import marrakech from "../assets/Works/pic4.png";
import spotgov from "../assets/Works/pic5.png";
import lesson1 from "../assets/Lessons/lesson1.jpg";
import lesson2 from "../assets/Lessons/lesson2.jpg";
import lesson3 from "../assets/Lessons/lesson3.jpg";

export const nav = [
  { label: "studio", href: "#studio" },
  { label: "services", href: "#services" },
  { label: "réalisations", href: "#realisations" },
  { label: "journal", href: "#journal" },
];

export const clients = [
  "Maison Lavoie",
  "Atelier 9e",
  "Rive Gauche Co.",
  "Perrin & Fils",
  "Studio Marais",
  "Céleste",
  "Bastien Paris",
];

export const services = [
  {
    index: "01",
    title: "Sites & plateformes",
    lede: "Des sites rapides, sur-mesure, pensés pour convertir — pas des thèmes recyclés.",
    items: ["Sites vitrines", "E-commerce", "Applications web", "Refonte & migration"],
    mediaLabel: "Capture d'un site livré — écran desktop sur fond ivoire",
    ratio: "4/3",
    img: service1,
  },
  {
    index: "02",
    title: "Identité de marque",
    lede: "Un logo ne suffit pas. On construit un système que vos équipes peuvent tenir.",
    items: ["Logotype", "Charte graphique", "Direction artistique", "Print & signalétique"],
    mediaLabel: "Planche d'identité — papeterie, cartes de visite",
    ratio: "4/3",
    img: service2,
  },
  {
    index: "03",
    title: "Contenu & social",
    lede: "Photo, vidéo, montage. Assez de matière pour tenir un an de publications.",
    items: ["Shooting produit", "Vidéo courte", "Community management", "Calendrier éditorial"],
    mediaLabel: "Grille de posts Instagram — 3 visuels",
    ratio: "4/3",
    img: service3,
  },
  {
    index: "04",
    title: "Acquisition & SEO",
    lede: "Du trafic qui revient, pas du trafic qu'on loue au mois.",
    items: ["Audit technique", "Contenu SEO", "Google & Meta Ads", "Analytics"],
    mediaLabel: "Graphique d'audience — dashboard analytics",
    ratio: "4/3",
    img: service4,
  },
];

export const values = [
  {
    title: "réflexe fondateur",
    body: "Nous commençons par les enjeux qui font vraiment avancer l'entreprise : marge, délai, priorité et impact commercial. Chaque décision créative doit protéger votre budget et rendre votre prochaine étape plus évidente.",
  },
  {
    title: "exigence d'ingénieur",
    body: "Nous construisons des expériences rapides, accessibles et solides jusque dans les détails invisibles. Le code reste lisible, documenté et facile à faire évoluer, même lorsque l'équipe grandit ou que nous ne sommes plus dans la pièce.",
  },
  {
    title: "goût du détail",
    body: "Nous accordons la même attention au rythme d'une page, au kerning, à la courbe d'une transition et au poids d'un bouton. Ces choix précis créent une impression de confiance que vos clients ressentent avant même de savoir l'expliquer.",
  },
];

export const projects = [
  {
    name: "EduCenter",
    kind: "Identité + e-commerce",
    year: "2025",
    mediaLabel: "Projet 1 — visuel principal, format paysage 16/10",
    img: bsustain,
  },
  {
    name: "BarberTools",
    kind: "Site vitrine",
    year: "2025",
    mediaLabel: "Projet 2 — visuel principal, format paysage 16/10",
    img: gimmi,
  },
  {
    name: "Invariant",
    kind: "Direction artistique",
    year: "2024",
    mediaLabel: "Projet 3 — visuel principal, format paysage 16/10",
    img: invariant,
  },
  {
    name: "Evora",
    kind: "Refonte + SEO",
    year: "2024",
    mediaLabel: "Projet 4 — visuel principal, format paysage 16/10",
    img: marrakech,
  },
  {
    name: "NexusAI",
    kind: "Application web",
    year: "2024",
    mediaLabel: "Projet 5 — visuel principal, format paysage 16/10",
    img: spotgov,
  },
];

export const testimonials = [
  {
    quote:
      "On est passés d'un site qu'on n'osait plus montrer à un site qu'on envoie en premier. Les demandes entrantes ont doublé en un trimestre.",
    author: "Camille Lavoie",
    role: "Fondatrice, Maison Lavoie",
  },
  {
    quote:
      "Ils ont posé les bonnes questions avant de dessiner quoi que ce soit. C'est rare et ça change tout.",
    author: "Idriss Benali",
    role: "Directeur, Atelier 9e",
  },
  {
    quote:
      "Livré dans les délais, au budget annoncé, et l'équipe a repris la main sans difficulté.",
    author: "Sophie Perrin",
    role: "Perrin & Fils",
  },
];

export const journal = [
  {
    tag: "Direction artistique",
    title: "Pourquoi la pierre parisienne fait une meilleure palette que le bleu-blanc-rouge",
    read: "6 min",
    mediaLabel: "Article 1 — image de couverture, format paysage",
    img: lesson1,
  },
  {
    tag: "Performance",
    title: "Un site sous la seconde : ce que ça coûte vraiment et ce que ça rapporte",
    read: "8 min",
    mediaLabel: "Article 2 — image de couverture, format paysage",
    img: lesson2,
  },
  {
    tag: "Méthode",
    title: "Le brief en une page qu'on demande à chaque client avant de commencer",
    read: "4 min",
    mediaLabel: "Article 3 — image de couverture, format paysage",
    img: lesson3,
  },
];

export const contact = {
  address: ["Nova Business", "12 rue du Faubourg", "75011 Paris", "France"],
  email: "bonjour@novabusiness.fr",
  phone: "+33 1 84 80 00 00",
  socials: [
    { label: "Instagram", href: "#" },
    { label: "LinkedIn", href: "#" },
    { label: "Behance", href: "#" },
  ],
};
