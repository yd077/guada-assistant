
Corriger la page d’accueil en ciblant d’abord les deux causes visibles du bug, puis rehausser le rendu premium sans fragiliser la lisibilité.

1. Réparer immédiatement le hero
- Restaurer le vrai texte du `h1` dans `src/routes/index.tsx` : il a été remplacé par `...`, ce qui explique la disparition du titre.
- Vérifier tout le bloc hero (badge, titre, paragraphe, formulaire, trust badges) pour s’assurer qu’aucun autre contenu n’a été tronqué.
- Garder la hiérarchie visuelle forte avec un titre clair, lisible et centré.

2. Supprimer la cause du texte “grésillé”
- Revoir le rendu du hero pour que le texte ne soit plus composité au-dessus d’effets agressifs.
- Éviter les combinaisons qui dégradent le rendu des glyphes dans cette zone : overlays trop lourds, blur excessif autour du texte, ombres trop diffuses, couches animées trop proches visuellement du contenu.
- Remplacer le traitement actuel par une structure plus propre :
  - diaporama en fond seul,
  - overlays de contraste séparés,
  - contenu texte sur une couche dédiée stable et nette.
- Conserver uniquement un `text-shadow` léger et précis, sans effet susceptible de repixelliser le texte.

3. Fiabiliser le diaporama en arrière-plan
- Ajuster `src/components/site/HeroSlideshow.tsx` pour que les images restent bien visibles derrière le contenu.
- Renforcer la séparation entre :
  - couche image,
  - couche overlays,
  - couche contenu.
- Conserver l’effet Ken Burns, mais l’appliquer uniquement aux images, jamais aux conteneurs de texte.
- Garder des transitions fluides entre slides avec opacité progressive et timing harmonisé.

4. Améliorer la lisibilité globale du hero
- Ajouter un voile de contraste premium derrière la zone centrale du texte, plus subtil qu’un simple assombrissement global.
- Recalibrer les opacités des overlays pour laisser vivre les images tout en gardant le texte parfaitement lisible.
- Affiner la largeur du bloc texte et les espacements verticaux pour donner plus de respiration.
- Vérifier le contraste du formulaire de recherche pour qu’il reste élégant mais immédiatement lisible.

5. Rendre la home plus premium
- Raffiner les finitions du hero :
  - badge plus discret et plus luxueux,
  - meilleur équilibre entre titre, sous-titre et formulaire,
  - indicateurs du slideshow plus haut de gamme.
- Harmoniser les sections juste sous le hero pour que la montée en gamme soit cohérente :
  - bande KPI plus raffinée,
  - cartes métiers plus nettes,
  - transitions d’espacement plus élégantes entre sections.
- Garder le style premium existant, mais avec moins d’effets “forcés” et plus de sobriété.

6. Fichiers concernés
- `src/routes/index.tsx`
- `src/components/site/HeroSlideshow.tsx`
- `src/styles.css`

Détails techniques
- Cause la plus probable du titre disparu : le contenu du `h1` a été remplacé par `...` dans `src/routes/index.tsx`.
- Cause probable du crénelage : le texte du hero est rendu au-dessus de plusieurs couches visuelles fortes, avec un traitement qui nuit au rendu net.
- La correction visera un empilement propre :
```text
Hero section
├─ Slideshow images (animées)
├─ Overlays de contraste (fixes)
└─ Contenu texte + formulaire (couche nette, stable, lisible)
```
- Les animations resteront sur les images et les blocs, pas sur le rendu typographique lui-même.
