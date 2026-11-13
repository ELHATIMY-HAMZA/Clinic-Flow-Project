# Guide de Contribution & Standards d’Ingénierie — ClinicFlow

Bienvenue sur le dépôt **ClinicFlow**. Ce document décrit le flux de travail de développement, les conventions de code et les portes de qualité (*Quality Gates*) appliquées au projet.

---

## 1. Prérequis

- **Node.js** `>= 22.0.0` et **npm** `>= 10.0.0`
- **PostgreSQL 17** (via **Supabase Session Pooler** ou **Docker Compose**)

---

## 2. Commandes du Monorepo

Toutes les commandes s’exécutent depuis la racine du dépôt :

| Commande | Description |
|---|---|
| `npm install` | Installe les dépendances de tous les workspaces (`shared`, `api`, `web`) |
| `npm run dev` | Démarre simultanément l’API Express (`:4000`) et le serveur Vite (`:5173`) |
| `npm run db:migrate` | Exécute les migrations SQL (`001` à `005`) de manière transactionnelle |
| `npm run db:seed` | Insère le jeu de données clinique de démonstration (idempotent) |
| `npm run typecheck` | Vérifie le typage TypeScript strict sur `shared`, `api` et `web` |
| `npm run lint` | Exécute ESLint (`typescript-eslint`) sur l’ensemble du monorepo |
| `npm run build` | Compile les 3 packages pour la production |

---

## 3. Conventions de Code & Architecture

1. **Source unique de validation (`@clinicflow/shared`)**
   - Toute nouvelle route ou formulaire doit d’abord définir son schéma Zod dans `packages/shared/src/index.ts`.
2. **Requêtes SQL paramétrées uniquement**
   - N’utilisez jamais d’interpolation de chaîne dans les requêtes SQL (`apps/api/src/modules/*`). Utilisez toujours des paramètres liés (`$1, $2, ...`).
3. **Design System & Responsive (`apps/web`)**
   - Respectez la palette neutre chaude (`#f4f4f2`, `#ffffff`, `#0c0f12`) et l’accent unique sarcelle clinique (`#0d9488`).
   - Chaque vue tabulaire doit proposer une vue en cartes tactiles sur mobile (`md:hidden`) et un tableau complet sur desktop (`hidden md:block`), avec des cibles tactiles d’au moins `44px`.
4. **Architecture Decision Records (`docs/adr/`)**
   - Toute décision structurante (choix de bibliothèque, schéma de base de données, sécurité) doit être documentée dans `docs/adr/` selon le modèle défini.

---

## 4. Conventions de Commits (Conventional Commits)

Nous utilisons le format **Conventional Commits** :
- `feat(patients): add trigram search on full_name and cin`
- `fix(appointments): enforce 30-minute conflict check on status update`
- `docs(adr): record GiST exclusion constraint decision`
- `ci(github): add postgres 17 integration workflow`
