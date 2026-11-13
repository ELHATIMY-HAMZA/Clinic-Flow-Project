# ADR-0003 : Garantie Anti-Chevauchement de 30 Minutes par Contrainte d’Exclusion GiST

## Statut
Accepté

## Date
2026-11-13

## Contexte
Le cahier des charges impose une règle métier critique :
> *« Empêcher deux rendez-vous `confirmed` pour le même patient dans une fenêtre de 30 minutes. »*

Une simple vérification applicative (`SELECT ...` suivi d’un `INSERT` ou `UPDATE`) est vulnérable aux conditions de course (*Time-Of-Check to Time-Of-Use* / `TOCTOU`) si deux réceptionnistes confirment simultanément deux créneaux proches pour le même patient.

## Décision
Combiner **deux niveaux de protection complémentaires** :
1. **Niveau Applicatif (`appointments.service.ts`)** : Requête SQL explicite vérifiant l’absence de rendez-vous `confirmed` pour ce `patient_id` dans l’intervalle ouvert $]t - 30\text{ min}, t + 30\text{ min}[$ avant l’insertion ou le changement de statut, retournant une erreur métier claire `409 CONFLICT` (`CONFLICT_30MIN_WINDOW`).
2. **Niveau Base de Données (`003_create_appointments.sql`)** : Activation de l’extension `btree_gist` et ajout d’une contrainte d’exclusion atomique :
   ```sql
   CONSTRAINT appointments_no_confirmed_overlap_30m
     EXCLUDE USING gist (
       patient_id WITH =,
       tstzrange(
         appointment_date - INTERVAL '15 minutes',
         appointment_date + INTERVAL '15 minutes',
         '()'
       ) WITH &&
     )
     WHERE (status = 'confirmed')
   ```
   Mathématiquement, deux rayons ouverts $]t_1 - 15\text{m}, t_1 + 15\text{m}[$ et $]t_2 - 15\text{m}, t_2 + 15\text{m}[$ se chevauchent (`&&`) si et seulement si $|t_1 - t_2| < 30\text{ minutes}$.

## Alternatives Considérées

### Vérification uniquement dans le code TypeScript (`SELECT` puis `INSERT`)
- **Avantages** : Simple à écrire.
- **Inconvénients** : Ne protège pas contre les requêtes concurrentes ni contre les écritures SQL directes.
- **Rejeté** : Insuffisant pour un système de planification médicale fiable.

### Verrouillage de table (`LOCK TABLE`) ou `SERIALIZABLE` global
- **Avantages** : Évite les conflits concurrents.
- **Inconvénients** : Dégrade fortement le débit global de l’API sous charge.
- **Rejeté** : L’index GiST partiel (`WHERE status = 'confirmed'`) ne verrouille que les entrées concernées du même patient.

## Conséquences
- Toute violation, même concurrente à la milliseconde près, est rejetée par PostgreSQL avec le code SQLSTATE `23P01` et traduite en HTTP `409 CONFLICT` par le `errorHandler`.
- Deux rendez-vous espacés d’exactement 30 minutes ($|t_1 - t_2| = 30\text{ min}$) sont autorisés grâce aux bornes ouvertes `'()'`.
