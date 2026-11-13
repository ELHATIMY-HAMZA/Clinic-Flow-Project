# Glossaire du Domaine & Vocabulaire Architectural — ClinicFlow

Ce document définit le langage ubiquitaire (*Ubiquitous Language*) et les frontières de modules de **ClinicFlow**, conformément aux pratiques de modélisation de domaine (`improve-codebase-architecture` & `documentation-and-adrs`).

---

## 1. Entités et Concepts Métier

| Terme du domaine | Identifiant technique | Définition métier & Invariants |
|---|---|---|
| **Utilisateur Clinique** (*User*) | `users` (`User`) | Collaborateur authentifié de la clinique. Possède un rôle strict : `admin` (gestion complète, suppression de dossiers) ou `receptionist` (accueil, création/modification de patients et gestion des rendez-vous). |
| **Dossier Patient** (*Patient Record*) | `patients` (`Patient`) | Fiche administrative et médicale d’un patient identifié de manière unique par son **N° CIN** (`VARCHAR(20) UNIQUE`). La suppression d’un dossier entraîne la suppression en cascade (`ON DELETE CASCADE`) de ses rendez-vous. |
| **Rendez-vous** (*Appointment*) | `appointments` (`Appointment`) | Créneau de consultation rattaché à un patient (`patient_id`) et tracé par son créateur (`created_by`). Suit un cycle de vie à 3 états : `pending` (En attente), `confirmed` (Confirmé), `cancelled` (Annulé). |
| **Fenêtre d’Exclusivité de 30 Minutes** (*30-Minute Conflict Window*) | `appointments_no_confirmed_overlap_30m` | **Règle métier critique** : un même patient ne peut jamais avoir deux rendez-vous au statut `confirmed` dont l’écart temporel est strictement inférieur à 30 minutes ($\|t_1 - t_2\| < 30\text{ min}$). |
| **Indicateurs Cliniques** (*Dashboard Stats*) | `DashboardStats` | Agrégat temps réel de l’activité : `totalPatients`, `todayAppointments`, `pendingAppointments`, `confirmedAppointments`. |

---

## 2. Modules Profonds & Frontières (*Seams*)

L’architecture du monorepo est découpée en **modules profonds** (*deep modules*) dont l’interface publique est minimale et cache la complexité d’implémentation :

1. **`@clinicflow/shared` (`packages/shared`) — Contrat Unique de Vérité**
   - **Interface** : Schémas Zod (`loginSchema`, `createPatientSchema`, `createAppointmentSchema`, `updateAppointmentStatusSchema`, etc.) et types TypeScript inférés (`z.infer`).
   - **Profondeur** : Garantit zéro dérive entre la validation d’entrée de l’API Express 5 et les formulaires React 19.
2. **Module `appointments` (`apps/api/src/modules/appointments`) — Moteur de Planification Anti-Conflit**
   - **Interface** : `createAppointment()`, `listAppointments()`, `updateStatus()`, `listByPatient()`.
   - **Profondeur** : Encapsule la double barrière anti-conflit de 30 minutes :
     1. Vérification applicative SQL explicite (`appointment_date > $2::timestamptz - INTERVAL '30 minutes' AND appointment_date < $2::timestamptz + INTERVAL '30 minutes'`).
     2. Contrainte atomique PostgreSQL `EXCLUDE USING gist` (`23P01`) empêchant toute condition de course (*race condition*) lors de requêtes concurrentes.
3. **Module `patients` (`apps/api/src/modules/patients`) — Répertoire Clinique Haute Performance**
   - **Interface** : `listPatients({ page, limit, search })`, `getPatientById()`, `createPatient()`, `updatePatient()`, `deletePatient()`.
   - **Profondeur** : Exploite l’extension PostgreSQL `pg_trgm` et des index GIN sur `full_name` et `cin` pour offrir une recherche floue (`ILIKE`) instantanée en $O(\log N)$.
4. **Couche d’Accès Données (`apps/api/src/config/db.ts`) — Adaptateur PostgreSQL / Supabase**
   - **Interface** : `query<T>(text, params)` et `withTransaction<T>(fn)`.
   - **Profondeur** : Normalise automatiquement les chaînes de connexion (`normalizeConnectionString`), gère TLS/SSL pour le *Supabase Session Pooler* et journalise les requêtes lentes en développement.
