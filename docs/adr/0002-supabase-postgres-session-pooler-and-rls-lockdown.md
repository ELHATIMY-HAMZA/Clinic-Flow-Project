# ADR-0002 : Hébergement PostgreSQL sur Supabase (Session Pooler) et Verrouillage RLS

## Statut
Accepté

## Date
2026-11-13

## Contexte
Nous souhaitions utiliser **Supabase** comme infrastructure de base de données managée en cloud tout en respectant strictement les exigences techniques du cahier des charges ClinicFlow :
1. Backend Node.js + Express autonome exposant `/api/auth/login`, `/api/patients`, `/api/appointments`, `/api/dashboard/stats`.
2. Authentification personnalisée par **JWT** et hachage **bcrypt** sur une table `users` dédiée (`admin` / `staff`).
3. Compatibilité réseau universelle (IPv4 et IPv6) depuis les postes de développement et conteneurs Docker.

Par ailleurs, Supabase expose par défaut une API PostgREST (`Data API`) sur le schéma `public`, qui génère des alertes de sécurité si le *Row Level Security* (`RLS`) n’est pas activé sur les tables publiques.

## Décision
1. Utiliser **Supabase uniquement comme hôte PostgreSQL 17 managé** via le **Session Pooler** (`aws-1-eu-west-2.pooler.supabase.com:5432`, compatible IPv4/IPv6 avec TLS `DATABASE_SSL=true`).
2. Implémenter dans `apps/api/src/config/db.ts` une fonction `normalizeConnectionString()` qui encode automatiquement les caractères spéciaux éventuels (`@`, `?`, `#`) présents dans le mot de passe de `DATABASE_URL`.
3. Appliquer la migration `005_lockdown_data_api.sql` qui active `ROW LEVEL SECURITY` sur toutes les tables (`users`, `patients`, `appointments`, `schema_migrations`) et révoque tous les privilèges des rôles PostgREST (`anon`, `authenticated`).

## Alternatives Considérées

### Utiliser le SDK client `@supabase/supabase-js` directement depuis React
- **Avantages** : Moins de code backend à écrire.
- **Inconvénients** : Contredit l’exigence d’une architecture 3-tiers avec API REST Express, middleware JWT personnalisé et logique métier côté serveur.
- **Rejeté** : Non conforme au cahier des charges.

### Connexion directe Supabase (`db.<ref>.supabase.co:5432`)
- **Avantages** : Connexion directe sans pooler intermédiaire.
- **Inconvénients** : Résout uniquement en **IPv6** par défaut, ce qui échoue sur la majorité des réseaux FAI et conteneurs Docker IPv4.
- **Rejeté** : Le *Session Pooler* en port `5432` supporte IPv4 et toutes les fonctionnalités de session PostgreSQL.

## Conséquences
- L’application fonctionne aussi bien sur Supabase Cloud qu’avec un conteneur `postgres:17-alpine` local (`docker compose up`).
- Le *Security Advisor* de Supabase affiche **0 vulnérabilité** grâce au verrouillage RLS.
