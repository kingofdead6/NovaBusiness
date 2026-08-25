# Nova Business — page d'accueil

Page d'accueil animée pour une agence de services digitaux (Paris).
React + Vite + Tailwind, animations GSAP (ScrollTrigger) + Framer Motion + anime.js, scroll fluide Lenis.

## Démarrer

```bash
npm install
npm run dev
```

## Palette (tailwind.config.js)

| Token | Hex | Rôle |
| --- | --- | --- |
| `charbon` | `#1C1C1C` | header, footer, sections fortes, titres |
| `ivoire` | `#F5F0E8` | fond principal |
| `bronze` | `#8A6045` | couleur signature : CTA, liens, interactif |
| `dore` | `#C9A86A` | accents premium, hover, icônes |
| `pierre` | `#8C8780` | textes secondaires |
| `blanc` | `#FFFFFF` | cartes, contraste |

Répartition tenue dans le code : ~60 % ivoire, 25 % charbon, 10 % bronze, 5 % doré.

## Où mettre les images

Aucune image n'est codée en dur. Chaque emplacement est un `<Media />` qui affiche un
cadre pointillé avec le ratio attendu et une description de l'image à fournir.

Pour remplir un emplacement, ajoutez `src` :

```jsx
<Media
  src="/images/hero-gauche.jpg"
  alt="Façade haussmannienne, rue de Rivoli"
  ratio="3/5"
  parallax={8}
  label="Visuel gauche"
/>
```

Mettez vos fichiers dans `public/images/`. Les textes de tous les emplacements sont
centralisés dans `src/data/site.js` (clés `mediaLabel`).

Props de `<Media />` :

- `src`, `alt` — l'image finale
- `ratio` — `"16/10"`, `"4/5"`, `"1/1"`…
- `parallax` — décalage vertical au scroll en % (`0` = désactivé)
- `tone` — `"light"` (sur ivoire) ou `"dark"` (sur charbon)
- `rounded` — classes de border-radius

Les logos clients sont du texte dans `src/components/sections/Clients.jsx` : remplacez
le `<span>` par une `<img>` quand vous aurez les SVG.

## Structure

```
src/
  App.jsx                    ordre des sections
  data/site.js               TOUT le contenu éditable (textes, projets, avis…)
  lib/text.js                découpage mots/lettres pour les animations
  components/
    SmoothScroll.jsx         Lenis synchronisé avec ScrollTrigger
    Preloader.jsx            compteur + tracé du logo (anime.js)
    Cursor.jsx               curseur maison (data-cursor / data-cursor-text)
    Navbar.jsx               barre flottante en pilule
    MagneticButton.jsx       bouton magnétique (Framer Motion)
    Media.jsx                EMPLACEMENT IMAGE + parallaxe
    sections/
      Hero.jsx               01  titre cinétique
      Clients.jsx            02  bandeau logos
      Takeover.jsx           03  basculement ivoire → charbon  ★ signature
      Values.jsx             04  trois cartes décalées
      Services.jsx           05  cartes empilées (sticky)
      Work.jsx               06  carrousel 3D
      Marquee.jsx            07  bandeau défilant
      Process.jsx            08  déroulé 8 semaines + compteurs
      Testimonials.jsx       09  avis clients
      SplitCta.jsx           10  double appel à l'action
      Journal.jsx            11  articles
      Footer.jsx             12  nom géant + contact
```

## Répartition des librairies

- **GSAP + ScrollTrigger** — tout ce qui dépend du scroll : voile du basculement, parallaxe, empilement des services, barre de progression, révélation des titres.
- **Framer Motion** — état et interactions : navbar, carrousel 3D, avis, boutons magnétiques, entrées `whileInView`.
- **anime.js** — séquences chronométrées : préchargeur, composition lettre par lettre du mot « nova. », compteurs.

## Notes

- `animejs` est volontairement figé en **3.2.2** (la v4 change l'API : `import { animate }`).
- `prefers-reduced-motion` est respecté partout : les animations sont court-circuitées, pas seulement ralenties.
- Le curseur maison ne s'active que sur pointeur fin (souris) : pas d'effet sur mobile.
- Après changement de police ou de contenu, `ScrollTrigger.refresh()` est déjà appelé au chargement des polices (`App.jsx`).
