# ClinicFlow — Gestion des Patients & Rendez-vous

Application web **PERN** (**PostgreSQL · Express · React · Node.js**) en TypeScript permettant à une clinique de gérer ses **patients**, ses **rendez-vous**, ses **utilisateurs** (`admin` / `staff`) et un **tableau de bord** statistique.

---

## 1. Architecture & Livrables

| Livrable demandé | Emplacement |
|---|---|
| **1. Conception BDD (ERD + justifications)** | [`docs/ERD.md`](./docs/ERD.md) |
| **2. Backend API (Node + Express 5)** | [`apps/api`](./apps/api) (`routes → controllers → services → repositories`) |
| **3. Frontend (React + Vite + Tailwind + TanStack Query)** | [`apps/web`](./apps/web) |
| **4. Scripts DB / migrations PostgreSQL + Seed** | [`apps/api/db/migrations`](./apps/api/db/migrations) · [`apps/api/db/migrate.ts`](./apps/api/db/migrate.ts) · [`apps/api/db/seed.ts`](./apps/api/db/seed.ts) |
| **5. Schémas de validation Zod partagés** | [`packages/shared`](./packages/shared) |
| **Bonus : Docker Compose** | [`docker-compose.yml`](./docker-compose.yml) · [`apps/api/Dockerfile`](./apps/api/Dockerfile) · [`apps/web/Dockerfile`](./apps/web/Dockerfile) |

---

## 2. Prérequis

- **Node.js** `>= 22` et **npm** `>= 10`
- **PostgreSQL** `>= 15` :
  - soit une base PostgreSQL managée **Supabase** (recommandé — connexion *Session pooler* IPv4),
  - soit **Docker & Docker Compose** (`docker compose --profile local up`).

---

## 3. Configuration (`.env`)

Copiez le fichier d'exemple à la racine du projet :

```bash
cp .env.example .env
```

Variables principales dans `.env` :

| Variable | Description | Exemple |
|---|---|---|
| `DATABASE_URL` | URI PostgreSQL (Supabase *Session pooler* ou Postgres local) | `postgresql://postgres.<ref>:<pwd>@aws-0-<region>.pooler.supabase.com:5432/postgres` |
| `DATABASE_SSL` | `true` pour Supabase, `false` en local | `true` |
| `PORT` | Port HTTP de l'API Express | `4000` |
| `JWT_SECRET` | Secret HMAC-SHA256 d'au moins 32 caractères | `openssl rand -base64 48` |
| `JWT_EXPIRES_IN` | Durée de validité du JWT | `8h` |
| `BCRYPT_ROUNDS` | Coût de hachage bcrypt | `12` |
| `CORS_ORIGIN` | Origines autorisées (séparées par virgule) | `http://localhost:5173,http://localhost:8080` |
| `APP_TIMEZONE` | Fuseau horaire métier (« rendez-vous du jour ») | `Africa/Casablanca` |

---

## 4. Installation & Lancement en développement

```bash
# 1. Installer les dépendances des 3 workspaces
npm install

# 2. Appliquer les migrations SQL et insérer les données de test (seed)
npm run db:migrate
npm run db:seed

# 3. Démarrer en parallèle le build partagé, l'API (port 4000) et le front Vite (port 5173)
npm run dev
```

- **Frontend React** : <http://localhost:5173>
- **API REST Express** : <http://localhost:4000/api> (`GET /api/health`)

### Commandes utiles

| Commande | Action |
|---|---|
| `npm run dev` | Lance `shared` (watch), `api` (`tsx watch`) et `web` (`vite`) |
| `npm run build` | Compile `packages/shared`, `apps/api` et `apps/web` |
| `npm run typecheck` | Vérification TypeScript stricte sur tous les workspaces |
| `npm run lint` | Linter ESLint sur l'ensemble du monorepo |
| `npm run db:migrate` | Exécute les migrations SQL non appliquées (`apps/api/db/migrations/*.sql`) |
| `npm run db:seed` | Insère le jeu de données de test (1 admin, 2 staff, 5 patients, 10 RDV) |
| `npm run db:reset` | Réinitialise le schéma (hors production) puis relance migrations + seed |

---

## 5. Lancement avec Docker Compose

### Option A — Avec Supabase (par défaut)

Renseignez `DATABASE_URL` (Session pooler Supabase) et `DATABASE_SSL=true` dans `.env`, puis :

```bash
docker compose up --build
```

### Option B — 100 % local (PostgreSQL conteneurisé)

Dans `.env`, mettez `DATABASE_URL=postgresql://clinicflow:clinicflow@db:5432/clinicflow` et `DATABASE_SSL=false`, puis :

```bash
docker compose --profile local up --build
```

L'application complète est alors accessible sur **<http://localhost:8080>** (Nginx sert le SPA React et proxifie `/api/*` vers l'API Express qui applique automatiquement les migrations et le seed initial).

---

## 6. Comptes de test (Seed)

Le script `npm run db:seed` crée **1 admin**, **2 staff**, **5 patients** et **10 rendez-vous** (confirmés, en attente, annulés) :

| Rôle | Email | Mot de passe | Droits particuliers |
|---|---|---|---|
| **Admin** | `admin@clinicflow.ma` | `Admin123!` | Accès complet, y compris `DELETE /api/patients/:id` |
| **Staff** | `staff1@clinicflow.ma` | `Staff123!` | Gestion patients & RDV (suppression patient interdite → `403`) |
| **Staff** | `staff2@clinicflow.ma` | `Staff123!` | Gestion patients & RDV (suppression patient interdite → `403`) |

---

## 7. Endpoints API REST

Toutes les routes (sauf `/api/auth/login` et `/api/health`) exigent l'en-tête `Authorization: Bearer <token>`.

| Méthode | Endpoint | Rôle | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Connexion email + mot de passe → `{ token, user }` |
| `GET` | `/api/auth/me` | Authentifié | Profil de l'utilisateur courant |
| `POST` | `/api/patients` | Authentifié | Créer un patient (`cin` unique) |
| `GET` | `/api/patients?search=&page=&limit=` | Authentifié | Liste paginée + recherche `fullName` / `cin` (index trigrammes) |
| `GET` | `/api/patients/:id` | Authentifié | Détail d'un patient |
| `GET` | `/api/patients/:id/appointments` | Authentifié | Rendez-vous d'un patient |
| `PUT` | `/api/patients/:id` | Authentifié | Modifier un patient |
| `DELETE` | `/api/patients/:id` | **Admin uniquement** | Supprimer un patient (cascade sur ses rendez-vous) |
| `POST` | `/api/appointments` | Authentifié | Créer un rendez-vous (vérifie la règle des 30 min si `confirmed`) |
| `GET` | `/api/appointments?date=&status=` | Authentifié | Liste filtrée par date (`YYYY-MM-JJ`) et/ou statut |
| `PATCH` | `/api/appointments/:id/status` | Authentifié | Changer le statut (`pending`, `confirmed`, `cancelled`) |
| `GET` | `/api/dashboard/stats` | Authentifié | Compteurs : total patients, RDV du jour, pending, confirmed |
