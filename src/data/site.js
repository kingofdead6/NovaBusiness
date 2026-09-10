/*
  LES ILLUSTRATIONS SONT DÉTOURÉES.

  Les fichiers d'origine étaient des gravures peintes en BRONZE et OR — la
  palette d'avant. Le §04 est catégorique : « le site n'a jamais plus de deux
  couleurs à l'écran en même temps ».

  On leur a donc appliqué le traitement des planches : la clarté de chaque
  pixel est devenue son canal alpha, si bien qu'il ne reste qu'un TRAIT SUR
  RIEN. Elles se peignent maintenant dans l'encre courante et suivent les deux
  fonds, exactement comme les planches d'astronomie — ce que le §05 demande
  (« une seule couleur de trait, deux états »).
*/
import service1 from "../assets/plates/oeuvres/service1-trait.png";
import service2 from "../assets/plates/oeuvres/service2-trait.png";
import service3 from "../assets/plates/oeuvres/service3-trait.png";
import service4 from "../assets/plates/oeuvres/service4-trait.png";
import bsustain from "../assets/plates/oeuvres/pic1-trait.png";
import gimmi from "../assets/plates/oeuvres/pic2-trait.png";
import invariant from "../assets/plates/oeuvres/pic3-trait.png";
import marrakech from "../assets/plates/oeuvres/pic4-trait.png";
import spotgov from "../assets/plates/oeuvres/pic5-trait.png";
import lesson1 from "../assets/plates/oeuvres/lesson1-trait.png";
import lesson2 from "../assets/plates/oeuvres/lesson2-trait.png";
import lesson3 from "../assets/plates/oeuvres/lesson3-trait.png";

export const nav = [
  { label: "studio", href: "#studio" },
  { label: "services", href: "#services" },
  { label: "réalisations", href: "#realisations" },
  { label: "journal", href: "#journal" },
];

/*
  Les vrais clients de l'agence (§01). Ils ne sont PAS rendus en logos :
  le §09 interdit la rangée de logos alignés. Ils sont posés en une ligne
  de texte, en voix secondaire, dans le bas du hero — la preuve à voix
  basse de huyml.co.
*/
export const clients = [
  "GoJob",
  "Akeneo",
  "Clic Campus",
  "Skilleos",
  "SIMONE",
  "Kâri Finance",
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
