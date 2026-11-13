# ADR-0004 : Système de Design Hybride Mobile/Desktop & Architecture UI

## Statut
Accepté

## Date
2026-11-13

## Contexte
Les logiciels médicaux sont utilisés dans deux contextes très différents :
- **Poste d’accueil / Secrétariat (Desktop `1024px` – `1440px+`)** : besoin de densité d’information, tableaux multi-colonnes, navigation latérale fixe et filtres rapides.
- **Déplacement en clinique / Tablette & Smartphone (`390px` – `768px`)** : besoin de cibles tactiles larges ($\ge 44\text{px}$), absence totale de défilement horizontal (`overflow-x`), et navigation accessible au pouce.

## Décision
Adopter une architecture UI hybride fondée sur **Tailwind CSS v4** et les principes `design-taste-frontend` + `mobile-responsiveness` :
1. **Navigation Adaptative (`AppLayout.tsx`)** :
   - Sur Desktop (`lg:` $\ge 1024\text{px}$) : Barre latérale architecturale fixe (`272px`) + barre de contexte supérieure.
   - Sur Mobile (`< 1024\text{px}$) : En-tête supérieur compact + barre de navigation inférieure fixe (`bottom-0`) à 3 onglets (`Accueil`, `Patients`, `Planning`) avec gestion du `safe-area-inset-bottom`.
2. **Affichage Hybride des Données (`Cards` sur Mobile / `Table` sur Desktop)** :
   - Sur Mobile (`md:hidden`) : Cartes cliniques structurées avec contrôles tactiles de `44px` minimum.
   - Sur Desktop (`hidden md:block`) : Tableaux de données complets.
3. **Palette Calibrée & Primitives Réutilisables** :
   - Fond pierre chaude (`#f4f4f2`), cartes blanc pur (`#ffffff`), encre (`#0c0f12`) et accent unique sarcelle clinique (`#0d9488`).
   - Combinaison de primitives **shadcn/ui** (`Button`, `Input`, `Badge`, `Table`, `Dialog`), **Aceternity UI** (`Spotlight`, `BentoGrid`, `AnimatedTabs`) et **ReactBits** (`BorderGlow`).

## Conséquences
- Zéro défilement horizontal à `390px` (`scrollWidth === innerWidth`).
- Expérience fluide à 60 fps grâce aux animations limitées aux propriétés composites (`transform`, `opacity`).
